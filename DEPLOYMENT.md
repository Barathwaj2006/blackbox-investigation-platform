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

### 3. Build the Frontend
Compile the Vue application into static assets.
```bash
cd frontend
npm run build
```
This outputs to `frontend/dist/`.

### 4. Configure Express to Serve Static Files
In your backend `server.js` (or a dedicated production entry point), add:

```javascript
const path = require('path');

// ... after API routes ...
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // SPA fallback for Vue Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}
```

### 5. Start the Server
```bash
cd backend
npm start
```

## Recommended Platforms

- **Render**: Connect the GitHub repository, set root directory to `backend`, add a custom Build Command (`cd ../frontend && npm install && npm run build && cd ../backend && npm install`), and set Start Command to `npm start`.
- **Google Cloud Run**: Containerize using a standard Node.js Dockerfile that builds the frontend and copies `dist/` before starting Express.
