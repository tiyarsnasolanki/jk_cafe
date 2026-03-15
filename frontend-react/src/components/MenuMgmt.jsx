import { useState } from 'react'
import Modal from './Modal.jsx'

export default function MenuMgmt({ menuItems, onSave, onDelete, onToggle, showToast }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Paper')

  const cats = [...new Set(menuItems.map(i=>i.category))]
  const inp = { width:'100%', background:'#111', border:'1.5px solid #252525', borderRadius:6, color:'#f0ede8', fontFamily:"'Rajdhani',sans-serif", fontSize:14, padding:'9px 12px', outline:'none', marginTop:4 }

  const openAdd = () => { setEditing(null); setName(''); setPrice(''); setCategory('Paper'); setModalOpen(true) }
  const openEdit = (item) => { setEditing(item); setName(item.name); setPrice(item.price); setCategory(item.category); setModalOpen(true) }

  const handleSave = () => {
    if (!name.trim() || !price) { showToast('Fill all fields','e'); return }
    onSave({ id: editing?.id, name: name.trim(), price: parseInt(price), category })
    setModalOpen(false)
  }

  const ibtn = (hover) => ({ width:28, height:28, borderRadius:5, border:'1.5px solid #252525', background:'transparent', color:'#555', cursor:'pointer', fontSize:12, transition:'all .2s' })

  return (
    <div style={{ flex:1, overflowY:'auto', padding:18 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20 }}>Menu Management</span>
        <button onClick={openAdd} style={{ padding:'8px 16px', background:'#e63012', border:'none', borderRadius:6, color:'#fff', fontFamily:"'Rajdhani',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add Item</button>
      </div>

      {cats.map(cat => (
        <div key={cat} style={{ marginBottom:22 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:'#f59e0b', marginBottom:8, paddingBottom:6, borderBottom:'1px solid #252525', display:'flex', justifyContent:'space-between' }}>
            {cat}<span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, color:'#555' }}>{menuItems.filter(i=>i.category===cat).length} items</span>
          </div>
          {menuItems.filter(i=>i.category===cat).map(item => (
            <div key={item.id} style={{ display:'flex', alignItems:'center', gap:10, background:'#181818', border:'1px solid #252525', borderRadius:6, padding:'9px 12px', marginBottom:6 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, opacity: item.available===false?.4:1 }}>{item.name}</div>
                <div style={{ fontSize:10, color:'#555', textTransform:'uppercase', letterSpacing:.5 }}>{item.category}</div>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:'#f59e0b' }}>₹{item.price}</div>
              {/* Toggle */}
              <button onClick={()=>onToggle(item.id)} style={{ width:40, height:22, borderRadius:11, border:'none', background: item.available!==false?'#22c55e':'#2a2a2a', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
                <div style={{ position:'absolute', width:16, height:16, borderRadius:'50%', background:'#fff', top:3, left: item.available!==false?21:3, transition:'left .2s' }}></div>
              </button>
              <button onClick={()=>openEdit(item)} style={ibtn()} onMouseEnter={e=>{ e.currentTarget.style.borderColor='#f59e0b'; e.currentTarget.style.color='#f59e0b' }} onMouseLeave={e=>{ e.currentTarget.style.borderColor='#252525'; e.currentTarget.style.color='#555' }}>✏</button>
              <button onClick={()=>onDelete(item.id)} style={ibtn()} onMouseEnter={e=>{ e.currentTarget.style.borderColor='#ef4444'; e.currentTarget.style.color='#ef4444' }} onMouseLeave={e=>{ e.currentTarget.style.borderColor='#252525'; e.currentTarget.style.color='#555' }}>🗑</button>
            </div>
          ))}
        </div>
      ))}

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editing?'Edit Item':'Add Item'}>
        <div style={{ marginBottom:14 }}><label style={{ fontSize:11, color:'#555', fontWeight:600, textTransform:'uppercase' }}>Item Name</label><input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Cheese Masala Dosa" /></div>
        <div style={{ marginBottom:14 }}><label style={{ fontSize:11, color:'#555', fontWeight:600, textTransform:'uppercase' }}>Price (₹)</label><input type="number" style={inp} value={price} onChange={e=>setPrice(e.target.value)} placeholder="180" /></div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, color:'#555', fontWeight:600, textTransform:'uppercase' }}>Category</label>
          <select style={inp} value={category} onChange={e=>setCategory(e.target.value)}>
            {['Paper','Gravy Item','Fancy Dosa','Beverages'].map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          <button onClick={()=>setModalOpen(false)} style={{ flex:1, padding:11, borderRadius:6, border:'1.5px solid #252525', background:'transparent', color:'#666', fontFamily:"'Rajdhani',sans-serif", fontSize:13, fontWeight:700, cursor:'pointer', textTransform:'uppercase' }}>Cancel</button>
          <button onClick={handleSave} style={{ flex:1, padding:11, borderRadius:6, border:'none', background:'#e63012', color:'#fff', fontFamily:"'Rajdhani',sans-serif", fontSize:13, fontWeight:700, cursor:'pointer', textTransform:'uppercase' }}>Save</button>
        </div>
      </Modal>
    </div>
  )
}
