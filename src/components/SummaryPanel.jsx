import {
  Typography,
  Paper,
  Chip,
  Stack
} from "@mui/material";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";

const SummaryPanel = (props) => {
return(
    <>
    <Paper sx={{ p: 2 }}>
            {/* Summary */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Summary
            </Typography>
            <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mb: 1 }}>
              <Chip label={`Total: ₹${props.totalAmount.toFixed(2)}`} color="primary" variant="filled" size="small" />
              {/* show per-category totals for filtered data */}
              {Array.from(
                props.filteredExpenses.reduce((map, e) => {
                  const prev = map.get(e.category) || 0;
                  map.set(e.category, prev + Number(e.amount || 0));
                  return map;
                }, new Map())
              ).map(([cat, tot]) => (
                <Chip key={cat} label={`${cat}: ₹${tot.toFixed(2)}`} variant="outlined" size="small" />
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Showing {props.filteredExpenses.length} of {props.monthlyExpenses.length} item{props.monthlyExpenses.length !== 1 ? "s" : ""}
            </Typography>
          </Paper>
    </>
);
}

export default SummaryPanel;