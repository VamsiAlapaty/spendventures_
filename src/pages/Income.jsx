import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authHeaders } from '../utils/auth'

const inputCls = "border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"

function Income() {
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editSource, setEditSource] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDate, setEditDate] = useState('')

  const API_URL = import.meta.env.VITE_API_URL
  const navigate = useNavigate()

  function fetchIncome() {
    fetch(`${API_URL}/income`, { headers: authHeaders() })
      .then(res => {
        if (res.status === 401) { navigate('/login'); return [] }
        return res.json()
      })
      .then(data => { if (Array.isArray(data)) setItems(data) })
  }

  useEffect(() => { fetchIncome() }, [])

  async function handleSubmit() {
    if (!(parseFloat(amount) > 0) || !source.trim() || !date) {
      setError('Amount (greater than 0), source and date are required')
      return
    }
    setError('')
    await fetch(`${API_URL}/income`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ amount: parseFloat(amount), source, description, date })
    })
    setAmount(''); setSource(''); setDescription(''); setDate('')
    fetchIncome()
  }

  function startEdit(item) {
    setEditAmount(item.amount)
    setEditSource(item.source)
    setEditDescription(item.description || '')
    setEditDate(item.date)
    setEditId(item.id)
  }

  async function handleUpdate(id) {
    await fetch(`${API_URL}/income/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        amount: parseFloat(editAmount),
        source: editSource,
        description: editDescription,
        date: editDate
      })
    })
    setEditId(null)
    fetchIncome()
  }

  async function deleteIncome(id) {
    await fetch(`${API_URL}/income/${id}`, { method: 'DELETE', headers: authHeaders() })
    fetchIncome()
  }

  const total = items.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">

        {/* Add Income Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">Add Income</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex flex-col gap-3">
            <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
            <input type="text" placeholder="Source (e.g. Salary, Freelance)" value={source} onChange={(e) => setSource(e.target.value)} className={inputCls} />
            <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            <button onClick={handleSubmit} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 w-fit">Add Income</button>
          </div>
        </div>

        {/* Income List Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-blue-700">Income</h2>
            <span className="text-sm text-slate-500">Total: <span className="font-semibold text-emerald-600">${total.toFixed(2)}</span></span>
          </div>
          <div className="flex flex-col gap-3">
            {items.length === 0 && <p className="text-sm text-slate-400">No income recorded yet.</p>}
            {items.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 rounded px-4 py-3 hover:bg-slate-50 gap-2">
                {editId === item.id ? (
                  <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm w-full sm:w-24" />
                    <input type="text" value={editSource} onChange={(e) => setEditSource(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm w-full sm:w-28" />
                    <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm w-full" />
                    <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm w-full" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:gap-4 flex-1 text-sm text-slate-700">
                    <span className="text-slate-400">{item.date}</span>
                    <span className="font-medium text-slate-600">{item.source}</span>
                    <span className="font-semibold text-emerald-600">${item.amount}</span>
                    <span className="text-slate-500">{item.description}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  {editId === item.id ? (
                    <>
                      <button onClick={() => handleUpdate(item.id)} className="bg-emerald-600 text-white px-3 py-1 text-sm rounded hover:bg-emerald-700">Done</button>
                      <button onClick={() => setEditId(null)} className="bg-slate-400 text-white px-3 py-1 text-sm rounded hover:bg-slate-500">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(item)} className="bg-slate-600 text-white px-3 py-1 text-sm rounded hover:bg-slate-700">Edit</button>
                      <button onClick={() => deleteIncome(item.id)} className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700">Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Income
