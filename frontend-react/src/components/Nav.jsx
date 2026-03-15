// Nav.jsx
export default function Nav({ page, onNav }) {
  const tabs = [['pos','🍽 POS'],['orders','📋 Orders'],['report','📊 Report'],['menu','🧾 Menu'],['branches','🏪 Branches']]
  const nb = (active) => ({
    padding: '11px 18px', border: 'none', background: 'none',
    fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700,
    letterSpacing: .8, color: active ? '#e63012' : '#555',
    cursor: 'pointer', borderBottom: `2.5px solid ${active ? '#e63012' : 'transparent'}`,
    textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'all .2s'
  })
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #252525', background: '#111', flexShrink: 0, overflowX: 'auto' }}>
      {tabs.map(([id, label]) => (
        <button key={id} style={nb(page === id)} onClick={() => onNav(id)}>{label}</button>
      ))}
    </div>
  )
}
