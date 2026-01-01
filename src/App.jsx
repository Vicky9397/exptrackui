import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Divider,
  Chip,
  Stack,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { api } from "./api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar-style-override.css";

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Entertainment",
  "Other",
];

const MONTHS = [
  { value: "", label: "All" },
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

function App() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  // null = adding new; number = editing that expense id
  const [editingId, setEditingId] = useState(null);

  // For row details popup
  const [selectedExpense, setSelectedExpense] = useState(null);

  const today = new Date();
const CURRENT_MONTH = String(today.getMonth() + 1).padStart(2, "0");
const CURRENT_YEAR = String(today.getFullYear());

  // --- FILTER STATES ---
  const [filterCategory, setFilterCategory] = useState(""); // "" = all
  const [filterMonth, setFilterMonth] = useState(CURRENT_MONTH); // "" = all
  const [filterYear, setFilterYear] = useState(CURRENT_YEAR); // "" = all
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get("/summary");
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, []);

  const resetForm = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setCategory("Food");
    setDescription("");
    setAmount("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;

    const payload = {
      date,
      category,
      description,
      amount: parseFloat(amount),
    };

    try {
      if (editingId === null) {
        // Add new
        await api.post("/expenses", payload);
      } else {
        // Update existing
        await api.put(`/expenses/${editingId}`, payload);
      }

      await fetchExpenses();
      await fetchSummary();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      await fetchExpenses();
      await fetchSummary();
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setDate(expense.date);
    setCategory(expense.category);
    setDescription(expense.description || "");
    setAmount(String(expense.amount));
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleRowClick = (expense) => {
    setSelectedExpense(expense);
  };

  const handleCloseDialog = () => {
    setSelectedExpense(null);
  };

  // Helper to safely read YYYY and MM from an expense date string
  const getYearMonth = (dateStr) => {
    // expecting ISO yyyy-mm-dd or similar
    if (!dateStr) return { year: "", month: "" };
    const parts = dateStr.split("-");
    if (parts.length >= 2) {
      return { year: parts[0], month: parts[1] };
    }
    try {
      const d = new Date(dateStr);
      return { year: String(d.getFullYear()), month: String(d.getMonth() + 1).padStart(2, "0") };
    } catch (e) {
      return { year: "", month: "" };
    }
  };

  // Derived filtered list (client-side filtering)
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // category filter
      if (filterCategory && e.category !== filterCategory) return false;

      // month/year filter
      const { year, month } = getYearMonth(e.date);
      if (filterYear && filterYear !== year) return false;
      if (filterMonth && filterMonth !== month) return false;

      // date range filter (from/to inclusive)
      if (filterDateFrom) {
        // compare as strings yyyy-mm-dd works lexicographically
        if (e.date < filterDateFrom) return false;
      }
      if (filterDateTo) {
        if (e.date > filterDateTo) return false;
      }

      return true;
    });
  }, [expenses, filterCategory, filterMonth, filterYear, filterDateFrom, filterDateTo]);

  // totals for filtered data
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const clearFilters = () => {
    setFilterCategory("");
    setFilterMonth(CURRENT_MONTH);
    setFilterYear(CURRENT_YEAR);
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  // Build year options from existing expenses so the dropdown is relevant
  const yearOptions = useMemo(() => {
  const years = new Set();

  // years from expense data
  expenses.forEach((e) => {
    const { year } = getYearMonth(e.date);
    if (year) years.add(year);
  });

  // ALWAYS include current year
  const currentYear = String(new Date().getFullYear());
  years.add(currentYear);

  return Array.from(years).sort((a, b) => b - a);
}, [expenses]);


  const categoryChartData = useMemo(() => {
  const map = {};
  filteredExpenses.forEach((e) => {
    map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
  });

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }));
}, [filteredExpenses]);

const monthlyData = useMemo(() => {
  const map = {};
  filteredExpenses.forEach((e) => {
    const [year, month] = e.date.split("-");
    const key = `${year}-${month}`;

    if (!map[key]) {
      map[key] = { total: 0, daily: {} };
    }

    map[key].total += Number(e.amount || 0);
    map[key].daily[e.date] =
      (map[key].daily[e.date] || 0) + Number(e.amount || 0);
  });

  return map;
}, [filteredExpenses]);


const toLocalDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getDayPercentage = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const key = `${year}-${month}`;

  const dateKey = toLocalDateKey(date);

  const monthData = monthlyData[key];
  if (!monthData || !monthData.total) return 0;

  const dayAmount = monthData.daily[dateKey] || 0;
  return {p: (dayAmount / monthData.total) * 100, a: dayAmount};
};



