# 🍛 JK Spicy Dosa Cafe — Complete Order Management System v2.0

## 📁 Folder Structure
```
jk-dosa-cafe/
├── frontend/
│   ├── index.html          ← Full POS website (drag to Netlify)
│   └── netlify.toml        ← Netlify config
├── backend/
│   ├── server.js           ← Main Express API
│   ├── package.json        ← Dependencies
│   ├── .env.example        ← Environment template
│   ├── models/
│   │   ├── Order.js
│   │   ├── MenuItem.js
│   │   └── Branch.js
│   └── routes/
│       ├── orders.js
│       ├── menu.js
│       └── branches.js
├── render.yaml             ← Render.com auto-deploy config
└── README.md
```

---

## ✨ Features
| Feature | Description |
|---------|-------------|
| 🍽 POS | Full point-of-sale with 60+ menu items, category tabs, search |
| 🍳 KOT | Kitchen Order Ticket — print to kitchen printer |
| 🖨 Bill | Professional thermal bill with GST (5%) |
| 📱 WhatsApp | Send bill directly to customer on WhatsApp |
| 📋 Orders | Manage all orders, status flow (pending→preparing→ready→done) |
| 📊 Report | Daily/range reports with item-wise sales breakdown |
| ⬇ Excel | 3-sheet Excel export (Summary, Item-wise, Daily) |
| 🏪 Branches | Multi-branch support — each branch sees own orders |
| 🧾 Menu Mgmt | Add/edit/delete/toggle items |
| 💾 Offline | Works without internet using localStorage |
| 📱 Mobile | Fully responsive for phone/tablet |

---

## 🚀 DEPLOYMENT GUIDE

### STEP 1 — MongoDB Atlas (Free Database)
1. Go to **https://cloud.mongodb.com** → Create free account
2. Click **Build a Database** → Choose **Free (M0)** tier
3. Select region: **Mumbai (ap-south-1)** for India
4. Under **Database Access** → Add a database user:
   - Username: `jkadmin`
   - Password: (generate a strong password, save it)
5. Under **Network Access** → Add IP Address → **0.0.0.0/0** (allow all)
6. Click **Connect** → **Connect your application** → Copy the string:
   ```
   mongodb+srv://jkadmin:<password>@cluster0.xxxxx.mongodb.net/jkdosa?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password.

---

### STEP 2 — GitHub (Host your code)
1. Go to **https://github.com** → New repository → `jk-dosa-cafe`
2. Upload the entire `jk-dosa-cafe` folder
3. OR use GitHub Desktop to drag and push

---

### STEP 3 — Render.com (Free Backend Hosting)
1. Go to **https://render.com** → Sign up with GitHub
2. Click **New +** → **Web Service**
3. Connect your `jk-dosa-cafe` GitHub repo
4. Configure:
   - **Name**: `jk-dosa-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Under **Environment Variables**, add:
   ```
   MONGODB_URI = mongodb+srv://jkadmin:yourpassword@cluster0.xxxxx.mongodb.net/jkdosa
   ```
6. Click **Create Web Service**
7. Wait ~3 minutes → Copy your URL: `https://jk-dosa-api.onrender.com`

> ⚠️ Free Render instances sleep after 15 mins of inactivity. First request takes ~30s to wake up. Upgrade to Starter ($7/mo) to keep it always-on.

---

### STEP 4 — Netlify (Free Frontend Hosting)
1. Go to **https://netlify.com** → Sign up free
2. Drag and drop the `frontend` folder onto the Netlify dashboard
3. Your site goes live at: `https://random-name.netlify.app`
4. Optionally set custom domain in Site Settings

---

### STEP 5 — Connect Frontend to Backend
1. Open your Netlify URL in browser
2. Click **⚙ Setup** (top right)
3. Paste your Render URL: `https://jk-dosa-api.onrender.com`
4. Click **Save & Connect**
5. ✅ "MongoDB Live" appears in top bar

---

## 💻 LOCAL DEVELOPMENT

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MONGODB_URI
npm install
npm run dev

# Frontend — just open in browser
open frontend/index.html
# Or use Live Server in VS Code
```

---

## 📱 WhatsApp Bill Setup
No setup needed! Just enter the customer's phone number in the order form.
When you click "📱 WhatsApp" on the bill, it opens WhatsApp Web with the bill pre-filled.

---

## 🖨 KOT / Bill Printing
- Connect any thermal printer (Bluetooth or USB) to the device
- Set it as the default printer in Windows/Mac/Android
- Click "🖨 Print KOT" or "🖨 Print" → Select your thermal printer
- Recommended: 80mm thermal printer (common in Indian restaurants)

---

## 🏪 Multiple Branches Setup
1. Go to **🏪 Branches** tab
2. Add each branch with name, address, phone
3. Staff at each location selects their branch from the dropdown in the header
4. Orders, stats, and reports are filtered per branch

---

## 📊 Excel Export
- Go to **📋 Orders** → Click **⬇ Export Excel**
- Or go to **📊 Report** → Click **⬇ Excel**
- Downloads a multi-sheet Excel file:
  - **Sheet 1**: Full order list
  - **Sheet 2**: Item-wise sales ranking
  - **Sheet 3**: Daily revenue summary

---

## 🔧 API Endpoints
```
GET    /health              — Server health + DB status
GET    /orders              — List orders (?branchId, ?status, ?date)
POST   /orders              — Create order
PATCH  /orders/:id          — Update order (status, etc)
DELETE /orders/:id          — Delete order
GET    /orders/stats/today  — Today's stats
GET    /orders/report/range — Date range report
GET    /export/excel        — Download Excel report
GET    /menu                — List menu items
POST   /menu                — Add item
PATCH  /menu/:id            — Edit item
DELETE /menu/:id            — Delete item
GET    /branches            — List branches
POST   /branches            — Add branch
PATCH  /branches/:id        — Edit branch
DELETE /branches/:id        — Delete branch
```

---

## 💰 Cost Summary
| Service | Cost |
|---------|------|
| MongoDB Atlas M0 | **FREE** (512MB) |
| Render.com Free | **FREE** (sleeps) |
| Render.com Starter | $7/month (always-on) |
| Netlify Free | **FREE** (unlimited) |
| **Total** | **₹0 to ₹600/month** |
# jk_cafe
