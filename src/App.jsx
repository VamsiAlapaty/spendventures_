import { useState, useEffect } from 'react';

function App() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL

  function fetchExpenses() {
    fetch(`${API_URL}/expenses`)
      .then(res => res.json())
      .then(data => setExpenses(data))
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
    <div>
      <h1>SpendVentures</h1>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="date"
        placeholder="Date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button onClick={handleSubmit}>Add Expense</button>


      <h2>Expenses</h2>
      {expenses.map(expense => (
        <div key={expense.id}>
          <p>{expense.date} — {expense.category} — ${expense.amount} — {expense.description}- </p>
          <button onClick={() => deleteExpense(expense.id)}>Delete</button>
        </div>
      ))}

      <h2>Category Totals</h2>
      {categoryTotals.map((total, index) => (
        <p key={index}>{total.category}: ${total.total_amount.toFixed(2)}</p>
      ))}
    </div>
  )
}

export default App