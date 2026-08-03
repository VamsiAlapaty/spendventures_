import { useState, useEffect } from 'react';
import './index.css'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Filter from './pages/Filter.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { authHeaders } from './utils/auth'

function App() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard')
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');

  const navigate = useNavigate()
  const location = useLocation()

  const API_URL = import.meta.env.VITE_API_URL

  function fetchExpenses() {
    fetch(`${API_URL}/expenses`, { headers: authHeaders() })
      .then(res => {
        if (res.status === 401) {
          navigate('/login')
          return []
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) setExpenses(data)
      })
  }

  function fetchCategoryTotals() {
    fetch(`${API_URL}/expenses/category_totals`, { headers: authHeaders() })
      .then(res => {
        if (res.status === 401) return []
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) setCategoryTotals(data)
      })
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      fetchExpenses()
      fetchCategoryTotals()
    }
  }, [location.pathname])


  async function handleSubmit() {
    const expense = { amount: parseFloat(amount), category, description, date }

    const response = await fetch(`${API_URL}/expenses`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(expense)
    })

    const data = await response.json()
    console.log("Response from Python:", data)

    setAmount("")
    setCategory("")
    setDescription("")
    setDate("")
    fetchExpenses()
    fetchCategoryTotals()
  }
  // Edit expense function
  function handleeditSubmit(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      setEditAmount(expense.amount);
      setEditCategory(expense.category);
      setEditDescription(expense.description);
      setEditDate(expense.date);
      setEditId(id);
    }
  }

  async function handleUpdate(id) {
    const updatedExpense = {
      amount: parseFloat(editAmount),
      category: editCategory,
      description: editDescription,
      date: editDate
    };

    await fetch(`${API_URL}/expenses/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updatedExpense)
    })
      .then(res => res.json())
      .then(data => {
        console.log("Response from Python:", data);
        setEditId(null);
        fetchExpenses();
        fetchCategoryTotals();
      });
  }

  async function deleteExpense(id) {
    const responsedel = await fetch(`${API_URL}/expenses/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    })

    console.log("Response from Python:", responsedel)
    fetchExpenses()
    fetchCategoryTotals()
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setExpenses([])
    setCategoryTotals([])
    navigate('/login')
  }



  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-blue-700 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide">SpendVentures</h1>
        {localStorage.getItem('token') && (
          <button onClick={handleLogout} className="text-sm text-white border border-white px-3 py-1 rounded hover:bg-blue-800">
            Logout
          </button>
        )}
      </nav>
      {localStorage.getItem('token') && (
        <div className="bg-white border-b border-slate-200 px-6">
          <button onClick={() => navigate('/dashboard')} className={`px-4 py-3 font-medium text-sm border-b-2 mr-4 ${location.pathname === '/dashboard' || location.pathname === '/'
            ? 'border-blue-700 text-blue-700'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>Dashboard</button>
          <button onClick={() => navigate('/filter')} className={`px-4 py-3 font-medium text-sm border-b-2 mr-4 ${location.pathname === '/filter'
            ? 'border-blue-700 text-blue-700'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>Filter</button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard
          amount={amount} setAmount={setAmount}
          category={category} setCategory={setCategory}
          description={description} setDescription={setDescription}
          date={date} setDate={setDate}
          expenses={expenses}
          categoryTotals={categoryTotals}
          handleSubmit={handleSubmit}
          handleeditSubmit={handleeditSubmit}
          handleUpdate={handleUpdate}
          deleteExpense={deleteExpense}
          editId={editId} setEditId={setEditId}
          editAmount={editAmount} setEditAmount={setEditAmount}
          editCategory={editCategory} setEditCategory={setEditCategory}
          editDescription={editDescription} setEditDescription={setEditDescription}
          editDate={editDate} setEditDate={setEditDate} /> </ProtectedRoute>} />
        <Route path="/filter" element={<ProtectedRoute>
          <Filter
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
            filteredExpenses={filteredExpenses}
            setFilteredExpenses={setFilteredExpenses}
          />
        </ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}

export default App