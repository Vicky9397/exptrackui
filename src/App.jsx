import { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Box
} from "@mui/material";
import { api } from "./api";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AddEditExpenseForm from "./components/AddEditExpenseForm";
import FiltersPanel from "./components/FiltersPanel";
import SummaryPanel from "./components/SummaryPanel";
import RecentExpensesTable from "./components/RecentExpensesTable";
import ExpensePieChart from "./components/ExpensePieChart";
import CalendarGraphSwitcher from "./components/CalendarGraphSwitcher";
import ExpenseDetailDialogBox from "./components/ExpenseDetailDialogBox";


const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Entertainment",
  "Other",
];

const MONTHS = [
  { value: "", label: "All" },
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

function App() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rightPanelView, setRightPanelView] = useState("calendar");
// "calendar" | "graph"


  // null = adding new; number = editing that expense id
  const [editingId, setEditingId] = useState(null);

  // For row details popup
  const [selectedExpense, setSelectedExpense] = useState(null);

  const today = new Date();
  const CURRENT_MONTH = String(today.getMonth() + 1).padStart(2, "0");
  const CURRENT_YEAR = String(today.getFullYear());

  // --- FILTER STATES ---
  const [filterCategory, setFilterCategory] = useState(""); // "" = all
  const [filterMonth, setFilterMonth] = useState(CURRENT_MONTH); // "" = all
  const [filterYear, setFilterYear] = useState(CURRENT_YEAR); // "" = all
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const resetForm = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setCategory("Food");
    setDescription("");
    setAmount("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;

    const payload = {
      date,
      category,
      description,
      amount: parseFloat(amount),
    };

    try {
      if (editingId === null) {
        // Add new
        await api.post("/expenses", payload);
      } else {
        // Update existing
        await api.put(`/expenses/${editingId}`, payload);
      }

      await fetchExpenses();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      await fetchExpenses();
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setDate(expense.date);
    setCategory(expense.category);
    setDescription(expense.description || "");
    setAmount(String(expense.amount));
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleRowClick = (expense) => {
    setSelectedExpense(expense);
  };

  const handleCloseDialog = () => {
    setSelectedExpense(null);
  };

  // Helper to safely read YYYY and MM from an expense date string
  const getYearMonth = (dateStr) => {
    // expecting ISO yyyy-mm-dd or similar
    if (!dateStr) return { year: "", month: "" };
    const parts = dateStr.split("-");
    if (parts.length >= 2) {
      return { year: parts[0], month: parts[1] };
    }
    try {
      const d = new Date(dateStr);
      return { year: String(d.getFullYear()), month: String(d.getMonth() + 1).padStart(2, "0") };
    } catch (e) {
      return { year: "", month: "" };
    }
  };

  const monthlyExpenses = useMemo(() => {
    if (!filterMonth || !filterYear) return [];

    return expenses.filter((e) => {
      const { year, month } = getYearMonth(e.date);
      return year === filterYear && month === filterMonth;
    });
  }, [expenses, filterMonth, filterYear]);

  // Derived filtered list (client-side filtering)
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // category filter
      if (filterCategory && e.category !== filterCategory) return false;

      // month/year filter
      const { year, month } = getYearMonth(e.date);
      if (filterYear && filterYear !== year) return false;
      if (filterMonth && filterMonth !== month) return false;

      // date range filter (from/to inclusive)
      if (filterDateFrom) {
        // compare as strings yyyy-mm-dd works lexicographically
        if (e.date < filterDateFrom) return false;
      }
      if (filterDateTo) {
        if (e.date > filterDateTo) return false;
      }

      return true;
    });
  }, [expenses, filterCategory, filterMonth, filterYear, filterDateFrom, filterDateTo]);

  // totals for filtered data
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const clearFilters = () => {
    setFilterCategory("");
    setFilterMonth(CURRENT_MONTH);
    setFilterYear(CURRENT_YEAR);
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  // Build year options from existing expenses so the dropdown is relevant
  const yearOptions = useMemo(() => {
    const years = new Set();

    // years from expense data
    expenses.forEach((e) => {
      const { year } = getYearMonth(e.date);
      if (year) years.add(year);
    });

    // ALWAYS include current year
    const currentYear = String(new Date().getFullYear());
    years.add(currentYear);

    return Array.from(years).sort((a, b) => b - a);
  }, [expenses]);


  const categoryChartData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredExpenses]);

  const monthlyData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      const [year, month] = e.date.split("-");
      const key = `${year}-${month}`;

      if (!map[key]) {
        map[key] = { total: 0, daily: {} };
      }

      map[key].total += Number(e.amount || 0);
      map[key].daily[e.date] =
        (map[key].daily[e.date] || 0) + Number(e.amount || 0);
    });

    return map;
  }, [filteredExpenses]);

  const calendarDate = useMemo(() => {
  if (filterYear && filterMonth) {
    return new Date(`${filterYear}-${filterMonth}-01`);
  }

  if (filterYear && !filterMonth) {
    return new Date(`${filterYear}-01-01`);
  }

  return new Date(); // fallback (current month)
}, [filterYear, filterMonth]);

