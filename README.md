# AI-Powered GitHub Repo Analyzer

An AI-powered GitHub repository analyzer with full GitHub OAuth authentication.

---

## Prerequisites

- Node.js 18+
- A GitHub OAuth App ([create one here](https://github.com/settings/developers))
  - **Homepage URL:** `http://localhost:5173`
  - **Authorization callback URL:** `http://localhost:5173/auth/callback`

---

## Setup

### 1. Frontend environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_GITHUB_CLIENT_ID=<your_client_id>
VITE_BACKEND_URL=          # leave blank — Vite proxy handles it locally
```

### 2. Backend environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
GITHUB_CLIENT_ID=<your_client_id>
GITHUB_CLIENT_SECRET=<your_client_secret>
FRONTEND_URL=http://localhost:5173
PORT=3001
```

---

## Running locally

Open **two terminals**:

**Terminal 1 — Express backend**
```bash
cd server
npm install   # first time only
npm run dev
```

**Terminal 2 — Vite frontend**
```bash
npm run dev
```

App is available at **http://localhost:5173**

---

## Auth flow

```
User clicks "Connect GitHub"
  → Redirected to github.com/login/oauth/authorize
  → User authorizes
  → GitHub redirects to /auth/callback?code=XXX
  → Frontend sends code to Express POST /auth/github
  → Express exchanges code for access_token (server-side only)
  → Express stores token, returns a sessionId
  → Frontend stores sessionId in sessionStorage
  → Dashboard loads with real repos
```

---

## Security notes

- `client_secret` **never** leaves the server
- Access tokens are stored server-side in memory (swap for Redis/DB in production)
- Vite proxy is dev-only; in production point `VITE_BACKEND_URL` at your deployed backend

---

## Project structure

```
repo-anal1/
├── server/               ← Express OAuth backend
│   ├── index.js
│   ├── package.json
│   └── .env              ← (gitignored)
├── src/
│   ├── context/
│   │   └── AuthContext.tsx   ← Auth state management
│   ├── pages/
│   │   └── AuthCallback.tsx  ← /auth/callback route
│   ├── components/
│   │   ├── Hero.tsx          ← Connect GitHub button
│   │   ├── Sidebar.tsx       ← Dynamic repo list
│   │   ├── Dashboard.tsx
│   │   └── Report.tsx
│   └── main.tsx
├── .env                  ← (gitignored)
└── vite.config.ts        ← Proxy config
```
