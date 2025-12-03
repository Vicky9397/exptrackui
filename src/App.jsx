import { useEffect, useState } from "react";
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

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Entertainment",
  "Other",
];

function App() {
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
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

  const totalAmount = expenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

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
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: { xs: 2, sm: 3 },
        }}
        elevation={3}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            mb: 1,
            gap: { xs: 0.5, sm: 0 },
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {editingId === null ? "Add Expense" : "Edit Expense"}
          </Typography>
          {editingId !== null && (
            <Box sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
              <Chip
                label={`Editing #${editingId}`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Box>
          )}
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(4, minmax(0, 1fr))" },
            gap: { xs: 1.5, sm: 2 },
            alignItems: "center",
          }}
        >
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
            size="small"
          />
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            fullWidth
            size="small"
          >
            {DEFAULT_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ step: "0.01" }}
            required
            fullWidth
            size="small"
          />

          <Box
            sx={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: { xs: "column-reverse", sm: "row" },
              justifyContent: "flex-end",
              gap: 1,
              mt: { xs: 0.5, sm: 1 },
            }}
          >
            {editingId !== null && (
              <Button
                variant="text"
                onClick={handleCancelEdit}
                fullWidth={true}
                sx={{ maxWidth: { xs: "100%", sm: "auto" } }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth={true}
              sx={{ maxWidth: { xs: "100%", sm: "auto" } }}
            >
              {editingId === null ? "Add" : "Update"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Summary */}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: { xs: 2, sm: 3 },
        }}
        elevation={2}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Summary
        </Typography>
        <Stack
          direction="row"
          flexWrap="wrap"
          spacing={1}
          useFlexGap
          sx={{ mb: 1 }}
        >
          <Chip
            label={`Total: ₹${totalAmount.toFixed(2)}`}
            color="primary"
            variant="filled"
            size="small"
          />
          {summary.map((s) => (
            <Chip
              key={s.category}
              label={`${s.category}: ₹${Number(s.total).toFixed(2)}`}
              variant="outlined"
              size="small"
            />
          ))}
        </Stack>
      </Paper>

      {/* Expenses Table */}
      <Paper
        sx={{
          p: { xs: 1, sm: 2 },
        }}
        elevation={2}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            mb: 1,
            gap: { xs: 0.5, sm: 0 },
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Recent Expenses
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: { xs: "left", sm: "right" } }}
          >
            {loading
              ? "Loading..."
              : `${expenses.length} item${expenses.length !== 1 ? "s" : ""}`}
          </Typography>
        </Box>
        <Divider sx={{ mb: 1 }} />

        <TableContainer
          sx={{
            maxHeight: { xs: "55vh", sm: "60vh" },
            overflowX: "auto",
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Date</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  Amount (₹)
                </TableCell>
                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((e) => (
                <TableRow
                  key={e.id}
                  hover
                  onClick={() => handleRowClick(e)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{e.date}</TableCell>
                  <TableCell>{e.category}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: { xs: 120, sm: "auto" },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {e.description}
                  </TableCell>
                  <TableCell align="right">
                    {Number(e.amount).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      aria-label="edit"
                      onClick={(event) => {
                        event.stopPropagation(); // don't trigger row click
                        handleEdit(e);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="delete"
                      onClick={(event) => {
                        event.stopPropagation(); // don't trigger row click
                        handleDelete(e.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="caption">
                      No expenses yet. Add your first one above.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Row Details Dialog */}
      <Dialog
        open={Boolean(selectedExpense)}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Expense Details</DialogTitle>
        <DialogContent dividers>
          {selectedExpense && (
            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">{selectedExpense.date}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1">
                  {selectedExpense.category}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">
                  {selectedExpense.description || "(No description)"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1">
                  ₹{Number(selectedExpense.amount).toFixed(2)}
                </Typography>
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
