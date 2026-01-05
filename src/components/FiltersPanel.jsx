import {
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Paper
} from "@mui/material";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";

const FiltersPanel = (props) => {
return(
    <>
    <Paper sx={{ p: 2 }}>
                {/* Filters */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Filters
                </Typography>
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(5, minmax(0, 1fr))" } }}>
                  <TextField select label="Category" value={props.filterCategory} onChange={(e) => props.setFilterCategory(e.target.value)} size="small">
                    <MenuItem value="">All</MenuItem>
                    {props.DEFAULT_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
    
                  <TextField select label="Month" value={props.filterMonth} onChange={(e) => props.setFilterMonth(e.target.value)} size="small">
                    {props.MONTHS.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </TextField>
    
                  <TextField select label="Year" value={props.filterYear} onChange={(e) => props.setFilterYear(e.target.value)} size="small">
                    <MenuItem value="">All</MenuItem>
                    {props.yearOptions.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </TextField>
    
                  <TextField label="From" type="date" value={props.filterDateFrom} onChange={(e) => props.setFilterDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
    
                  <TextField label="To" type="date" value={props.filterDateTo} onChange={(e) => props.setFilterDateTo(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
    
                  <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    <Button onClick={props.clearFilters} variant="outlined" size="small">
                      Clear
                    </Button>
                  </Box>
                </Box>
              </Paper>
    </>
);
}

export default FiltersPanel;