# Deployment Guide

BlackBox is designed as a unified full-stack architecture running entirely on **Vercel** with **MongoDB Atlas** for persistent storage.

## Production Architecture: Vercel + MongoDB Atlas

```
User (Browser)
      │
      ▼
   Vercel
   ├── Vue 3 + Vite Frontend (Static CDN)
   └── Express.js Backend API (Serverless Functions via /api/*)
             │
             ▼
      MongoDB Atlas
```

### 1. Database Provisioning
Provision a MongoDB Atlas cluster and obtain your connection string.
Ensure your Atlas Network Access allows connections (`0.0.0.0/0` for serverless environments).

### 2. Vercel Environment Variables
Configure the following in **Vercel Project Settings → Environment Variables**:

| Variable | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production environment flag |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster...` | MongoDB Atlas Connection String |
| `JWT_SECRET` | `<secure-random-string>` | Key for signing JWT authentication tokens |

### 3. Automatic Deployment
Pushing to the `main` branch automatically triggers Vercel to build the Vite frontend and bundle the Express API serverless functions via `vercel.json`.

- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`
- **API Entrypoint**: `api/index.js`
