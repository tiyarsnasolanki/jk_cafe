import { useState } from 'react'
import Modal from './Modal.jsx'

export default function SetupModal({ open, onClose, onSave }) {
  const [url, setUrl] = useState(() => localStorage.getItem('jk_api') || '')
  const inp = { width: '100%', background: '#111', border: '1.5px solid #2a2a2a', borderRadius: 6, color: '#f0ede8', fontFamily: "'Rajdhani',sans-serif", fontSize: 14, padding: '9px 12px', outline: 'none', marginTop: 4 }
  const step = (n, text) => (
    <div style={{ display: 'flex', gap: 10, padding: 10, background: '#111', borderRadius: 6, marginBottom: 8 }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#e63012', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{n}</div>
      <div style={{ fontSize: 12, color: '#a09890', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  )
  return (
    <Modal open={open} onClose={onClose} title="⚙ System Setup">
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Backend API URL</label>
        <input style={inp} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-api.onrender.com" />
        <div style={{ fontSize: 11, color: '#555', marginTop: 5 }}>Deploy backend/server.js to Render.com and paste the URL above</div>
      </div>
      {step(1, '<b style="color:#f0ede8">MongoDB Atlas</b> → cloud.mongodb.com → Free cluster → Copy connection string')}
      {step(2, '<b style="color:#f0ede8">Render.com</b> → New Web Service → Connect GitHub → Root Dir: <code style="background:rgba(255,255,255,.08);padding:2px 5px;border-radius:3px;color:#f59e0b">backend</code> → Set env var MONGODB_URI')}
      {step(3, '<b style="color:#f0ede8">Vercel.com</b> → Import GitHub → Root Dir: <code style="background:rgba(255,255,255,.08);padding:2px 5px;border-radius:3px;color:#f59e0b">frontend-react</code> → Deploy')}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={onClose} style={{ flex: 1, padding: 11, borderRadius: 6, border: '1.5px solid #2a2a2a', background: 'transparent', color: '#666', fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>Cancel</button>
        <button onClick={() => onSave(url)} style={{ flex: 1, padding: 11, borderRadius: 6, border: 'none', background: '#e63012', color: '#fff', fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>Save & Connect</button>
      </div>
    </Modal>
  )
}
