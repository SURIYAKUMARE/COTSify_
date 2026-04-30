# COTsify – Smart Component Sourcing Assistant

> Enter any project title → get a full BOM, nearby stores, and price comparisons across platforms.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, Tailwind CSS v4, Supabase Auth |
| Backend | Python, FastAPI |
| Database / Auth | Supabase (PostgreSQL + Auth) |
| Hosting | Frontend → Netlify, Backend → Vercel |

---

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `backend/supabase_schema.sql`
3. Enable **Google OAuth** under Authentication → Providers
4. Copy your **Project URL**, **Anon Key**, and **Service Role Key**

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Fill in your API keys in .env
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your Supabase + backend URL
npm install
npm run dev
```

Open `http://localhost:3000`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key (gpt-4o-mini) |
| `GOOGLE_MAPS_API_KEY` | Google Maps Places API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JS API key |

---

## Deployment

### Backend → Vercel

```bash
cd backend
npm i -g vercel
vercel --prod
# Set all env vars in Vercel dashboard
```

### Frontend → Netlify

```bash
cd frontend
npm run build
# Deploy the `out` folder or connect GitHub repo to Netlify
# Set env vars in Netlify dashboard
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analyze/` | Analyze project title → component list |
| POST | `/api/stores/nearby` | Find nearby electronics stores |
| POST | `/api/compare/` | Compare prices for one component |
| POST | `/api/compare/bulk` | Compare prices for multiple components |
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/signin` | Sign in user |
| POST | `/api/projects/save` | Save a project |
| GET | `/api/projects/{user_id}` | Get user's saved projects |
| DELETE | `/api/projects/{id}` | Delete a project |

Full interactive docs: `http://localhost:8000/docs`

---

## Features

- **AI Analysis** – GPT-4o-mini extracts hardware + software BOM from any project title
- **Fallback mode** – Works without OpenAI key using curated mock data
- **Nearby Stores** – Google Maps Places API finds local electronics shops
- **Price Comparison** – Compares across Amazon, Flipkart, Robu.in
- **Auth** – Email/password + Google OAuth via Supabase
- **Dashboard** – Save, bookmark, and revisit projects
- **Responsive** – Works on mobile and desktop
