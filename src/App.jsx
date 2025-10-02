import { useEffect, useState } from 'react'
import { listMessages, createMessage } from './api'
import logo from './assets/logo.png'
import './index.css'

export default function App() {
  const [messages, setMessages] = useState([])
  const [userId, setUserId] = useState('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setError(null)
      const data = await listMessages(50)
      setMessages(data)
    } catch (e) {
      setError(e.message || 'Failed to load')
    }
  }
  useEffect(() => { load() }, [])

  async function onSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return
    try {
      setLoading(true)
      setError(null)
      const created = await createMessage(userId, content.trim())
      setMessages(prev => [created, ...prev])
      setContent('')
    } catch (e) {
      setError(e.message || 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      {/* Logo as header */}
      <header className="brand-centered">
        <img className="brand-logo-large" src={logo} alt="SkillSwap logo" />
      </header>

      {/* Message form */}
      <section className="card">
        <form className="form" onSubmit={onSubmit}>
          <label className="label">
            User ID (UUID)
            <input
              className="input"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </label>

          <label className="label">
            Content
            <textarea
              className="textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Say hello…"
            />
          </label>

          <button className="button" disabled={loading || !content.trim()}>
            {loading ? 'Sending…' : 'Send'}
          </button>

          {error && <div className="error">Error: {error}</div>}
        </form>
      </section>

      {/* Messages */}
      <h2 className="section-title">Latest</h2>
      <hr className="hr" />

      <ul className="list">
        {messages.length === 0 && (
          <li className="item"><div className="meta">No messages yet.</div></li>
        )}
        {messages.map(m => (
          <li key={m.id} className="item">
            <div className="content">{m.content}</div>
            <div className="meta">
              {m.userId} — {new Date(m.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
