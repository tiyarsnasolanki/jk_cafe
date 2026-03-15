import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_MENU } from './data/menu.js'
import { apiFetch, apiPost, apiPatch, apiDelete, getExcelUrl } from './utils/api.js'
import { printHTML, buildBillHTML, buildKOTHTML, buildWhatsAppMsg } from './utils/print.js'
import { useToast } from './hooks/useToast.js'
import Header from './components/Header.jsx'
import Nav from './components/Nav.jsx'
import POSPage from './components/POSPage.jsx'
import OrdersPage from './components/OrdersPage.jsx'
import ReportPage from './components/ReportPage.jsx'
import MenuMgmt from './components/MenuMgmt.jsx'
import BranchesPage from './components/BranchesPage.jsx'
import Modal from './components/Modal.jsx'
import Toast from './components/Toast.jsx'
import SetupModal from './components/SetupModal.jsx'

export default function App() {
  const [page, setPage] = useState('pos')
  const [menuItems, setMenuItems] = useState(() => JSON.parse(localStorage.getItem('jk_menu') || 'null') || DEFAULT_MENU)
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('jk_orders') || '[]'))
  const [branches, setBranches] = useState(() => JSON.parse(localStorage.getItem('jk_branches') || 'null') || [{ id: 'branch_main', name: 'Main Branch', address: 'Bardoli, Gujarat', phone: '' }])
  const [activeBranch, setActiveBranch] = useState(() => localStorage.getItem('jk_active_branch') || 'branch_main')
  const [cart, setCart] = useState([])
  const [tableNo, setTableNo] = useState('')
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [dbOnline, setDbOnline] = useState(false)
  const [billOrder, setBillOrder] = useState(null)
  const [kotOrder, setKotOrder] = useState(null)
  const [setupOpen, setSetupOpen] = useState(false)
  const [kotCounter, setKotCounter] = useState(() => parseInt(localStorage.getItem('jk_kot') || '1'))
  const { toast, showToast } = useToast()

  // Init
  useEffect(() => {
    const api = localStorage.getItem('jk_api') || ''
    if (api) {
      Promise.all([apiFetch('/branches'), apiFetch('/menu')])
        .then(([br, mn]) => {
          setBranches(br); setMenuItems(mn)
          localStorage.setItem('jk_branches', JSON.stringify(br))
          localStorage.setItem('jk_menu', JSON.stringify(mn))
          setDbOnline(true)
        })
        .catch(() => setDbOnline(false))
    }
  }, [])

  const saveLocal = useCallback((key, val) => localStorage.setItem(key, JSON.stringify(val)), [])

  // ── CART ──
  const addToCart = useCallback((item) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...item, qty: 1 }]
    })
    showToast(item.name + ' added ✓')
  }, [showToast])

  const changeQty = useCallback((id, delta) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0))
  }, [])

  const removeFromCart = useCallback((id) => setCart(prev => prev.filter(c => c.id !== id)), [])

  const clearCart = useCallback(() => {
    setCart([]); setTableNo(''); setCustName(''); setCustPhone('')
  }, [])

  const cartSub = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartGst = Math.round(cartSub * 0.05)
  const cartTotal = cartSub + cartGst

  // ── SAVE ORDER ──
  const saveOrder = useCallback(async () => {
    if (!cart.length) { showToast('Add items first', 'e'); return }
    const branch = branches.find(b => b.id === activeBranch) || branches[0]
    const order = {
      id: 'ORD' + Date.now(),
      branchId: branch.id, branchName: branch.name,
      tableNo: tableNo || 'Take-Away',
      customer: custName || 'Guest',
      phone: custPhone || '',
      items: [...cart], subtotal: cartSub, gst: cartGst, total: cartTotal,
      status: 'pending', createdAt: new Date().toISOString()
    }
    const api = localStorage.getItem('jk_api') || ''
    if (api) { try { await apiPost('/orders', order) } catch (e) {} }
    const updated = [order, ...orders].slice(0, 1000)
    setOrders(updated); saveLocal('jk_orders', updated)
    showToast('Order saved ✓'); clearCart()
  }, [cart, branches, activeBranch, tableNo, custName, custPhone, cartSub, cartGst, cartTotal, orders, clearCart, showToast, saveLocal])

  // ── KOT ──
  const openKOT = useCallback((orderData) => {
    const order = orderData || {
      items: cart, tableNo: tableNo || 'Take-Away',
      customer: custName || 'Guest', createdAt: new Date().toISOString()
    }
    if (!order.items.length) { showToast('Add items first', 'e'); return }
    setKotOrder(order)
  }, [cart, tableNo, custName, showToast])

  const printKOT = useCallback(() => {
    if (!kotOrder) return
    const branch = branches.find(b => b.id === activeBranch)
    printHTML(buildKOTHTML(kotOrder, kotCounter, branch?.name))
    const next = kotCounter + 1
    setKotCounter(next); localStorage.setItem('jk_kot', next)
    setKotOrder(null); showToast('KOT printed ✓')
  }, [kotOrder, kotCounter, branches, activeBranch, showToast])

  // ── BILL ──
  const openBill = useCallback((orderData) => {
    if (!orderData && !cart.length) { showToast('Add items first', 'e'); return }
    setBillOrder(orderData || {
      items: cart, subtotal: cartSub, gst: cartGst, total: cartTotal,
      tableNo: tableNo || 'Take-Away', customer: custName || 'Guest',
      phone: custPhone, createdAt: new Date().toISOString()
    })
  }, [cart, cartSub, cartGst, cartTotal, tableNo, custName, custPhone, showToast])

  const printBill = useCallback(() => {
    if (!billOrder) return
    const branch = branches.find(b => b.id === activeBranch)
    printHTML(buildBillHTML(billOrder, branch?.name))
    setBillOrder(null); showToast('Bill printed ✓')
  }, [billOrder, branches, activeBranch, showToast])

  // ── WHATSAPP ──
  const sendWhatsApp = useCallback((order) => {
    const phone = order.phone?.replace(/\D/g, '') || ''
    if (!phone) { showToast('No phone number', 'e'); return }
    const num = phone.startsWith('91') ? phone : '91' + phone
    const msg = buildWhatsAppMsg(order)
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
  }, [showToast])

  // ── ORDER STATUS ──
  const updateOrderStatus = useCallback(async (id, status) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o)
    setOrders(updated); saveLocal('jk_orders', updated)
    const api = localStorage.getItem('jk_api') || ''
    if (api) { try { await apiPatch('/orders/' + id, { status }) } catch (e) {} }
    showToast('Status updated ✓')
  }, [orders, saveLocal, showToast])

  const deleteOrder = useCallback(async (id) => {
    const updated = orders.filter(o => o.id !== id)
    setOrders(updated); saveLocal('jk_orders', updated)
    const api = localStorage.getItem('jk_api') || ''
    if (api) { try { await apiDelete('/orders/' + id) } catch (e) {} }
    showToast('Order deleted')
  }, [orders, saveLocal, showToast])

  const loadOrdersFromAPI = useCallback(async (filters = {}) => {
    const api = localStorage.getItem('jk_api') || ''
    if (!api) return orders
    try {
      let q = '?'
      if (filters.branchId) q += `branchId=${filters.branchId}&`
      if (filters.status) q += `status=${filters.status}&`
      if (filters.date) q += `date=${filters.date}&`
      const data = await apiFetch('/orders' + q)
      setOrders(data); saveLocal('jk_orders', data)
      return data
    } catch (e) { return orders }
  }, [orders, saveLocal])

  // ── MENU MGMT ──
  const saveMenuItem = useCallback(async (item) => {
    let updated
    const api = localStorage.getItem('jk_api') || ''
    if (item.id && menuItems.find(m => m.id === item.id)) {
      updated = menuItems.map(m => m.id === item.id ? { ...m, ...item } : m)
      if (api) { try { await apiPatch('/menu/' + item.id, item) } catch (e) {} }
    } else {
      const newItem = { ...item, id: 'item_' + Date.now(), available: true }
      updated = [...menuItems, newItem]
      if (api) { try { await apiPost('/menu', newItem) } catch (e) {} }
    }
    setMenuItems(updated); saveLocal('jk_menu', updated)
    showToast('Menu updated ✓')
  }, [menuItems, saveLocal, showToast])

  const deleteMenuItem = useCallback(async (id) => {
    const updated = menuItems.filter(m => m.id !== id)
    setMenuItems(updated); saveLocal('jk_menu', updated)
    const api = localStorage.getItem('jk_api') || ''
    if (api) { try { await apiDelete('/menu/' + id) } catch (e) {} }
    showToast('Item deleted')
  }, [menuItems, saveLocal, showToast])

  const toggleMenuItem = useCallback(async (id) => {
    const updated = menuItems.map(m => m.id === id ? { ...m, available: !m.available } : m)
    setMenuItems(updated); saveLocal('jk_menu', updated)
    const item = updated.find(m => m.id === id)
    const api = localStorage.getItem('jk_api') || ''
    if (api) { try { await apiPatch('/menu/' + id, { available: item.available }) } catch (e) {} }
  }, [menuItems, saveLocal])

  // ── BRANCHES ──
  const saveBranch = useCallback(async (branch) => {
    let updated
    const api = localStorage.getItem('jk_api') || ''
    if (branch.id && branches.find(b => b.id === branch.id)) {
      updated = branches.map(b => b.id === branch.id ? { ...b, ...branch } : b)
      if (api) { try { await apiPatch('/branches/' + branch.id, branch) } catch (e) {} }
    } else {
      const nb = { ...branch, id: 'branch_' + Date.now(), active: true }
      updated = [...branches, nb]
      if (api) { try { await apiPost('/branches', nb) } catch (e) {} }
    }
    setBranches(updated); saveLocal('jk_branches', updated)
    showToast('Branch saved ✓')
  }, [branches, saveLocal, showToast])

  const deleteBranch = useCallback(async (id) => {
    const updated = branches.filter(b => b.id !== id)
    setBranches(updated); saveLocal('jk_branches', updated)
    const api = localStorage.getItem('jk_api') || ''
    if (api) { try { await apiDelete('/branches/' + id) } catch (e) {} }
    showToast('Branch removed')
  }, [branches, saveLocal, showToast])

  const handleBranchChange = (id) => {
    setActiveBranch(id); localStorage.setItem('jk_active_branch', id)
  }

  const handleSetupSave = async (url) => {
    localStorage.setItem('jk_api', url)
    setSetupOpen(false)
    if (url) {
      try {
        const [br, mn] = await Promise.all([apiFetch('/branches'), apiFetch('/menu')])
        setBranches(br); setMenuItems(mn)
        localStorage.setItem('jk_branches', JSON.stringify(br))
        localStorage.setItem('jk_menu', JSON.stringify(mn))
        setDbOnline(true); showToast('MongoDB connected ✓')
      } catch (e) { setDbOnline(false); showToast('Cannot connect to API', 'e') }
    } else { setDbOnline(false); showToast('Local mode saved') }
  }

  const sharedProps = {
    menuItems, orders, branches, activeBranch, dbOnline,
    showToast, updateOrderStatus, deleteOrder, loadOrdersFromAPI,
    saveMenuItem, deleteMenuItem, toggleMenuItem,
    saveBranch, deleteBranch,
    openBill, openKOT, sendWhatsApp
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        branches={branches}
        activeBranch={activeBranch}
        onBranchChange={handleBranchChange}
        dbOnline={dbOnline}
        onSetup={() => setSetupOpen(true)}
      />
      <Nav page={page} onNav={setPage} />

      <div style={{ flex: 1, overflow: 'hidden', display: page === 'pos' ? undefined : 'flex', flexDirection: 'column' }}>
        {page === 'pos' && (
          <POSPage
            menuItems={menuItems}
            cart={cart}
            tableNo={tableNo} setTableNo={setTableNo}
            custName={custName} setCustName={setCustName}
            custPhone={custPhone} setCustPhone={setCustPhone}
            onAdd={addToCart}
            onChangeQty={changeQty}
            onRemove={removeFromCart}
            onClear={clearCart}
            onSave={saveOrder}
            onKOT={() => openKOT()}
            onBill={() => openBill()}
            cartSub={cartSub} cartGst={cartGst} cartTotal={cartTotal}
          />
        )}
        {page === 'orders' && <OrdersPage {...sharedProps} activeBranch={activeBranch} />}
        {page === 'report' && <ReportPage {...sharedProps} activeBranch={activeBranch} />}
        {page === 'menu' && <MenuMgmt menuItems={menuItems} onSave={saveMenuItem} onDelete={deleteMenuItem} onToggle={toggleMenuItem} showToast={showToast} />}
        {page === 'branches' && <BranchesPage branches={branches} onSave={saveBranch} onDelete={deleteBranch} showToast={showToast} />}
      </div>

      {/* Bill Modal */}
      <Modal open={!!billOrder} onClose={() => setBillOrder(null)} title="Customer Bill">
        {billOrder && (
          <div>
            <div style={styles.billPreview}>
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#cc2200' }}>JK Spicy Dosa Cafe</div>
                <div style={{ fontSize: 11, color: '#666' }}>{branches.find(b => b.id === activeBranch)?.name}</div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px dashed #ccc', margin: '7px 0' }} />
              <div style={styles.billRow}><span>Table: <b>{billOrder.tableNo}</b></span><span>{billOrder.customer}</span></div>
              {billOrder.items.map(i => (
                <div key={i.id} style={styles.billRow}><span>{i.name} ×{i.qty}</span><span>₹{i.price * i.qty}</span></div>
              ))}
              <hr style={{ border: 'none', borderTop: '1px dashed #ccc', margin: '7px 0' }} />
              <div style={styles.billRow}><span style={{ color: '#666' }}>Subtotal</span><span>₹{billOrder.subtotal}</span></div>
              <div style={styles.billRow}><span style={{ color: '#666' }}>GST 5%</span><span>₹{billOrder.gst}</span></div>
              <div style={{ ...styles.billRow, fontWeight: 700, fontSize: 16, color: '#cc2200' }}><span>TOTAL</span><span>₹{billOrder.total}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={styles.mbtnGhost} onClick={() => setBillOrder(null)}>Close</button>
              {billOrder.phone && <button style={styles.mbtnBlue} onClick={() => sendWhatsApp(billOrder)}>📱 WhatsApp</button>}
              <button style={styles.mbtnGreen} onClick={printBill}>🖨 Print</button>
            </div>
          </div>
        )}
      </Modal>

      {/* KOT Modal */}
      <Modal open={!!kotOrder} onClose={() => setKotOrder(null)} title={`KOT #${kotCounter}`}>
        {kotOrder && (
          <div>
            <div style={styles.kotPreview}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1 }}>⚡ KITCHEN ORDER</div>
                <div style={{ fontSize: 11 }}>Table: {kotOrder.tableNo} | KOT #{kotCounter}</div>
              </div>
              {kotOrder.items.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #ccc', fontSize: 14, fontWeight: 600 }}>
                  <span>{i.name}</span><span style={{ fontSize: 18, fontWeight: 900 }}>×{i.qty}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={styles.mbtnGhost} onClick={() => setKotOrder(null)}>Close</button>
              <button style={styles.mbtnRed} onClick={printKOT}>🖨 Print KOT</button>
            </div>
          </div>
        )}
      </Modal>

      <SetupModal open={setupOpen} onClose={() => setSetupOpen(false)} onSave={handleSetupSave} />
      <Toast toast={toast} />
    </div>
  )
}

const styles = {
  billPreview: { background: '#fff', color: '#000', padding: 14, borderRadius: 6, marginBottom: 14, fontFamily: "'Noto Sans',sans-serif", fontSize: 12 },
  kotPreview: { background: '#fff', color: '#000', padding: 14, borderRadius: 6, marginBottom: 14, fontFamily: "'Noto Sans',sans-serif" },
  billRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 },
  mbtnGhost: { flex: 1, padding: '10px 8px', borderRadius: 6, border: '1.5px solid #2a2a2a', background: 'transparent', color: '#888', fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' },
  mbtnGreen: { flex: 1, padding: '10px 8px', borderRadius: 6, border: 'none', background: '#22c55e', color: '#fff', fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' },
  mbtnRed: { flex: 1, padding: '10px 8px', borderRadius: 6, border: 'none', background: '#e63012', color: '#fff', fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' },
  mbtnBlue: { flex: 1, padding: '10px 8px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' },
}
