import { useState, useCallback } from 'react'
import { apiFetch } from '../utils/api.js'

export default function ReportPage({ orders, branches, activeBranch, showToast }) {
  const today = new Date().toISOString().slice(0,10)
  const monthStart = new Date(new Date().setDate(1)).toISOString().slice(0,10)
  const [from, setFrom] = useState(monthStart)
  const [to, setTo] = useState(today)
  const [repBranch, setRepBranch] = useState('all')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)

  const inp = { background:'#181818', border:'1.5px solid #252525', borderRadius:6, color:'#f0ede8', fontFamily:"'Rajdhani',sans-serif", fontSize:13, padding:'7px 12px', outline:'none' }

  const generate = useCallback(async () => {
    setLoading(true)
    const api = localStorage.getItem('jk_api')||''
    let data
    if (api) {
      try { data = await apiFetch(`/orders/report/range?from=${from}&to=${to}&branchId=${repBranch}`) }
      catch(e) { data = localFilter() }
    } else { data = localFilter() }
    setReportData(data)
    setLoading(false)
  }, [from, to, repBranch, orders])

  const localFilter = () => {
    const s=new Date(from); s.setHours(0,0,0,0)
    const e=new Date(to); e.setHours(23,59,59,999)
    return orders.filter(o=>{ const d=new Date(o.createdAt); if(d<s||d>e) return false; if(repBranch!=='all'&&o.branchId!==repBranch) return false; return true })
  }

  const exportExcel = () => {
    const api = localStorage.getItem('jk_api')||''
    if (api) window.open(`${api}/export/excel?from=${from}&to=${to}&branchId=${repBranch}`,'_blank')
    else showToast('Connect backend API for Excel export','e')
  }

  const summary = reportData ? {
    count: reportData.length,
    revenue: reportData.reduce((s,o)=>s+(o.total||0),0),
    gst: reportData.reduce((s,o)=>s+(o.gst||0),0),
    avg: reportData.length ? Math.round(reportData.reduce((s,o)=>s+(o.total||0),0)/reportData.length) : 0
  } : null

  const dayMap = reportData ? reportData.reduce((m,o)=>{
    const d=new Date(o.createdAt).toLocaleDateString('en-IN')
    if(!m[d]) m[d]={date:d,count:0,rev:0,gst:0}
    m[d].count++; m[d].rev+=o.total||0; m[d].gst+=o.gst||0; return m
  },{}) : {}

  const itemMap = reportData ? reportData.reduce((m,o)=>{
    o.items.forEach(i=>{ if(!m[i.name]) m[i.name]={name:i.name,cat:i.category,qty:0,rev:0}; m[i.name].qty+=i.qty; m[i.name].rev+=i.price*i.qty })
    return m
  },{}) : {}

  const th = { textAlign:'left', padding:'7px 8px', borderBottom:'1.5px solid #252525', color:'#555', fontSize:10, textTransform:'uppercase', letterSpacing:.8 }
  const td = { padding:'7px 8px', borderBottom:'1px solid #1e1e1e', fontSize:12 }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:18 }}>
      <div style={{ background:'#181818', border:'1.5px solid #252525', borderRadius:8, padding:18, marginBottom:14 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:'#f59e0b', marginBottom:14 }}>📊 Sales Report</div>
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
          <label style={{ fontSize:11, color:'#555', fontWeight:600 }}>From</label>
          <input type="date" style={inp} value={from} onChange={e=>setFrom(e.target.value)} />
          <label style={{ fontSize:11, color:'#555', fontWeight:600 }}>To</label>
          <input type="date" style={inp} value={to} onChange={e=>setTo(e.target.value)} />
          <select style={inp} value={repBranch} onChange={e=>setRepBranch(e.target.value)}>
            <option value="all">All Branches</option>
            {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button onClick={generate} disabled={loading} style={{ padding:'7px 16px', background:'#e63012', border:'none', borderRadius:6, color:'#fff', fontFamily:"'Rajdhani',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>{loading?'Loading...':'Generate'}</button>
          <button onClick={exportExcel} style={{ padding:'7px 16px', background:'transparent', border:'1.5px solid #252525', borderRadius:6, color:'#555', fontFamily:"'Rajdhani',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>⬇ Excel</button>
        </div>

        {summary && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:18 }}>
              {[['Total Orders',summary.count,'#e63012'],['Revenue','₹'+summary.revenue,'#22c55e'],['GST Collected','₹'+summary.gst,'#3b82f6'],['Avg / Order','₹'+summary.avg,'#f59e0b']].map(([l,v,c])=>(
                <div key={l} style={{ background:'#111', border:'1px solid #252525', borderRadius:6, padding:'12px 14px' }}>
                  <div style={{ fontSize:10, color:'#555', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:20, fontWeight:700, fontFamily:"'Playfair Display',serif", color:c }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:15, color:'#f59e0b', marginBottom:10 }}>Daily Breakdown</div>
            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:20 }}>
              <thead><tr><th style={th}>Date</th><th style={th}>Orders</th><th style={th}>Revenue</th><th style={th}>GST</th><th style={th}>Avg</th></tr></thead>
              <tbody>
                {Object.values(dayMap).length ? Object.values(dayMap).map(d=>(
                  <tr key={d.date}><td style={td}>{d.date}</td><td style={td}>{d.count}</td><td style={{...td,color:'#22c55e',fontWeight:600}}>₹{d.rev}</td><td style={td}>₹{d.gst}</td><td style={td}>₹{Math.round(d.rev/d.count)}</td></tr>
                )) : <tr><td colSpan={5} style={{ ...td, textAlign:'center', color:'#555', padding:20 }}>No data</td></tr>}
              </tbody>
            </table>

            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:15, color:'#f59e0b', marginBottom:10 }}>🏆 Top Items</div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><th style={th}>Item</th><th style={th}>Category</th><th style={th}>Qty Sold</th><th style={th}>Revenue</th></tr></thead>
              <tbody>
                {Object.values(itemMap).length ? Object.values(itemMap).sort((a,b)=>b.rev-a.rev).map(i=>(
                  <tr key={i.name}><td style={{...td,fontWeight:600}}>{i.name}</td><td style={{...td,color:'#a09890'}}>{i.cat}</td><td style={{...td,color:'#f59e0b',fontWeight:700}}>{i.qty}</td><td style={{...td,color:'#22c55e',fontWeight:700}}>₹{i.rev}</td></tr>
                )) : <tr><td colSpan={4} style={{ ...td, textAlign:'center', color:'#555', padding:20 }}>No data</td></tr>}
              </tbody>
            </table>
          </>
        )}
        {!summary && !loading && <div style={{ textAlign:'center', padding:30, color:'#555' }}>Click "Generate" to load report</div>}
      </div>
    </div>
  )
}
