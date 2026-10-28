# 🛍️ ShopSphere — Ultimate Intelligent Full-Stack E-Commerce Platform

> **Discover Better. Shop Smarter.**  
> An intelligent, luxury-grade full-stack shopping ecosystem combining personalized product discovery, budget-aware **SmartCart**, live **PricePulse** tracking, certified **Product Passport** transparency, real-time **Socket.IO** notifications, and an **AI Shopping Concierge**.

---

## 🌟 Highlights & Key Features

### 🛒 1. SmartCart & Budget Guardian
- **Budget Tracking**: Real-time progress bar computing cart total against user-defined budget.
- **Cheaper Alternative Engine**: Automatically analyzes top-consuming cart items and suggests high-rated, budget-friendly alternatives.
- **Threshold Free Shipping**: Calculates dynamic remaining amount to unlock free carbon-neutral delivery.
- **Promo Coupon System**: Validates discount thresholds and calculates instant savings (e.g. `WELCOME10`, `SPHERE20`, `FREESHIP`, `TECH15`).

### 📉 2. PricePulse & Analytics
- **Historical Price Charts**: Dynamic interactive Recharts visualization showing price fluctuations over time.
- **Target Price Drop Watchers**: Customers can register price alerts to be notified when items drop below their desired price point.
- **Scarcity & Low Stock Alerts**: Real-time notifications when product inventory dips to 5 units or fewer.

### 🌿 3. Certified Product Passport
- **Circularity & Repairability Score**: Standardized 1-10 repairability index for ethical consumer electronics and furniture.
- **Carbon Footprint Tracking**: Visualizes lifecycle carbon offsets with verified digital seals.
- **Provenance & Materials**: Full breakdown of recycled and sustainably sourced materials.

### 🤖 4. AI Shopping Concierge
- **Floating Interactive Assistant**: Understands natural language requests (e.g., *"Show me minimalist desks under ₹25,000"* or *"Sustainable audio gear"*).
- **1-Click Actions**: Recommends live catalog products with direct "Add to Cart" and quick inspection.

### 🧾 5. Official GST Tax Invoice Generator
- **Compliant Invoicing**: Generates standard tax invoices with SKU, HSN, 18% GST tax breakdown, and shipping details.
- **Print & PDF Export**: Dedicated `@media print` layout allowing customers to print or save their official invoice as a PDF with 1 click.

### ⚡ 6. Real-Time WebSockets (Socket.IO)
- **Live Admin Operations**: Instant toast notifications and KPI dashboard metric updates when orders are placed.
- **Scarcity Warnings**: Pushes live inventory drop events to administrators.

---

## 🏗️ Architecture & Tech Stack

```
shopsphere/
├── client/                     # Vite + React 18 Single Page Application
│   ├── src/
│   │   ├── components/         # SmartCart, Product Passport, UI kit, AI Concierge
│   │   ├── context/            # Auth, Cart, Wishlist, Socket.IO
│   │   ├── pages/              # Shop, Product Detail, Checkout, Account, Admin
│   │   └── services/           # Axios client with interceptor normalization
└── server/                     # Node.js / Express REST & WebSocket API
    ├── src/
    │   ├── controllers/        # Auth, Products, Orders, Cart, AI, Admin, Smart
    │   ├── models/             # Mongoose schemas (Products, Orders, Coupons, Users, etc.)
    │   ├── routes/             # Versioned REST endpoints (/api/v1/...)
    │   └── socket.js           # Real-time WebSocket broadcasting engine
```

- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion, Recharts, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, Socket.IO, Mongoose, JWT + Cookie Parser, Helmet, Morgan, Express Rate Limit, Zod.
- **Database**: MongoDB (Local or MongoDB Atlas).

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance running locally or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URL.

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Seed Database with Rich Catalog
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

- **Storefront**: `http://localhost:5173`
- **REST & WebSockets API**: `http://localhost:5000`
- **Health Endpoint**: `http://localhost:5000/api/v1/health`

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Store Administrator** | `admin@shopsphere.com` | `Admin@123456` |
| **Customer** | `alex@example.com` | `Customer@123456` |

---

## 🌐 Cloud Deployment Guide

### Option 1: Unified Single-Service Deployment (Render / Railway)
The backend is pre-configured to automatically serve the production Vite frontend build when `NODE_ENV=production`.

1. **Push your repository to GitHub** (see instructions below).
2. Create a free account on **[Render](https://render.com/)** or **[Railway](https://railway.app/)**.
3. Create a **New Web Service** connected to your GitHub repo.
4. Set the following build and start configurations:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
5. Add your Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *A secure random string*
   - `COOKIE_SECRET`: *A secure random string*
   - `PASSWORD_RESET_SECRET`: *A secure random string*
   - `CLIENT_URL`: *Your Render URL (e.g. `https://shopsphere.onrender.com`)*

---

### Option 2: Split Deployment (Vercel Frontend + Render Backend)
- **Backend (Render / Railway)**: Set root to `server`, build command `npm install`, start command `npm start`.
- **Frontend (Vercel / Netlify)**: Set root to `client`, framework `Vite`, build command `npm run build`, output directory `dist`. Set environment variable `VITE_API_BASE_URL` pointing to your deployed backend URL.

---

## 📝 License
MIT License. Built for modern, transparent, and intelligent e-commerce experiences.
