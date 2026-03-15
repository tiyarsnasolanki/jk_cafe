import { useState } from 'react'
import Modal from './Modal.jsx'

export default function BranchesPage({ branches, onSave, onDelete, showToast }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

  const inp = { width:'100%', background:'#111', border:'1.5px solid #252525', borderRadius:6, color:'#f0ede8', fontFamily:"'Rajdhani',sans-serif", fontSize:14, padding:'9px 12px', outline:'none', marginTop:4 }

  const openAdd = () => { setEditing(null); setName(''); setAddress(''); setPhone(''); setModalOpen(true) }
  const openEdit = (b) => { setEditing(b); setName(b.name); setAddress(b.address||''); setPhone(b.phone||''); setModalOpen(true) }

  const handleSave = () => {
    if (!name.trim()) { showToast('Enter branch name','e'); return }
    onSave({ id: editing?.id, name: name.trim(), address: address.trim(), phone: phone.trim() })
    setModalOpen(false)
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:18 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20 }}>Branch Management</span>
        <button onClick={openAdd} style={{ padding:'8px 16px', background:'#e63012', border:'none', borderRadius:6, color:'#fff', fontFamily:"'Rajdhani',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add Branch</button>
      </div>

      {branches.map(b => (
        <div key={b.id} style={{ background:'#181818', border:'1.5px solid #252525', borderRadius:8, padding:'16px 18px', marginBottom:12, display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(230,48,18,.08)', border:'1.5px solid #e63012', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🏪</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:17, fontWeight:700 }}>{b.name}</div>
            <div style={{ fontSize:11, color:'#555', marginTop:2 }}>{b.address||'—'}{b.phone?' · '+b.phone:''}</div>
          </div>
          <span style={{ fontSize:11, fontWeight:600, color:'#22c55e' }}>📍 Active</span>
          <button onClick={()=>openEdit(b)} style={{ width:32, height:32, borderRadius:6, border:'1.5px solid #252525', background:'transparent', color:'#555', cursor:'pointer', fontSize:13 }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='#f59e0b'; e.currentTarget.style.color='#f59e0b' }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='#252525'; e.currentTarget.style.color='#555' }}>✏</button>
          <button onClick={()=>onDelete(b.id)} style={{ width:32, height:32, borderRadius:6, border:'1.5px solid #252525', background:'transparent', color:'#555', cursor:'pointer', fontSize:13 }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='#ef4444'; e.currentTarget.style.color='#ef4444' }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='#252525'; e.currentTarget.style.color='#555' }}>🗑</button>
        </div>
      ))}

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editing?'Edit Branch':'Add Branch'}>
        <div style={{ marginBottom:14 }}><label style={{ fontSize:11, color:'#555', fontWeight:600, textTransform:'uppercase' }}>Branch Name</label><input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. City Branch" /></div>
        <div style={{ marginBottom:14 }}><label style={{ fontSize:11, color:'#555', fontWeight:600, textTransform:'uppercase' }}>Address</label><input style={inp} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Street, City" /></div>
        <div style={{ marginBottom:14 }}><label style={{ fontSize:11, color:'#555', fontWeight:600, textTransform:'uppercase' }}>Phone</label><input style={inp} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 xxxxx xxxxx" /></div>
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          <button onClick={()=>setModalOpen(false)} style={{ flex:1, padding:11, borderRadius:6, border:'1.5px solid #252525', background:'transparent', color:'#666', fontFamily:"'Rajdhani',sans-serif", fontSize:13, fontWeight:700, cursor:'pointer', textTransform:'uppercase' }}>Cancel</button>
          <button onClick={handleSave} style={{ flex:1, padding:11, borderRadius:6, border:'none', background:'#e63012', color:'#fff', fontFamily:"'Rajdhani',sans-serif", fontSize:13, fontWeight:700, cursor:'pointer', textTransform:'uppercase' }}>Save</button>
        </div>
      </Modal>
    </div>
  )
}
