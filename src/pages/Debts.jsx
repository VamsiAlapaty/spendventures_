import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authHeaders } from '../utils/auth'

const inputCls = "border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"

function Debts() {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [debts, setDebts] = useState([])
  const [showPaid, setShowPaid] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDueDate, setEditDueDate] = useState('')

  const API_URL = import.meta.env.VITE_API_URL
  const navigate = useNavigate()

  function fetchDebts() {
    fetch(`${API_URL}/debts?include_paid=${showPaid}`, { headers: authHeaders() })
      .then(res => {
        if (res.status === 401) { navigate('/login'); return [] }
        return res.json()
      })
      .then(data => { if (Array.isArray(data)) setDebts(data) })
  }

  useEffect(() => { fetchDebts() }, [showPaid])

  async function handleSubmit() {
    if (!(parseFloat(amount) > 0) || !name.trim()) {
      setError('Name and an amount greater than 0 are required')
      return
    }
    setError('')
    await fetch(`${API_URL}/debts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name,
        amount: parseFloat(amount),
        description,
        due_date: dueDate || null
      })
    })
    setName(''); setAmount(''); setDescription(''); setDueDate('')
    fetchDebts()
  }

  function startEdit(debt) {
    setEditName(debt.name)
    setEditAmount(debt.amount)
    setEditDescription(debt.description || '')
    setEditDueDate(debt.due_date || '')
    setEditId(debt.id)
  }

  async function handleUpdate(debt) {
    await fetch(`${API_URL}/debts/${debt.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        name: editName,
        amount: parseFloat(editAmount),
        description: editDescription,
        due_date: editDueDate || null,
        is_paid: debt.is_paid
      })
    })
    setEditId(null)
    fetchDebts()
  }

  async function markPaid(id) {
    await fetch(`${API_URL}/debts/${id}/pay`, { method: 'PATCH', headers: authHeaders() })
    fetchDebts()
  }

  async function deleteDebt(id) {
    await fetch(`${API_URL}/debts/${id}`, { method: 'DELETE', headers: authHeaders() })
    fetchDebts()
  }

  const outstanding = debts.filter(d => !d.is_paid).reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">

        {/* Add Debt Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">Add Debt</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex flex-col gap-3">
            <input type="text" placeholder="Name (e.g. Car loan)" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
            <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Due date (optional)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
            </div>
            <button onClick={handleSubmit} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 w-fit">Add Debt</button>
          </div>
        </div>

        {/* Debts List Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-blue-700">Debts</h2>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                <input type="checkbox" checked={showPaid} onChange={(e) => setShowPaid(e.target.checked)} />
                Show paid
              </label>
              <span className="text-slate-500">Outstanding: <span className="font-semibold text-red-600">${outstanding.toFixed(2)}</span></span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {debts.length === 0 && <p className="text-sm text-slate-400">No debts to show.</p>}
            {debts.map(debt => (
              <div key={debt.id} className={`flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 rounded px-4 py-3 hover:bg-slate-50 gap-2 ${debt.is_paid ? 'opacity-60' : ''}`}>
                {editId === debt.id ? (
                  <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm w-full sm:w-32" />
                    <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm w-full sm:w-24" />
                    <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm w-full" />
                    <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm w-full" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:gap-4 flex-1 text-sm text-slate-700">
                    <span className="text-slate-400">{debt.due_date ? `Due ${debt.due_date}` : 'No due date'}</span>
                    <span className="font-medium text-slate-600">{debt.name}</span>
                    <span className="font-semibold text-red-600">${debt.amount}</span>
                    <span className="text-slate-500">{debt.description}</span>
                    {debt.is_paid && <span className="text-emerald-600 font-medium">Paid</span>}
                  </div>
                )}
                <div className="flex gap-2">
                  {editId === debt.id ? (
                    <>
                      <button onClick={() => handleUpdate(debt)} className="bg-emerald-600 text-white px-3 py-1 text-sm rounded hover:bg-emerald-700">Done</button>
                      <button onClick={() => setEditId(null)} className="bg-slate-400 text-white px-3 py-1 text-sm rounded hover:bg-slate-500">Cancel</button>
                    </>
                  ) : (
                    <>
                      {!debt.is_paid && (
                        <button onClick={() => markPaid(debt.id)} className="bg-emerald-600 text-white px-3 py-1 text-sm rounded hover:bg-emerald-700">Mark paid</button>
                      )}
                      <button onClick={() => startEdit(debt)} className="bg-slate-600 text-white px-3 py-1 text-sm rounded hover:bg-slate-700">Edit</button>
                      <button onClick={() => deleteDebt(debt.id)} className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700">Delete</button>
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

export default Debts