const dailyGraphData = useMemo(() => {
  if (!filterYear || !filterMonth) return [];

  return filteredExpenses
    .filter((e) => {
      const { year, month } = getYearMonth(e.date);
      return year === filterYear && month === filterMonth;
    })
    .reduce((acc, e) => {
      const existing = acc.find((d) => d.date === e.date);
      if (existing) {
        existing.amount += Number(e.amount || 0);
      } else {
        acc.push({ date: e.date, amount: Number(e.amount || 0) });
      }
      return acc;
    }, [])
    .sort((a, b) => a.date.localeCompare(b.date));
}, [filteredExpenses, filterYear, filterMonth]);




  const toLocalDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getDayPercentage = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;

    const dateKey = toLocalDateKey(date);

    const monthData = monthlyData[key];
    if (!monthData || !monthData.total) return 0;

    const dayAmount = monthData.daily[dateKey] || 0;
    return { p: (dayAmount / monthData.total) * 100, a: dayAmount };
  };

  const handleCalendarMonthChange = (date) => {
  setFilterYear(String(date.getFullYear()));
  setFilterMonth(String(date.getMonth() + 1).padStart(2, "0"));
};

  return (
    <Box
      className="container-fluid px-3 py-3"
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: 600, textAlign: { xs: "center", sm: "left" } }}
      >
        Expense Tracker
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
        sx={{ textAlign: { xs: "center", sm: "left" }, mb: 2 }}
      >
        Simple daily expense tracker – Python + React + MUI
      </Typography>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          {/* Add / Edit Expense Form */}
          <AddEditExpenseForm 
          editingId={editingId} 
          handleSubmit={handleSubmit} 
          date={date} 
          setDate={setDate}
          category={category}
          setCategory={setCategory}
          DEFAULT_CATEGORIES={DEFAULT_CATEGORIES}
          description={description}
          setDescription={setDescription}
          amount={amount}
          setAmount={setAmount}
          handleCancelEdit={handleCancelEdit}
          />
        </div>

        <div className="col-12 col-md-6">
          <FiltersPanel
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          DEFAULT_CATEGORIES={DEFAULT_CATEGORIES}
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
          MONTHS={MONTHS}
          filterYear={filterYear}
          setFilterYear={setFilterYear}
          yearOptions={yearOptions}
          filterDateFrom={filterDateFrom}
          setFilterDateFrom={setFilterDateFrom}
          filterDateTo={filterDateTo}
          setFilterDateTo={setFilterDateTo}
          clearFilters={clearFilters}
          />
        </div>
      </div>
      <div className="row g-3 mt-1">
        <div className="col-12">
          <SummaryPanel
          totalAmount={totalAmount}
          filteredExpenses={filteredExpenses}
          monthlyExpenses={monthlyExpenses}
          />
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-12 col-md-6">
          <RecentExpensesTable
          loading={loading}
          filteredExpenses={filteredExpenses}
          handleRowClick={handleRowClick}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          />
        </div>

        <div className="col-12 col-md-6">
          <div className="d-flex flex-column gap-3">
            <ExpensePieChart categoryChartData={categoryChartData}/>

            {/* <ExpenseCalendar 
            getDayPercentage={getDayPercentage} 
            calendarDate={calendarDate} 
            onMonthChange={handleCalendarMonthChange}
            /> */}
            <CalendarGraphSwitcher
              view={rightPanelView}
              setView={setRightPanelView}
              calendarProps={{
                getDayPercentage,
                calendarDate,
                onMonthChange: handleCalendarMonthChange,
              }}
              graphProps={{
                dailyData: dailyGraphData,
              }}
            />

          </div>
        </div>
      </div>


      <ExpenseDetailDialogBox
      selectedExpense={selectedExpense}
      handleCloseDialog={handleCloseDialog}
      />
    </Box>
  );
}

export default App;
