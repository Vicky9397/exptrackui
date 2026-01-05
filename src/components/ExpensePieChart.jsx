import {
  Typography,
  Paper,
  Box
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";

const ExpensePieChart = (props) => {
return(
    <>
    <Paper sx={{ p: 2, height: "318px" }}>
  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
    Expenses by Category
  </Typography>

  <Box
    sx={{
      height: "calc(100% - 32px)", // subtract title height
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {props.categoryChartData.length === 0 ? (
      <Typography variant="caption" color="text.secondary">
        No data
      </Typography>
    ) : (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart style={{height: '262px'}}>
          <Pie
            data={props.categoryChartData}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            label={({ value }) => `₹${value.toFixed(2)}`}
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
  </Box>
</Paper>

    </>
);
}

export default ExpensePieChart;