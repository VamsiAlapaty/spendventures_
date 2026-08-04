import { useState } from 'react'
import { authHeaders } from '../utils/auth'

function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

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
      body: JSON.stringify({ message: input })
    })

    const data = await response.json()
    const assistantMessage = { role: 'assistant', content: data.reply }
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
          <p className="text-xs text-slate-500">Ask questions about your expenses</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 text-sm mt-8">
              <p>Ask me anything about your expenses!</p>
              <p className="mt-2">e.g. "What did I spend in July?" or "Which category has the most expenses?"</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}>
                {msg.content}
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
        </div>

        <div className="p-4 border-t border-slate-200 flex gap-2">
          <input
            type="text"
            placeholder="Ask about your expenses..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
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