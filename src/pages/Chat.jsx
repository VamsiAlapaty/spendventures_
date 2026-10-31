import { useState, useRef, useEffect } from 'react'
import { authHeaders } from '../utils/auth'
import ReactMarkdown from 'react-markdown'

function Chat() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)

    const API_URL = import.meta.env.VITE_API_URL
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    async function sendMessage() {
        if (!input.trim()) return

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    message: input,
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                    today: new Date().toLocaleDateString('en-CA')  // local YYYY-MM-DD
                })
            })

            if (!response.ok) throw new Error('Request failed')
            const data = await response.json()
            const assistantMessage = { role: 'assistant', content: data.reply, actions: data.actions || [] }
            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again.'
            }])
        } finally {
            setLoading(false)
        }
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter') sendMessage()
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-[600px]">

                <div className="p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-blue-700">Expense Assistant</h2>
                    <p className="text-xs text-slate-500">Ask questions, or add expenses, income and debts by chatting</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-400 text-sm mt-8">
                            <p>Ask me anything, or tell me what to record!</p>
                            <p className="mt-2">e.g. "What did I spend in July?"</p>
                            <p className="mt-1">"I spent $45 on groceries today"</p>
                            <p className="mt-1">"I got paid $3000 salary" or "I owe Ravi $200"</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg text-sm ${msg.role === 'user'
                                    ? 'bg-blue-700 text-white'
                                    : 'bg-slate-100 text-slate-800'
                                }`}>
                                {msg.role === 'assistant' ? (
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    msg.content
                                )}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="mt-2 flex flex-col gap-1">
                                        {msg.actions.map((a, i) => (
                                            <span key={i} className="text-xs bg-emerald-100 text-emerald-800 rounded px-2 py-1">
                                                ✓ {a.text}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg text-sm">
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <div className="p-4 border-t border-slate-200 flex gap-2">
                    <input
                        type="text"
                        placeholder="Ask a question or add an entry..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="flex-1 border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading}
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Chat