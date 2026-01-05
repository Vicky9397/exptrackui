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

const ExpensePieChart = (props) => {
return(
    <>
    <Paper sx={{ p: 2 }}>
              {/* Pie Chart */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Expenses by Category
              </Typography>

              {props.categoryChartData.length === 0 ? (
                <Typography variant="caption">No data</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={props.categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {props.categoryChartData.map((_, index) => (
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
    </>
);
}

export default ExpensePieChart;