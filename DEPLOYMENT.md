# Deployment Guide

BlackBox is designed as a decoupled architecture but can be easily deployed as a single unified service (where Express serves the compiled Vue static assets) to simplify production hosting.

## Current Hackathon Architecture
For demonstration, BlackBox utilizes:
- **Vue 3 / Vite** for the frontend dev server (port 5173).
- **Express.js** for the backend REST API (port 5000).
- **mongodb-memory-server** for instant, zero-config data persistence.

## Production Single-Service Deployment

To deploy BlackBox to a provider like Render, Koyeb, or Google Cloud Run, we recommend serving the frontend from the Express backend.

### 1. Database Provisioning
Provision a MongoDB Atlas cluster and obtain your connection string.

### 2. Environment Variables
Ensure the host environment is configured with:
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/blackbox?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_string_here
PORT=8080
```

### 3. Build the Application
The repository uses a root `package.json` to orchestrate builds automatically:
```bash
npm install
npm run build
```

### 4. Start the Server
```bash
npm start
```

## Recommended Platform: Render

BlackBox is pre-configured for a single-service Web Service deployment on Render:

1. Connect your GitHub repository.
2. Ensure environment is set to `Node`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add your Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`).
- **Google Cloud Run**: Containerize using a standard Node.js Dockerfile that builds the frontend and copies `dist/` before starting Express.
