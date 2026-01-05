import { useEffect, useMemo, useState } from "react";
import {
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
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";

const ExpenseDetailDialogBox = (props) => {
return(
    <>
    <Dialog open={Boolean(props.selectedExpense)} onClose={props.handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>Expense Details</DialogTitle>
        <DialogContent dividers>
          {props.selectedExpense && (
            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Date</Typography>
                <Typography variant="body1">{props.selectedExpense.date}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Category</Typography>
                <Typography variant="body1">{props.selectedExpense.category}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="body1">{props.selectedExpense.description || "(No description)"}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Amount</Typography>
                <Typography variant="body1">₹{Number(props.selectedExpense.amount).toFixed(2)}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
);
}

export default ExpenseDetailDialogBox;