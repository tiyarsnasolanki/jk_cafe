// Header.jsx
import { useState } from 'react'
const S = {
  hdr: { background: 'linear-gradient(135deg,#0d0d0d,#1c0600)', borderBottom: '2px solid #e63012', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 4px 24px rgba(230,48,18,.22)', zIndex: 200 },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  ring: { width: 44, height: 44, borderRadius: '50%', border: '2px solid #e63012', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 900, color: '#e63012', background: 'rgba(230,48,18,.06)', boxShadow: '0 0 14px rgba(230,48,18,.25)', flexShrink: 0 },
  h1: { fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 900, color: '#e63012', lineHeight: 1, textShadow: '0 0 16px rgba(230,48,18,.35)' },
  sub: { fontSize: 9, color: '#f59e0b', letterSpacing: 3, fontWeight: 600, textTransform: 'uppercase', marginTop: 2 },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  pill: { display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, border: '1px solid #2a2a2a', background: '#181818', fontSize: 11, fontWeight: 600 },
  dot: (on) => ({ width: 6, height: 6, borderRadius: '50%', background: on ? '#22c55e' : '#555', boxShadow: on ? '0 0 5px #22c55e' : 'none' }),
  sel: { background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 6, color: '#f0ede8', fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 600, padding: '6px 10px', outline: 'none' },
  btn: { padding: '6px 12px', borderRadius: 6, border: '1.5px solid #2a2a2a', background: 'transparent', color: '#666', fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: .5, textTransform: 'uppercase' },
}
export default function Header({ branches, activeBranch, onBranchChange, dbOnline, onSetup }) {
  return (
    <header style={S.hdr}>
      <div style={S.logo}>
        <div style={S.ring}>JK</div>
        <div><div style={S.h1}>Spicy Dosa Cafe</div><div style={S.sub}>Order Management</div></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <select style={S.sel} value={activeBranch} onChange={e => onBranchChange(e.target.value)}>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <div style={S.right}>
          <div style={S.pill}>
            <div style={S.dot(dbOnline)}></div>
            <span style={{ color: dbOnline ? '#22c55e' : '#f59e0b' }}>{dbOnline ? 'MongoDB Live' : 'Local Mode'}</span>
          </div>
          <button style={S.btn} onClick={onSetup}>⚙ Setup</button>
        </div>
      </div>
    </header>
  )
}
