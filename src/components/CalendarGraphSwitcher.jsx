import { Box, Tabs, Tab, Paper } from "@mui/material";
import ExpenseCalendar from "./ExpenseCalendar";
import ExpenseMonthlyGraph from "./ExpenseMonthlyGraph";

const CalendarGraphSwitcher = ({
  view,
  setView,
  calendarProps,
  graphProps,
}) => {
  return (
    <Paper sx={{ p: 2 , height: "546.25px"}}>
      <Tabs
        value={view}
        onChange={(e, v) => setView(v)}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="Calendar" value="calendar" />
        <Tab label="Graph" value="graph" />
      </Tabs>

      <Box>
        {view === "calendar" && <ExpenseCalendar {...calendarProps} />}
        {view === "graph" && <ExpenseMonthlyGraph {...graphProps} />}
      </Box>
    </Paper>
  );
};

export default CalendarGraphSwitcher;
