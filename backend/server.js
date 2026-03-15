require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── MongoDB ────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected');
    // Auto-seed on first run
    autoSeed();
  })
  .catch(err => console.error('❌ MongoDB error:', err.message));

async function autoSeed() {
  try {
    const MenuItem = require('./models/MenuItem');
    const Branch   = require('./models/Branch');
    const mCount = await MenuItem.countDocuments();
    if (mCount === 0) {
      const { DEFAULT_MENU } = require('./routes/menu');
      await MenuItem.insertMany(DEFAULT_MENU.map(i => ({ ...i, available: true, branchId: 'all' })));
      console.log(`🌱 Seeded ${DEFAULT_MENU.length} menu items`);
    }
    const bCount = await Branch.countDocuments();
    if (bCount === 0) {
      await Branch.create({ id: 'branch_main', name: 'Main Branch', address: 'Bardoli, Gujarat', phone: '' });
      console.log('🌱 Seeded default branch');
    }
  } catch (e) { console.error('Seed error:', e.message); }
}

// ── Routes ─────────────────────────────────────────────────
app.use('/orders',   require('./routes/orders'));
app.use('/menu',     require('./routes/menu'));
app.use('/branches', require('./routes/branches'));

// ── Health ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '2.0.0'
  });
});

// ── Excel Export ───────────────────────────────────────────
app.get('/export/excel', async (req, res) => {
  try {
    const Order = require('./models/Order');
    const { from, to, branchId } = req.query;

    const start = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 30));
    start.setHours(0,0,0,0);
    const end = to ? new Date(to) : new Date();
    end.setHours(23,59,59,999);

    const filter = { createdAt: { $gte: start, $lte: end } };
    if (branchId && branchId !== 'all') filter.branchId = branchId;

    const orders = await Order.find(filter).sort({ createdAt: 1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'JK Spicy Dosa Cafe';

    // ── Sheet 1: Orders Summary ──
    const sheet1 = workbook.addWorksheet('Orders Summary');
    sheet1.columns = [
      { header: 'Order ID', key: 'id', width: 20 },
      { header: 'Branch', key: 'branchName', width: 18 },
      { header: 'Date', key: 'date', width: 16 },
      { header: 'Time', key: 'time', width: 12 },
      { header: 'Table', key: 'tableNo', width: 10 },
      { header: 'Customer', key: 'customer', width: 18 },
      { header: 'Phone', key: 'phone', width: 14 },
      { header: 'Items', key: 'itemCount', width: 10 },
      { header: 'Subtotal', key: 'subtotal', width: 12 },
      { header: 'GST (5%)', key: 'gst', width: 12 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    // Header styling
    sheet1.getRow(1).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE63012' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    sheet1.getRow(1).height = 22;

    orders.forEach((o, i) => {
      const d = new Date(o.createdAt);
      const row = sheet1.addRow({
        id: o.id,
        branchName: o.branchName || 'Main Branch',
        date: d.toLocaleDateString('en-IN'),
        time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        tableNo: o.tableNo,
        customer: o.customer,
        phone: o.phone || '',
        itemCount: o.items.reduce((s, it) => s + it.qty, 0),
        subtotal: o.subtotal,
        gst: o.gst,
        total: o.total,
        status: o.status
      });
      if (i % 2 === 0) {
        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } };
        });
      }
      const statusCell = row.getCell('status');
      if (o.status === 'done') {
        statusCell.font = { color: { argb: 'FF22C55E' }, bold: true };
      } else {
        statusCell.font = { color: { argb: 'FFF59E0B' }, bold: true };
      }
    });

    // Totals row
    const totalRevenue = orders.reduce((s, o) => s + (o.total||0), 0);
    const totalGst     = orders.reduce((s, o) => s + (o.gst||0), 0);
    const totalSub     = orders.reduce((s, o) => s + (o.subtotal||0), 0);
    const sumRow = sheet1.addRow({
      id: 'TOTAL',
      branchName: '',
      date: '',
      time: '',
      tableNo: '',
      customer: `${orders.length} orders`,
      phone: '',
      itemCount: '',
      subtotal: totalSub,
      gst: totalGst,
      total: totalRevenue,
      status: ''
    });
    sumRow.eachCell(cell => {
      cell.font = { bold: true, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3E0' } };
    });

    // ── Sheet 2: Item-wise Sales ──
    const sheet2 = workbook.addWorksheet('Item-wise Sales');
    const itemMap = {};
    orders.forEach(o => {
      o.items.forEach(it => {
        if (!itemMap[it.name]) itemMap[it.name] = { name: it.name, category: it.category, qty: 0, revenue: 0 };
        itemMap[it.name].qty += it.qty;
        itemMap[it.name].revenue += it.price * it.qty;
      });
    });
    sheet2.columns = [
      { header: 'Item Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 16 },
      { header: 'Qty Sold', key: 'qty', width: 12 },
      { header: 'Revenue (₹)', key: 'revenue', width: 16 },
    ];
    sheet2.getRow(1).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A1A' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { horizontal: 'center' };
    });
    sheet2.getRow(1).height = 22;
    const sortedItems = Object.values(itemMap).sort((a, b) => b.revenue - a.revenue);
    sortedItems.forEach((it, i) => {
      const row = sheet2.addRow(it);
      if (i % 2 === 0) row.eachCell(c => { c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF5F5F5' } }; });
    });

    // ── Sheet 3: Daily Summary ──
    const sheet3 = workbook.addWorksheet('Daily Summary');
    const dayMap = {};
    orders.forEach(o => {
      const day = new Date(o.createdAt).toLocaleDateString('en-IN');
      if (!dayMap[day]) dayMap[day] = { date: day, count: 0, revenue: 0, gst: 0 };
      dayMap[day].count++;
      dayMap[day].revenue += o.total || 0;
      dayMap[day].gst += o.gst || 0;
    });
    sheet3.columns = [
      { header: 'Date', key: 'date', width: 16 },
      { header: 'Orders', key: 'count', width: 12 },
      { header: 'Revenue (₹)', key: 'revenue', width: 16 },
      { header: 'GST (₹)', key: 'gst', width: 14 },
      { header: 'Avg Order (₹)', key: 'avg', width: 16 },
    ];
    sheet3.getRow(1).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D4A1A' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { horizontal: 'center' };
    });
    sheet3.getRow(1).height = 22;
    Object.values(dayMap).forEach((d, i) => {
      const row = sheet3.addRow({ ...d, avg: Math.round(d.revenue / d.count) });
      if (i % 2 === 0) row.eachCell(c => { c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF0FFF4' } }; });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=JKDosa_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🍛 JK Dosa Cafe API running on port ${PORT}`);
});
