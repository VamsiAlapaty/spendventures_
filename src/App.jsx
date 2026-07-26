import { useState, useEffect } from 'react';
import './index.css'

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



  const API_URL = import.meta.env.VITE_API_URL

  function fetchExpenses() {
    fetch(`${API_URL}/expenses`)
      .then(res => res.json())
      .then(data => setExpenses(data))
  }

  function filterExpenses() {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates")
      return
    }
    if (startDate > endDate) {
      alert("Start date cannot be after end date")
      return
    }
    fetch(`${API_URL}/expenses/filter?start_date=${startDate}&end_date=${endDate}`)
      .then(res => res.json())
      .then(data => setFilteredExpenses(data))
  }

  function fetchCategoryTotals() {
    fetch(`${API_URL}/expenses/category_totals`)
      .then(res => res.json())
      .then(data => setCategoryTotals(data))
  }

  useEffect(() => {
    fetchExpenses()
    fetchCategoryTotals()
  }, [])


  async function handleSubmit() {
    const expense = { amount: parseFloat(amount), category, description, date }

    const response = await fetch(`${API_URL}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" }
    })

    console.log("Response from Python:", responsedel)
    fetchExpenses()
    fetchCategoryTotals()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-blue-700 text-white px-6 py-4 shadow-md">
        <h1 className="text-xl font-bold tracking-wide">SpendVentures</h1>
      </nav>
      <div className="bg-white border-b border-slate-200 px-6">
        <button onClick={() => setActiveTab("dashboard")} className={`px-4 py-3 font-medium text-sm border-b-2 mr-4 ${activeTab === "dashboard"
          ? "border-blue-700 text-blue-700"
          : "border-transparent text-slate-500 hover:text-slate-700"
          }`}>Dashboard</button>
        <button onClick={() => setActiveTab("filter")} className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab === "filter"
          ? "border-blue-700 text-blue-700"
          : "border-transparent text-slate-500 hover:text-slate-700"
          }`}>Filter</button>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">

            {/* Add Expense Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">Add Expense</h2>
              <div className="flex flex-col gap-3">
                <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                <button onClick={handleSubmit} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 w-fit">Add Expense</button>
              </div>
            </div>

            {/* Expenses List Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">Expenses</h2>
              <div className="flex flex-col gap-3">
                {expenses.map(expense => (
                  <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 rounded px-4 py-3 hover:bg-slate-50 gap-2">
                    {editId === expense.id ? (
                      <div className="flex flex-col sm:flex-row gap-2 flex-1">
                        <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm w-full sm:w-24" />
                        <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm w-full sm:w-28" />
                        <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm w-full" />
                        <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm w-full" />
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:gap-4 flex-1 text-sm text-slate-700">
                        <span className="text-slate-400">{expense.date}</span>
                        <span className="font-medium text-slate-600">{expense.category}</span>
                        <span className="font-semibold text-blue-700">${expense.amount}</span>
                        <span className="text-slate-500">{expense.description}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {editId === expense.id ? (
                        <>
                          <button onClick={() => handleUpdate(expense.id)} className="bg-emerald-600 text-white px-3 py-1 text-sm rounded hover:bg-emerald-700">Done</button>
                          <button onClick={() => setEditId(null)} className="bg-slate-400 text-white px-3 py-1 text-sm rounded hover:bg-slate-500">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleeditSubmit(expense.id)} className="bg-slate-600 text-white px-3 py-1 text-sm rounded hover:bg-slate-700">Edit</button>
                          <button onClick={() => deleteExpense(expense.id)} className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700">Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Totals Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">Category Totals</h2>
              <div className="flex flex-col gap-2">
                {categoryTotals.map((total, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-slate-100 py-2 text-sm">
                    <span className="text-slate-600 font-medium">{total.category}</span>
                    <span className="font-semibold text-blue-700">${total.total_amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === "filter" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">Filter Expenses</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500 font-medium">From</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500 font-medium">To</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                </div>
                <button onClick={filterExpenses} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm w-full sm:w-fit">Get Expenses</button>
              </div>
            </div>

            {filteredExpenses.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-blue-700 mb-4">Results</h2>
                <div className="flex flex-col gap-3">
                  {filteredExpenses.map(expense => (
                    <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 rounded px-4 py-3 hover:bg-slate-50 gap-2">
                      <div className="flex flex-col sm:flex-row sm:gap-4 flex-1 text-sm text-slate-700">
                        <span className="text-slate-400">{expense.date}</span>
                        <span className="font-medium text-slate-600">{expense.category}</span>
                        <span className="font-semibold text-blue-700">${expense.amount}</span>
                        <span className="text-slate-500">{expense.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

export default App