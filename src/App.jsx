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
 
  const navigate = useNavigate()
  const location = useLocation()
 

  function handleLogout() {
    localStorage.removeItem('token')
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
        <Route path="/dashboard" element={<ProtectedRoute>
          <Dashboard      
        /> </ProtectedRoute>} />
        <Route path="/filter" element={<ProtectedRoute>
          <Filter />
        </ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}

export default App