import { useState, useEffect, useMemo } from 'react'
import { STATUS_FLOW } from '../data/menu.js'

const badge = (status) => {
  const map = { pending: ['#f59e0b','rgba(245,158,11,.12)'], preparing: ['#3b82f6','rgba(59,130,246,.12)'], ready: ['#a855f7','rgba(168,85,247,.12)'], done: ['#22c55e','rgba(34,197,94,.12)'] }
  const [clr, bg] = map[status] || ['#555','transparent']
  return { display:'inline-block', padding:'2px 8px', borderRadius:16, fontSize:10, fontWeight:700, letterSpacing:.8, textTransform:'uppercase', color:clr, background:bg, border:`1px solid ${clr}` }
}

export default function OrdersPage({ orders, branches, activeBranch, updateOrderStatus, deleteOrder, loadOrdersFromAPI, openBill, openKOT, sendWhatsApp, showToast }) {
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0,10))
  const [stats, setStats] = useState({ count:0, revenue:0, avg:0, pending:0 })

  useEffect(() => { loadOrdersFromAPI({ branchId: activeBranch, status: filterStatus, date: filterDate }) }, [activeBranch, filterStatus, filterDate])

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (activeBranch && o.branchId && o.branchId !== activeBranch) return false
      if (filterStatus && o.status !== filterStatus) return false
      if (filterDate && !new Date(o.createdAt).toISOString().startsWith(filterDate)) return false
      return true
    })
  }, [orders, activeBranch, filterStatus, filterDate])

  useEffect(() => {
    const today = new Date().toDateString()
    const td = orders.filter(o => new Date(o.createdAt).toDateString() === today)
    const rev = td.reduce((s,o) => s+(o.total||0), 0)
    setStats({ count:td.length, revenue:rev, avg: td.length ? Math.round(rev/td.length) : 0, pending: td.filter(o=>o.status==='pending').length })
  }, [orders])

  const selStyle = { background:'#181818', border:'1.5px solid #252525', borderRadius:6, color:'#f0ede8', fontFamily:"'Rajdhani',sans-serif", fontSize:13, padding:'7px 12px', outline:'none' }
  const ibtn = { width:30, height:30, borderRadius:5, border:'1.5px solid #252525', background:'transparent', color:'#555', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, transition:'all .2s' }

  return (
    <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, padding:'14px 18px', borderBottom:'1px solid #252525', flexShrink:0 }}>
        {[['Today Orders', stats.count, '#e63012'],['Revenue','₹'+stats.revenue,'#22c55e'],['Avg Order','₹'+stats.avg,'#f59e0b'],['Pending',stats.pending,'#3b82f6']].map(([l,v,c])=>(
          <div key={l} style={{ background:'#181818', border:'1.5px solid #252525', borderRadius:7, padding:'12px 14px' }}>
            <div style={{ fontSize:10, color:'#555', textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>{l}</div>
            <div style={{ fontSize:22, fontWeight:700, fontFamily:"'Playfair Display',serif", color:c }}>{v}</div>
          </div>
        ))}
      </div>
      {/* Toolbar */}
      <div style={{ padding:'10px 18px', borderBottom:'1px solid #252525', display:'flex', gap:8, alignItems:'center', flexShrink:0, flexWrap:'wrap' }}>
        <select style={selStyle} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUS_FLOW.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <input type="date" style={selStyle} value={filterDate} onChange={e=>setFilterDate(e.target.value)} />
        <button onClick={()=>loadOrdersFromAPI({branchId:activeBranch,status:filterStatus,date:filterDate})} style={{ ...selStyle, cursor:'pointer', padding:'7px 14px' }}>↺ Refresh</button>
        <div style={{ flex:1 }}></div>
        <button onClick={()=>{
          const api = localStorage.getItem('jk_api')||''
          if(api) window.open(`${api}/export/excel?from=${filterDate}&to=${filterDate}&branchId=${activeBranch}`,'_blank')
          else showToast('Connect backend for Excel','e')
        }} style={{ padding:'7px 16px', background:'#e63012', border:'none', borderRadius:6, color:'#fff', fontFamily:"'Rajdhani',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>⬇ Export Excel</button>
      </div>
      {/* List */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 18px' }}>
        {!filtered.length ? (
          <div style={{ textAlign:'center', padding:40, color:'#555' }}>No orders found</div>
        ) : filtered.map(o => (
          <div key={o.id} style={{ background:'#181818', border:'1.5px solid #252525', borderRadius:7, padding:'12px 14px', marginBottom:9, display:'flex', alignItems:'center', gap:12, transition:'border-color .2s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='#e63012'} onMouseLeave={e=>e.currentTarget.style.borderColor='#252525'}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:10, color:'#555', marginBottom:2 }}>{o.id} · {new Date(o.createdAt).toLocaleString('en-IN')} · {o.branchName||'Main'}</div>
              <div style={{ fontSize:15, fontWeight:700 }}>Table {o.tableNo} — {o.customer}{o.phone?' · '+o.phone:''}</div>
              <div style={{ fontSize:11, color:'#a09890', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{o.items.map(i=>i.name+'×'+i.qty).join(', ')}</div>
              <div style={{ marginTop:6 }}><span style={badge(o.status)}>{o.status}</span></div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:19, fontWeight:700, color:'#f59e0b' }}>₹{o.total}</div>
              <div style={{ display:'flex', gap:5, marginTop:7, justifyContent:'flex-end' }}>
                <button style={ibtn} title="KOT" onClick={()=>openKOT(o)} onMouseEnter={e=>e.currentTarget.style.borderColor='#3b82f6'} onMouseLeave={e=>e.currentTarget.style.borderColor='#252525'}>🍳</button>
                <button style={ibtn} title="Bill" onClick={()=>openBill(o)} onMouseEnter={e=>e.currentTarget.style.borderColor='#22c55e'} onMouseLeave={e=>e.currentTarget.style.borderColor='#252525'}>🖨</button>
                {o.phone && <button style={ibtn} title="WhatsApp" onClick={()=>sendWhatsApp(o)} onMouseEnter={e=>e.currentTarget.style.borderColor='#22c55e'} onMouseLeave={e=>e.currentTarget.style.borderColor='#252525'}>📱</button>}
                <button style={ibtn} title="Next Status" onClick={()=>{ const idx=STATUS_FLOW.indexOf(o.status); if(idx<STATUS_FLOW.length-1) updateOrderStatus(o.id, STATUS_FLOW[idx+1]) }} onMouseEnter={e=>e.currentTarget.style.borderColor='#f59e0b'} onMouseLeave={e=>e.currentTarget.style.borderColor='#252525'}>→</button>
                <button style={ibtn} title="Mark Done" onClick={()=>updateOrderStatus(o.id,'done')} onMouseEnter={e=>e.currentTarget.style.borderColor='#22c55e'} onMouseLeave={e=>e.currentTarget.style.borderColor='#252525'}>✓</button>
                <button style={ibtn} title="Delete" onClick={()=>deleteOrder(o.id)} onMouseEnter={e=>e.currentTarget.style.borderColor='#ef4444'} onMouseLeave={e=>e.currentTarget.style.borderColor='#252525'}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
