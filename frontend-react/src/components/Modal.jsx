export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', backdropFilter: 'blur(5px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 12, padding: 24, maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto', animation: 'modalIn .22s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#f0ede8' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
