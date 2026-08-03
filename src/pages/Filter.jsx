import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authHeaders } from "../utils/auth";

function Filter() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL

  function filterExpenses() {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates")
      return
    }
    if (startDate > endDate) {
      alert("Start date cannot be after end date")
      return
    }
    fetch(`${API_URL}/expenses/filter?start_date=${startDate}&end_date=${endDate}`, {
      headers: authHeaders()
    })
      .then(res => res.json())
      .then(data => setFilteredExpenses(data))
  }
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
    </div>
  );
}

export default Filter;