const getTileColorByPercentage = (percent) => {
  if (percent === 0) return null;
  if (percent < 5) return "#e3f2fd";
  if (percent < 10) return "#90caf9";
  if (percent < 20) return "#42a5f5";
  return "#1565c0";
};

  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: 600, textAlign: { xs: "center", sm: "left" } }}
      >
        Expense Tracker
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
        sx={{ textAlign: { xs: "center", sm: "left" }, mb: 2 }}
      >
        Simple daily expense tracker – Python + React + MUI
      </Typography>

      {/* Add / Edit Expense Form */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }} elevation={3}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", mb: 1, gap: { xs: 0.5, sm: 0 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {editingId === null ? "Add Expense" : "Edit Expense"}
          </Typography>
          {editingId !== null && (
            <Box sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
              <Chip label={`Editing #${editingId}`} size="small" color="secondary" variant="outlined" />
            </Box>
          )}
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, minmax(0, 1fr))" }, gap: { xs: 1.5, sm: 2 }, alignItems: "center" }}>
          <TextField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} required fullWidth size="small" />
          <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} required fullWidth size="small">
            {DEFAULT_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth size="small" />
          <TextField label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} inputProps={{ step: "0.01" }} required fullWidth size="small" />

          <Box sx={{ gridColumn: "1 / -1", display: "flex", flexDirection: { xs: "column-reverse", sm: "row" }, justifyContent: "flex-end", gap: 1, mt: { xs: 0.5, sm: 1 } }}>
            {editingId !== null && (
              <Button variant="text" onClick={handleCancelEdit} fullWidth={true} sx={{ maxWidth: { xs: "100%", sm: "auto" } }}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="contained" fullWidth={true} sx={{ maxWidth: { xs: "100%", sm: "auto" } }}>
              {editingId === null ? "Add" : "Update"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Filters Panel */}
      <Paper sx={{ p: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 3 } }} elevation={2}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(5, minmax(0, 1fr))" } }}>
          <TextField select label="Category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} size="small">
            <MenuItem value="">All</MenuItem>
            {DEFAULT_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <TextField select label="Month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} size="small">
            {MONTHS.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField select label="Year" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} size="small">
            <MenuItem value="">All</MenuItem>
            {yearOptions.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>

          <TextField label="From" type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />

          <TextField label="To" type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />

          <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button onClick={clearFilters} variant="outlined" size="small">
              Clear
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Summary (reflects filtered data) */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }} elevation={2}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Summary
        </Typography>
        <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mb: 1 }}>
          <Chip label={`Total: ₹${totalAmount.toFixed(2)}`} color="primary" variant="filled" size="small" />
          {/* show per-category totals for filtered data */}
          {Array.from(
            filteredExpenses.reduce((map, e) => {
              const prev = map.get(e.category) || 0;
              map.set(e.category, prev + Number(e.amount || 0));
              return map;
            }, new Map())
          ).map(([cat, tot]) => (
            <Chip key={cat} label={`${cat}: ₹${tot.toFixed(2)}`} variant="outlined" size="small" />
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Showing {filteredExpenses.length} of {expenses.length} item{expenses.length !== 1 ? "s" : ""}
        </Typography>
      </Paper>

      {/* pie chart */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
    Expenses by Category
  </Typography>

  {categoryChartData.length === 0 ? (
    <Typography variant="caption">No data</Typography>
  ) : (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={categoryChartData}
          dataKey="value"
          nameKey="name"
          outerRadius={90}
          label
        >
          {categoryChartData.map((_, index) => (
            <Cell
              key={index}
              fill={[
                "#1976d2",
                "#9c27b0",
                "#ff9800",
                "#4caf50",
                "#f44336",
                "#607d8b",
              ][index % 6]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )}
</Paper>

      {/* calendar view */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
    Monthly Expense Calendar
  </Typography>

  <Calendar
  view="month"
  tileClassName={({ date }) => {
    const dayData = getDayPercentage(date);

    if (dayData.p >= 20) return "high-spend";
    if (dayData.p >= 10) return "medium-spend";
    if (dayData.p >= 5) return "low-spend";
    if (dayData.p > 0) return "very-low-spend";

    return null;
  }}
  tileContent={({ date }) => {
    const dayData = getDayPercentage(date);
    if (!dayData.p) return null;

    return (
      <Box title={`${dayData.p.toFixed(1)}% of monthly spend (₹ ${dayData.a.toFixed(2)})`}>
        <Typography variant="caption">
          {dayData.p.toFixed(1)}%
        </Typography>
      </Box>
    );
  }}
/>

</Paper>


      {/* Expenses Table (shows filteredExpenses) */}
      <Paper sx={{ p: { xs: 1, sm: 2 } }} elevation={2}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", mb: 1, gap: { xs: 0.5, sm: 0 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Recent Expenses
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: { xs: "left", sm: "right" } }}>
            {loading ? "Loading..." : `${filteredExpenses.length} item${filteredExpenses.length !== 1 ? "s" : ""}`}
          </Typography>
        </Box>
        <Divider sx={{ mb: 1 }} />

        <TableContainer sx={{ maxHeight: { xs: "55vh", sm: "60vh" }, overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Date</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>Amount (₹)</TableCell>
                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.map((e) => (
                <TableRow key={e.id} hover onClick={() => handleRowClick(e)} sx={{ cursor: "pointer" }}>
                  <TableCell>{e.date}</TableCell>
                  <TableCell>{e.category}</TableCell>
                  <TableCell sx={{ maxWidth: { xs: 120, sm: "auto" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description}</TableCell>
                  <TableCell align="right">{Number(e.amount).toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" aria-label="edit" onClick={(event) => { event.stopPropagation(); handleEdit(e); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="delete" onClick={(event) => { event.stopPropagation(); handleDelete(e.id); }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredExpenses.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="caption">No expenses for selected filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Row Details Dialog */}
      <Dialog open={Boolean(selectedExpense)} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>Expense Details</DialogTitle>
        <DialogContent dividers>
          {selectedExpense && (
            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Date</Typography>
                <Typography variant="body1">{selectedExpense.date}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Category</Typography>
                <Typography variant="body1">{selectedExpense.category}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="body1">{selectedExpense.description || "(No description)"}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Amount</Typography>
                <Typography variant="body1">₹{Number(selectedExpense.amount).toFixed(2)}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
