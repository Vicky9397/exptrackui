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
      // If deleting the one you're editing, reset form
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

  const totalAmount = expenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Expense Tracker
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Simple daily expense tracker – Python + React + MUI
      </Typography>

      {/* Add / Edit Expense Form */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={3}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {editingId === null ? "Add Expense" : "Edit Expense"}
          </Typography>
          {editingId !== null && (
            <Chip
              label={`Editing #${editingId}`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" },
            gap: 2,
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
          />
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
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
          />
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ step: "0.01" }}
            required
          />

          <Box
            sx={{
              gridColumn: { xs: "1 / -1", sm: "1 / -1" },
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            {editingId !== null && (
              <Button variant="text" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="contained">
              {editingId === null ? "Add" : "Update"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Summary */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
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
          />
          {summary.map((s) => (
            <Chip
              key={s.category}
              label={`${s.category}: ₹${Number(s.total).toFixed(2)}`}
              variant="outlined"
            />
          ))}
        </Stack>
      </Paper>

      {/* Expenses Table */}
      <Paper sx={{ p: 2 }} elevation={2}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h6">Recent Expenses</Typography>
          <Typography variant="body2" color="text.secondary">
            {loading
              ? "Loading..."
              : `${expenses.length} item${expenses.length !== 1 ? "s" : ""}`}
          </Typography>
        </Box>
        <Divider sx={{ mb: 1 }} />

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount (₹)</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((e) => (
              <TableRow key={e.id} hover>
                <TableCell>{e.date}</TableCell>
                <TableCell>{e.category}</TableCell>
                <TableCell>{e.description}</TableCell>
                <TableCell align="right">
                  {Number(e.amount).toFixed(2)}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(e)}
                    aria-label="edit"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(e.id)}
                    aria-label="delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {expenses.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No expenses yet. Add your first one above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default App;
