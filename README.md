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
```

Fill in `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_OPENAI_API_KEY=sk-...
VITE_OPENWEATHER_API_KEY=your_key_here
```

### 3. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy and run the entire contents of `supabase/schema.sql`
4. This creates all tables, RLS policies, indexes, and seed data

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

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

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_OPENAI_API_KEY
vercel env add VITE_OPENWEATHER_API_KEY

# Deploy to production
vercel --prod
```

### Option B: GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Framework: **Vite** (auto-detected)
5. Add environment variables in the Vercel dashboard
6. Click **Deploy**

The `vercel.json` handles SPA routing automatically.

---

## 🔑 API Keys

| Service | Where to get it | Free tier |
|---------|----------------|-----------|
| **Supabase** | [supabase.com](https://supabase.com) → Settings → API | ✅ 500MB DB |
| **OpenAI** | [platform.openai.com](https://platform.openai.com) → API Keys | Pay-per-use |
| **OpenWeather** | [openweathermap.org](https://openweathermap.org/api) → API keys | ✅ 1000 calls/day |

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

### Production Security Upgrade (Recommended)

For production, move OpenAI API calls to a Supabase Edge Function to keep the API key server-side:

```bash
supabase functions new predict-demand
supabase functions deploy predict-demand
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
