import {
  Typography,
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Divider,
  TableContainer
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";

const RecentExpensesTable = (props) => {
return(
    <>
    <Paper sx={{ p: 2 , height: "881.33px"}}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", mb: 1, gap: { xs: 0.5, sm: 0 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Recent Expenses
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: { xs: "left", sm: "right" } }}>
                {props.loading ? "Loading..." : `${props.filteredExpenses.length} item${props.filteredExpenses.length !== 1 ? "s" : ""}`}
              </Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />

            <TableContainer sx={{ height: { xs: "881.33px", sm: "881.33px" }, overflowX: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>Date</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>Amount (₹)</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {props.filteredExpenses.map((e) => (
                    <TableRow key={e.id} hover onClick={() => props.handleRowClick(e)} sx={{ cursor: "pointer" }}>
                      <TableCell>{e.date}</TableCell>
                      <TableCell>{e.category}</TableCell>
                      <TableCell sx={{ maxWidth: { xs: 120, sm: "auto" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description}</TableCell>
                      <TableCell align="right">{Number(e.amount).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" aria-label="edit" onClick={(event) => { event.stopPropagation(); props.handleEdit(e); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" aria-label="delete" onClick={(event) => { event.stopPropagation(); props.handleDelete(e.id); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {props.filteredExpenses.length === 0 && !props.loading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="caption">No expenses for selected filters.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
    </>
);
}

export default RecentExpensesTable;