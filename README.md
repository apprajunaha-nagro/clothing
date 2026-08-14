# PGmart - Trusted Fashion & Quality Store 🛍️ ✨

A full-stack modern E-Commerce platform & Fashion Store built with **React**, **Vite**, **Express**, **TypeScript**, **Tailwind CSS**, and integrated with **Google Gemini AI** for interactive fashion styling recommendations and AI image visualization.

---

## 🌟 Key Features

- **🛒 E-Commerce Experience**:
  - Interactive Product Catalog with multi-filter search (category, brand, price range, fabric, occasion, rating).
  - Dynamic Product Detail views with variant selectors, image galleries, and review systems.
  - Cart, Wishlist, and Checkout system with coupon code validation.
  - User Address Management & Order Tracking.

- **🤖 Gemini AI Fashion Stylist**:
  - Real-time interactive AI Stylist chatbot powered by `@google/genai` (Gemini 3.6 Flash & Google Search grounding).
  - AI Outfit Visualizer & Image Editor to preview style combinations.

- **⚙️ Comprehensive Admin Panel**:
  - **Product Management**: Full CRUD operations for products, variants, colors, and stock.
  - **3-Tier Category Hierarchy**: Manage Categories, Subcategories, and Product Types/Styles.
  - **CSV Bulk Import/Export**: Import/export categories, product types, and inventory levels via CSV files.
  - **Orders Management**: Order status tracking, courier assignment, and shipping label simulation.
  - **Banners & Site Settings**: Real-time store customization and promotional hero banners.

---

## 🛠️ Tech Stack & Live Infrastructure

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Framer Motion, `@supabase/supabase-js`
- **Backend / API**: Node.js, Express, Prisma ORM
- **Database**: Cloud PostgreSQL on **Supabase** (2,400+ Products, Orders, Users, Categories)
- **Deployment**: **Hostinger Node.js Application** with automated GitHub CI/CD deployments
- **Authentication & Email**: Supabase Auth + Hostinger SMTP (`noreply@pgmart.in`)
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Data & Utilities**: PapaParse (CSV parsing), Recharts (Analytics dashboard)

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.x or higher
- **npm** (or `bun` / `pnpm`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/pgmart-store.git
cd pgmart-store
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (or copy `.env.example`):
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

- `npm run dev`: Starts the Express + Vite unified development server on port 3000.
- `npm run build`: Bundles the Vite frontend and builds the backend server bundle.
- `npm run start`: Starts the production Node server (`dist/server.cjs`).
- `npm run lint`: Runs TypeScript type checking.

---

## 📁 Folder Structure

```
pgmart-store/
├── src/
│   ├── components/      # React components (Header, Footer, ProductCard, Admin views, etc.)
│   ├── pages/           # Application pages (HomePage, ProductListingPage, AdminPage, etc.)
│   ├── data/            # Mock seed datasets and AI prompts
│   ├── types.ts         # TypeScript definitions
│   └── index.css        # Global styles & Tailwind import
├── server.ts            # Express server & API endpoints
├── index.html           # SPA Entry HTML
├── vite.config.ts       # Vite configuration
├── package.json         # Dependencies & npm scripts
└── README.md            # Project documentation
```

---

## ⚡ Vercel Deployment & Persistent Database Setup

### Serverless Architecture (`api/index.ts`)
- **Serverless Entrypoint**: Vercel routes all `/api/*` requests to `api/index.ts`, which exports the main Express `app` defined in `server.ts`.
- **Client-Side Routing**: Non-API routes fall back to `/index.html` via `vercel.json` for SPA client-side routing.
- **Static Assets**: Assets in `/src/assets` are copied to `public/src/assets` during `npm run build` so Vercel serves them directly via CDN.

### Database Setup (Prisma + PostgreSQL / Neon)
1. **Configure Database Connection**:
   In Vercel Project Settings > Environment Variables, add:
   - `DATABASE_URL`: Pooled connection string (e.g. Neon Serverless Postgres `-pooler` connection string).
   - `DATABASE_URL_UNPOOLED`: Direct connection string for Prisma migrations.

2. **Generate Client & Seed Database**:
   ```bash
   node node_modules/prisma/build/index.js generate
   npm run db:seed
   ```

---

## 📄 License
[MIT](LICENSE)

