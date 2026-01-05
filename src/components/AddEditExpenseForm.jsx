import {
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Paper,
  Chip
} from "@mui/material";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";

const AddEditExpenseForm = (props) => {
return(
    <>
    <Paper sx={{ p: 2 }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", mb: 1, gap: { xs: 0.5, sm: 0 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {props.editingId === null ? "Add Expense" : "Edit Expense"}
                  </Typography>
                  {props.editingId !== null && (
                    <Box sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
                      <Chip label={`Editing #${props.editingId}`} size="small" color="secondary" variant="outlined" />
                    </Box>
                  )}
                </Box>
                <Box component="form" onSubmit={props.handleSubmit} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, minmax(0, 1fr))" }, gap: { xs: 1.5, sm: 2 }, alignItems: "center" }}>
                  <TextField label="Date" type="date" value={props.date} onChange={(e) => props.setDate(e.target.value)} InputLabelProps={{ shrink: true }} required fullWidth size="small" />
                  <TextField select label="Category" value={props.category} onChange={(e) => props.setCategory(e.target.value)} required fullWidth size="small">
                    {props.DEFAULT_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField label="Description" value={props.description} onChange={(e) => props.setDescription(e.target.value)} fullWidth size="small" />
                  <TextField label="Amount" type="number" value={props.amount} onChange={(e) => props.setAmount(e.target.value)} inputProps={{ step: "0.01" }} required fullWidth size="small" />
    
                  <Box sx={{ gridColumn: "1 / -1", display: "flex", flexDirection: { xs: "column-reverse", sm: "row" }, justifyContent: "flex-end", gap: 1, mt: { xs: 0.5, sm: 1 } }}>
                    {props.editingId !== null && (
                      <Button variant="text" onClick={props.handleCancelEdit} fullWidth={true} sx={{ maxWidth: { xs: "100%", sm: "auto" } }}>
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" variant="contained" fullWidth={true} sx={{ maxWidth: { xs: "100%", sm: "auto" } }}>
                      {props.editingId === null ? "Add" : "Update"}
                    </Button>
                  </Box>
                </Box>
              </Paper>
    </>
);
}

export default AddEditExpenseForm;