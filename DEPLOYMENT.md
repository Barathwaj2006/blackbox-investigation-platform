# BlackBox — Production Deployment Guide

## Architecture Overview
BlackBox is architected as a consolidated, production-ready single Node.js/Express service:
- **Frontend**: Vue 3 SPA compiled to `/frontend/dist` and statically served by Express.
- **Backend**: Express.js REST API under `/api/*` with JSON responses and strict error handling.
- **SPA Routing**: Non-API routes fall back to `/frontend/dist/index.html`.
- **Database**: MongoDB Atlas via Mongoose with an in-memory development/fallback store.

```
Browser
  ↓
Express.js Server (Port $PORT or 3000, bound to 0.0.0.0)
  ├── Static Vue SPA (/frontend/dist)
  ├── SPA Fallback (Non-API routes -> index.html)
  └── API Endpoints (/api/*)
        ↓
     MongoDB Atlas
```

---

## Environment Variables
Configure the following in your deployment environment (e.g., Cloud Run, Render, Railway, Docker):

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Port the Express server binds to | `3000` (or injected by Cloud Run/PaaS) |
| `MONGODB_URI` | Production MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/blackbox?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | `<strong-random-secret-key>` |
| `NODE_ENV` | Environment mode | `production` |

---

## Production Build & Start Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Frontend SPA
```bash
npm run build
```
*(Runs `npm --prefix frontend run build` to output production assets into `/frontend/dist`)*

### 3. Start Production Server
```bash
npm start
```
*(Runs `node backend/server.js` listening on `0.0.0.0:$PORT`)*

---

## Single-Service Production Characteristics
- **Port & Host Binding**: Listens on `process.env.PORT || 3000` and explicitly binds to `0.0.0.0` for container & cloud compatibility.
- **Route Isolation**:
  - `/api/*` endpoints strictly return JSON responses (including JSON 404s for undefined endpoints).
  - All non-API frontend paths (`/`, `/dashboard`, `/cases`, `/audit`, `/admin`) serve the Vue SPA.
- **Security**:
  - Passwords hashed using `bcryptjs` with salt rounds.
  - JWT tokens signed with `JWT_SECRET`.
  - CORS enabled without cross-origin dependencies.
  - Sensitive files (`.env`, credentials) excluded in `.gitignore`.
