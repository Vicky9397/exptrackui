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
import "../calendar-style-override.css";

const ExpenseCalendar = (props) => {
return(
    <>
    <Paper sx={{ p: 2 }}>
              {/* Calendar */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Monthly Expense Calendar
              </Typography>

              <Calendar
                view="month"
                tileClassName={({ date }) => {
                  const dayData = props.getDayPercentage(date);

                  if (dayData.p >= 20) return "high-spend";
                  if (dayData.p >= 10) return "medium-spend";
                  if (dayData.p >= 5) return "low-spend";
                  if (dayData.p > 0) return "very-low-spend";

                  return null;
                }}
                tileContent={({ date }) => {
                  const dayData = props.getDayPercentage(date);
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
    </>
);
}

export default ExpenseCalendar;