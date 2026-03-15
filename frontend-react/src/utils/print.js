export function printHTML(html) {
  const w = window.open('', '_blank', 'width=420,height=680');
  w.document.write(`<!DOCTYPE html><html><head>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Noto+Sans:wght@400;600&display=swap" rel="stylesheet">
    <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Noto Sans',sans-serif;font-size:12px;padding:12px;background:#fff;color:#000;}
    h2{font-family:'Playfair Display',serif;font-size:20px;color:#cc2200;text-align:center;}
    .center{text-align:center;} .right{text-align:right;}
    .row{display:flex;justify-content:space-between;font-size:11px;color:#444;margin-bottom:3px;}
    hr{border:none;border-top:1.5px dashed #ccc;margin:7px 0;}
    table{width:100%;border-collapse:collapse;margin:6px 0;}
    th{font-size:10px;font-weight:700;border-bottom:1px solid #ccc;padding:3px 2px;text-align:left;}
    td{padding:3px 2px;font-size:11px;} .tr{text-align:right;}
    .big{font-size:15px;font-weight:700;color:#cc2200;}
    .foot{text-align:center;font-size:10px;color:#999;margin-top:8px;}
    .kot-h{border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:8px;text-align:center;}
    .kot-h h3{font-size:18px;font-weight:900;letter-spacing:1px;}
    .kot-td{padding:5px 2px;font-size:13px;font-weight:600;border-bottom:1px dashed #ccc;}
    @media print{@page{margin:4mm;}}
    </style></head><body>${html}</body></html>`);
  w.document.close();
  w.onload = () => { w.print(); setTimeout(() => w.close(), 500); };
}

export function buildBillHTML(order, branchName) {
  const { items, subtotal, gst, total, tableNo, customer, phone, createdAt } = order;
  const now = new Date(createdAt || Date.now());
  const rows = items.map(i =>
    `<tr><td>${i.name}</td><td class="tr">${i.qty}</td><td class="tr">₹${i.price}</td><td class="tr">₹${i.price * i.qty}</td></tr>`
  ).join('');
  return `
    <div class="center"><h2>JK Spicy Dosa Cafe</h2>
    <p style="font-size:10px;color:#666;">${branchName || 'Main Branch'}</p>
    <p style="font-size:9px;color:#888;margin-top:2px;">WE USE AMUL CHEESE BUTTER</p></div>
    <hr>
    <div class="row"><span>Table: <b>${tableNo}</b></span><span>Customer: <b>${customer}</b></span></div>
    ${phone ? `<div class="row"><span>Phone: <b>${phone}</b></span></div>` : ''}
    <div class="row"><span>${now.toLocaleDateString('en-IN')}</span><span>${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
    <hr>
    <table><thead><tr><th>Item</th><th class="tr">Qty</th><th class="tr">Rate</th><th class="tr">Amt</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <hr>
    <div class="right">
      <div>Subtotal: ₹${subtotal}</div>
      <div>GST @5%: ₹${gst}</div>
      <div class="big">TOTAL: ₹${total}</div>
    </div>
    <div class="foot">Thank you for visiting! Come again 🙏</div>`;
}

export function buildKOTHTML(order, kotNo, branchName) {
  const { items, tableNo, customer, createdAt } = order;
  const now = new Date(createdAt || Date.now());
  const rows = items.map(i =>
    `<tr><td class="kot-td">${i.name}</td><td class="kot-td tr" style="font-size:16px;font-weight:900;">${i.qty}</td></tr>`
  ).join('');
  return `
    <div class="kot-h"><h3>⚡ KITCHEN ORDER</h3><p>${branchName || 'Main Branch'}</p></div>
    <div class="row"><span>KOT #: <b>${kotNo}</b></span><span>${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
    <div class="row"><span>Table: <b>${tableNo}</b></span><span>Customer: <b>${customer}</b></span></div>
    <hr>
    <table><thead><tr><th>Item</th><th class="tr">Qty</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="foot">Printed: ${now.toLocaleString('en-IN')}</div>`;
}

export function buildWhatsAppMsg(order) {
  const { items, subtotal, gst, total, tableNo, customer } = order;
  const lines = items.map(i => `• ${i.name} x${i.qty} = ₹${i.price * i.qty}`).join('\n');
  return `🍛 *JK Spicy Dosa Cafe*\n━━━━━━━━━━━━━━━━━\nTable: ${tableNo} | ${customer}\n━━━━━━━━━━━━━━━━━\n${lines}\n━━━━━━━━━━━━━━━━━\nSubtotal: ₹${subtotal}\nGST (5%): ₹${gst}\n*TOTAL: ₹${total}*\n━━━━━━━━━━━━━━━━━\n_Thank you! Come again_ 🙏`;
}
