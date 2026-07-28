import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const API_URL = import.meta.env.VITE_API_URL

    async function handleLogin() {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        const data = await response.json()

        if (data.access_token) {
            localStorage.setItem('token', data.access_token)
            navigate('/dashboard')
        } else {
            setError(data.error)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-blue-700 mb-2">SpendVentures</h1>
                <p className="text-slate-500 text-sm mb-6">Sign in to your account</p>

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
                        onClick={handleLogin}
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 w-full"
                    >
                        Sign In
                    </button>
                    <p className="text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <span onClick={() => navigate('/register')} className="text-blue-700 cursor-pointer hover:underline">
                            Create one
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login