import { useState, useMemo } from 'react'

const C = {
  wrap: { display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, overflow: 'hidden', '@media(max-width:768px)': {} },
  mpanel: { display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid #252525' },
  tbar: { padding: '10px 14px', borderBottom: '1px solid #252525', display: 'flex', gap: 6, flexWrap: 'wrap' },
  catBtn: (on) => ({ padding: '4px 12px', borderRadius: 16, border: `1.5px solid ${on ? '#e63012' : '#252525'}`, background: on ? '#e63012' : 'transparent', color: on ? '#fff' : '#555', fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: .4, boxShadow: on ? '0 0 10px rgba(230,48,18,.25)' : 'none', transition: 'all .2s' }),
  srch: { padding: '8px 14px', borderBottom: '1px solid #252525', position: 'relative' },
  srchInp: { width: '100%', padding: '7px 12px 7px 32px', background: '#181818', border: '1.5px solid #252525', borderRadius: 6, color: '#f0ede8', fontFamily: "'Rajdhani',sans-serif", fontSize: 13, outline: 'none' },
  mscroll: { flex: 1, overflowY: 'auto', padding: '12px 14px' },
  cttl: { fontFamily: "'Playfair Display',serif", fontSize: 16, color: '#f59e0b', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #252525', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  mgrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(145px,1fr))', gap: 7, marginBottom: 20 },
  mi: (hover) => ({ background: hover ? '#202020' : '#181818', border: `1.5px solid ${hover ? '#e63012' : '#252525'}`, borderRadius: 7, padding: '9px 11px', cursor: 'pointer', transform: hover ? 'translateY(-2px)' : 'none', boxShadow: hover ? '0 4px 14px rgba(230,48,18,.15)' : 'none', transition: 'all .2s', position: 'relative' }),
}

function MenuItem({ item, onAdd }) {
  const [hover, setHover] = useState(false)
  return (
    <div style={C.mi(hover)} onClick={() => onAdd(item)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#f0ede8', lineHeight: 1.3, marginBottom: 5, paddingRight: 14 }}>{item.name}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#e63012' }}>₹{item.price}<sup style={{ fontSize: 9, color: '#555' }}>/-</sup></div>
      {hover && <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 16, fontWeight: 700, color: '#e63012' }}>+</div>}
    </div>
  )
}

export default function POSPage({ menuItems, cart, tableNo, setTableNo, custName, setCustName, custPhone, setCustPhone, onAdd, onChangeQty, onRemove, onClear, onSave, onKOT, onBill, cartSub, cartGst, cartTotal }) {
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)

  const cats = useMemo(() => ['All', ...new Set(menuItems.map(i => i.category))], [menuItems])
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return menuItems.filter(i => i.available !== false && (activeCat === 'All' || i.category === activeCat) && (!q || i.name.toLowerCase().includes(q)))
  }, [menuItems, activeCat, search])

  const grouped = useMemo(() => {
    const cats = activeCat === 'All' ? [...new Set(filtered.map(i => i.category))] : [activeCat]
    return cats.map(cat => ({ cat, items: filtered.filter(i => i.category === cat) })).filter(g => g.items.length)
  }, [filtered, activeCat])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const inp = (val, set, ph, w) => (
    <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
      style={{ flex: 1, maxWidth: w, background: '#181818', border: '1.5px solid #252525', borderRadius: 5, color: '#f0ede8', fontFamily: "'Rajdhani',sans-serif", fontSize: 12, padding: '5px 9px', outline: 'none' }} />
  )

  return (
    <>
      <style>{`
        @media(max-width:768px){
          .pos-grid{grid-template-columns:1fr !important;}
          .order-panel{position:fixed!important;bottom:0;left:0;right:0;max-height:58vh;border-top:2px solid #e63012;z-index:100;background:#111;}
          .menu-panel{padding-bottom:60vh;}
        }
      `}</style>
      <div className="pos-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, overflow: 'hidden' }}>
        {/* MENU */}
        <div className="menu-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid #252525' }}>
          <div style={C.tbar}>
            {cats.map(c => <button key={c} style={C.catBtn(c === activeCat)} onClick={() => setActiveCat(c)}>{c}</button>)}
          </div>
          <div style={C.srch}>
            <span style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#555' }}>🔍</span>
            <input style={C.srchInp} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items..." />
          </div>
          <div style={C.mscroll}>
            {grouped.map(({ cat, items }) => (
              <div key={cat}>
                <div style={C.cttl}>{cat}<span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: '#555' }}>{items.length} items</span></div>
                <div style={C.mgrid}>
                  {items.map(item => <MenuItem key={item.id} item={item} onAdd={onAdd} />)}
                </div>
              </div>
            ))}
            {!grouped.length && <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>No items found</div>}
          </div>
        </div>

        {/* ORDER PANEL */}
        <div className="order-panel" style={{ display: 'flex', flexDirection: 'column', background: '#111' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #252525', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 17 }}>Current Order</span>
            <span style={{ background: '#e63012', color: '#fff', borderRadius: 16, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{cartCount}</span>
          </div>
          <div style={{ padding: '7px 12px', borderBottom: '1px solid #252525', display: 'flex', gap: 6 }}>
            {inp(tableNo, setTableNo, 'Table / Take-Away', 110)}
            {inp(custName, setCustName, 'Customer name', undefined)}
            {inp(custPhone, setCustPhone, 'Phone', 100)}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '9px 12px' }}>
            {!cart.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: '#555' }}>
                <div style={{ fontSize: 36, opacity: .2 }}>🍛</div>
                <p style={{ fontSize: 13 }}>Tap items to add</p>
              </div>
            ) : cart.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 9px', background: '#181818', border: '1px solid #252525', borderRadius: 6, marginBottom: 6, animation: 'fadeSlide .18s ease' }}>
                <div style={{ flex: 1, fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => onChangeQty(item.id, -1)} style={{ width: 20, height: 20, borderRadius: 4, border: '1.5px solid #2a2a2a', background: 'transparent', color: '#f0ede8', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 12, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => onChangeQty(item.id, 1)} style={{ width: 20, height: 20, borderRadius: 4, border: '1.5px solid #2a2a2a', background: 'transparent', color: '#f0ede8', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', minWidth: 46, textAlign: 'right' }}>₹{item.price * item.qty}</div>
                <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, padding: 2 }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #252525', padding: '12px 14px' }}>
            {[['Subtotal', `₹${cartSub}`], ['GST (5%)', `₹${cartGst}`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', marginBottom: 3 }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, paddingTop: 7, borderTop: '1px dashed #252525', marginTop: 5 }}>
              <span>TOTAL</span><span style={{ color: '#e63012' }}>₹{cartTotal}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 10 }}>
              {[['✕ Clear', '#2a2a2a', 'transparent', '#666', onClear], ['🍳 KOT', 'none', '#3b82f6', '#fff', onKOT], ['🖨 Bill', '#2a2a2a', 'transparent', '#666', onBill]].map(([l, bdr, bg, clr, fn]) => (
                <button key={l} onClick={fn} style={{ padding: '9px 6px', borderRadius: 6, border: `1.5px solid ${bdr}`, background: bg, color: clr, fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: .5 }}>{l}</button>
              ))}
            </div>
            <button onClick={onSave} style={{ width: '100%', padding: 11, borderRadius: 6, border: 'none', background: '#e63012', color: '#fff', fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', marginTop: 6, boxShadow: '0 3px 14px rgba(230,48,18,.3)' }}>✓ Save Order</button>
          </div>
        </div>
      </div>
    </>
  )
}
