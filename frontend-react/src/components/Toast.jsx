export default function Toast({ toast }) {
  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: toast.type === 'e' ? '#ef4444' : '#22c55e',
      color: '#fff', padding: '10px 22px', borderRadius: 8,
      fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14,
      zIndex: 9999, opacity: toast.show ? 1 : 0,
      transition: 'opacity .3s', pointerEvents: 'none', whiteSpace: 'nowrap',
      boxShadow: '0 6px 24px rgba(0,0,0,.5)'
    }}>
      {toast.msg}
    </div>
  )
}
