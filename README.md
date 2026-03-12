# 🌱 AgroLink AI

**AI-powered crop market intelligence for African farmers.**

AgroLink AI helps farmers in Ghana and West Africa make informed decisions about what crops to sell and where, using real-time AI demand predictions, live market prices, and weather insights.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- OpenAI API key
- OpenWeatherMap API key

### 1. Clone & Install

```bash
git clone https://github.com/your-org/agrolink-ai
cd agrolink-ai
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env

### 3. Set Up Supabase Database

### 4. Run Locally

```bash
npm run dev
```

---

## 📁 Project Structure

```
agrolink-ai/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── crops/
│   │   │   └── CropCard.tsx          # Crop listing card
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx         # Main layout wrapper
│   │   │   ├── Navbar.tsx            # Mobile top nav
│   │   │   └── Sidebar.tsx           # Desktop sidebar
│   │   ├── predictions/
│   │   │   └── PredictionCard.tsx    # AI prediction display
│   │   ├── ui/
│   │   │   └── ProtectedRoute.tsx    # Auth guard
│   │   └── weather/
│   │       └── WeatherWidget.tsx     # Weather display
│   ├── hooks/
│   │   ├── useAuth.tsx               # Auth context + hook
│   │   └── useWeather.ts             # Weather data hook
│   ├── lib/
│   │   └── supabase.ts               # Supabase client
│   ├── pages/
│   │   ├── LoginPage.tsx             # /login
│   │   ├── DashboardPage.tsx         # /dashboard
│   │   ├── UploadCropPage.tsx        # /upload-crop
│   │   ├── MarketPricesPage.tsx      # /market-prices
│   │   ├── PredictionsPage.tsx       # /predictions
│   │   └── AIAssistantPage.tsx       # /ai-assistant
│   ├── services/
│   │   ├── authService.ts            # Auth CRUD
│   │   ├── aiService.ts              # OpenAI predictions + chat
│   │   ├── cropsService.ts           # Crops CRUD
│   │   ├── marketService.ts          # Market prices queries
│   │   └── weatherService.ts         # OpenWeather API
│   ├── styles/
│   │   └── globals.css               # Tailwind + custom styles
│   ├── types/
│   │   └── index.ts                  # All TypeScript types
│   ├── App.tsx                       # Router setup
│   └── main.tsx                      # Entry point
├── supabase/
│   └── schema.sql                    # DB schema + RLS + seed data
├── .env.example
├── vercel.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Farmer profiles (linked to Supabase auth) |
| `crops` | Uploaded crop listings |
| `market_prices` | Real market price data |
| `predictions` | AI demand prediction history |

All tables have **Row Level Security (RLS)** enabled. Farmers can only access their own data.

---

## 🌐 Deploy to Vercel

The `vercel.json` handles SPA routing automatically.

---

## ⚙️ Core Features

| Feature | Status | Tech |
|---------|--------|------|
| Email/password auth | ✅ | Supabase Auth |
| Farmer dashboard | ✅ | React + Recharts |
| Crop upload | ✅ | Supabase PostgreSQL |
| Market prices table | ✅ | Supabase + RLS |
| AI demand prediction | ✅ | GPT-4o-mini |
| Weather widget | ✅ | OpenWeather API |
| AI chat assistant | ✅ | GPT-4o-mini |
| Row level security | ✅ | Supabase RLS |

---

## 🔒 Security

- **Row Level Security**: Farmers can only see/edit their own crops and predictions
- **Auth**: Supabase handles JWT tokens and session management
- **Environment variables**: All API keys are server-side (Vite `VITE_` prefix = client-exposed; for production, consider proxying OpenAI calls through a Supabase Edge Function)

```

---

## 📱 Pages

| Route | Page |
|-------|------|
| `/login` | Sign in / Sign up |
| `/dashboard` | Overview, stats, weather, quick actions |
| `/upload-crop` | List a new crop for sale |
| `/market-prices` | Live price table with search/sort |
| `/predictions` | Run AI demand predictions, view history |
| `/ai-assistant` | Chat with farming AI assistant |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI**: OpenAI GPT-4o-mini
- **Weather**: OpenWeatherMap API
- **Hosting**: Vercel (frontend) + Supabase (backend)
- **Fonts**: Syne (display), DM Sans (body), JetBrains Mono (numbers)

---

## 📄 License

MIT — Built for African farmers 🌍
