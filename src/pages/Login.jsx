import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const API_URL = import.meta.env.VITE_API_URL

    // Wake the free-tier backend while the user types their credentials
    useEffect(() => {
        fetch(`${API_URL}/`).catch(() => {})
    }, [])

    async function handleLogin() {
        setError('')
        setLoading(true)
        try {
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
        } catch (err) {
            setError('Could not reach the server. Please try again.')
        } finally {
            setLoading(false)
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
                        disabled={loading}
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 w-full disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                        )}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    {loading && (
                        <p className="text-xs text-slate-500 text-center">
                            The server may be waking up, this can take up to a minute.
                        </p>
                    )}
                    <p className="text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <span onClick={() => navigate('/register')} className="text-blue-700 cursor-pointer hover:underline">
                            Create one
                        </span>
                    </p>
                    <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200">
                        <p className="text-xs text-slate-500 font-medium mb-1">Try the demo</p>
                        <p className="text-xs text-slate-600">Email: <span className="font-medium">demo@spendventures.com</span></p>
                        <p className="text-xs text-slate-600">Password: <span className="font-medium">demo1234</span></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login