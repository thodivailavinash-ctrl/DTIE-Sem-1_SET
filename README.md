# MyFinance — Smart 3D Expense Tracker

A full-stack, fintech-grade web application with interactive Three.js 3D visuals, GSAP sliding animations, live Indian Rupee (INR) financial calculations, persistent LocalStorage data, and responsive design.

---

## 🚀 Live Demo & How to Run

The application is running locally at:
👉 **`http://127.0.0.1:5173/`**

### Commands:
```powershell
# In PowerShell:
$env:PATH = "C:\Users\DELL\.gemini\antigravity\scratch\.node-portable\node-v20.18.3-win-x64;" + $env:PATH
cd C:\Users\DELL\.gemini\antigravity\scratch\myfinance

# (Optional) Set your Gemini API key for automatic AI transaction categorization:
# In PowerShell:
$env:GEMINI_API_KEY="your_api_key_here"
# Or create a .env file with:
# GEMINI_API_KEY=your_api_key_here

# Run development server:
npm run dev

# Run production build:
npm run build
```

---

## 🔐 Demonstration Account Credentials

- **Email:** `demo@myfinance.app`
- **Password:** `Demo@1234`
- **One-Click Access:** Click the **"Enter Demo Mode"** button on the login screen for instant, zero-friction access.
- **Client Security:** Uses browser **Web Crypto API (PBKDF2-SHA256)** with unique salts. No plaintext passwords stored in LocalStorage.

---

## 📊 Default Demonstration Financial Baseline (October 2026)

- **Monthly Income:** ₹48,000 (Tech Stipend ₹40,000 + Freelance UI ₹8,000)
- **Monthly Spending Budget:** ₹35,000
- **Total Expenses:** ₹22,000
  - Food: ₹4,500
  - Transport: ₹2,200
  - Shopping: ₹5,800
  - Bills: ₹3,500
  - Education: ₹2,000
  - Entertainment: ₹1,500
  - Healthcare: ₹1,000
  - Other: ₹1,500
- **Remaining Budget:** ₹13,000
- **Budget Utilization:** 62.86% (Optimal pace, cyan/green indicator)
- **Multi-Month History:** Pre-populated with 5 consecutive months of consistent financial data (October, September, August, July, June 2026).

---

## ✨ Implemented Architecture & Features

### 1. 3D Cinematic Visuals (Three.js / React Three Fiber / Drei)
- **3D Floating Smart Wallet:** Procedural navy physical material with cyan neon trim, metallic clasp, and interactive parallax mouse-tracking.
- **Embedded Financial Symbol:** 3D bar chart rendered directly on the wallet exterior.
- **Dual Holographic Credit Cards:** Floating translucent cards with glowing edges.
- **Orbiting Rupee Coins & Glowing Rings:** Continuous orbital motion around the wallet platform.
- **Header 3D Gem:** Lightweight floating octahedron with rotating ring on the main dashboard header.

### 2. GSAP Sliding Animation
- **Split-Screen Layout:** 45% authentication form / 55% 3D scene.
- **Signature Sliding Transition:** Switching between Login and Sign Up translates the form from left to right (and 3D scene from right to left) with a `power3.inOut` timeline and light trail sweep.
- **Entrance Timeline:** Sequenced reveals for branding, forms, wallet rotation, and holographic cards.
- **Login Success Transition:** Button pulse, checkmark reveal, wallet forward zoom, and dashboard handoff.

### 3. Core Functional Pages & Routes
- `/login`: 3D animated authentication with Web Crypto verification and one-click Demo Mode.
- `/dashboard`: 4 summary cards with count-up animation, Recharts Category Donut, Monthly Spending Bar, Income vs Expenses Line, Budget Overview, and 5 latest transactions.
- `/add-expense`: Entry form with positive number validation, category selector, coin-burst animation, and immediate LocalStorage persistence.
- `/income`: Dedicated income management (Salary, Freelance, Business, Gift, Other), monthly totals, and cash flow distinction.
- `/transactions`: Full ledger with instant search, category filter, date filter, type filter, amount/date sorting, inline editing, and deletion with confirmation.
- `/budget`: Monthly spending cap editor, large circular progress ring with color thresholds (<80% green/cyan, 80-100% amber, >100% red/coral), and overspending alerts.
- `/categories`: 8 category cards with 3D icons, progress bars, and one-click transaction filtering.
- `/analytics`: 4 Recharts visualizations (Donut, Bar, Line, Area), highest spending category, and real non-fabricated MoM comparisons.
- `/goals`: Isolated savings goals (e.g., MacBook Pro, Emergency Fund, Trek) with glass piggy bank visual, coin-drop animation, and separate contribution tracking.
- `/reports`: Official financial statement, real CSV file export, and formatted `window.print()` PDF generator.
- `/settings`: Display name editor, INR currency badge, dark/light theme persistence, reduced motion toggle, and sample data restoration.

---

## 📱 Responsive Layout
- Desktop: Collapsible glass sidebar and multi-column grid.
- Mobile: Glass bottom navigation bar, single-column responsive cards, and floating quick-action button.
