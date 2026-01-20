import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Typography } from "@mui/material";

const ExpenseMonthlyGraph = ({ dailyData }) => {
  if (!dailyData || dailyData.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No data for selected period
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Daily Expense Trend
      </Typography>

      <ResponsiveContainer width="100%" height={430}>
        <LineChart data={dailyData}>
  <XAxis
    dataKey="date"
    tick={{ fontSize: 12 }}
    tickFormatter={(v) => v.split("-")[2]} // day only
  />

  <YAxis
    tickCount={8}
    domain={[0, "dataMax"]}
    tickFormatter={(v) => `₹${Number(v).toFixed(0)}`}
  />

  <Tooltip
    formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Amount"]}
    labelFormatter={(label) => label}
  />

  <Line
    type="linear"        // 🔴 IMPORTANT: no smoothing
    dataKey="amount"
    strokeWidth={2}
    dot={{ r: 3 }}
    activeDot={{ r: 5 }}
  />
</LineChart>

      </ResponsiveContainer>
    </>
  );
};

export default ExpenseMonthlyGraph;
