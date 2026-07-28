import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const API_URL = import.meta.env.VITE_API_URL

  async function handleRegister() {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await response.json()

    if (data.error) {
      setError(data.error)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">SpendVentures</h1>
        <p className="text-slate-500 text-sm mb-6">Create your account</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <button
            onClick={handleRegister}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 w-full"
          >
            Create Account
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} className="text-blue-700 cursor-pointer hover:underline">
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register