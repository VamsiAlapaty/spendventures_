import {useState, useEffect} from 'react';

function App() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [expenses, setExpenses] = useState([]);

function fetchExpenses() {
   fetch("https://spendventures-backend.onrender.com/expenses")
    .then(res => res.json())
    .then(data => setExpenses(data))
}

useEffect(() => {
  fetchExpenses()
}, [])


  async function handleSubmit() {
    const expense = { amount: parseFloat(amount), category, description, date }
  
    const response = await fetch("https://spendventures-backend.onrender.com/expenses", {
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
   }

   async function deleteExpense(id) {
    const responsedel = await fetch("https://spendventures-backend.onrender.com/expenses/" + id, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    })
    
    console.log("Response from Python:", responsedel)
    fetchExpenses()
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
    </div>
  )
}

export default App