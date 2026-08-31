require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const caseRoutes = require('./routes/case.routes');
const evidenceRoutes = require('./routes/evidence.routes');
const hypothesisRoutes = require('./routes/hypothesis.routes');
const auditRoutes = require('./routes/audit.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const adminRoutes = require('./routes/admin.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/cases/:caseId/evidence', evidenceRoutes);
app.use('/api/cases/:caseId/hypotheses', hypothesisRoutes);
app.use('/api/hypotheses', hypothesisRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'in-memory-fallback'
  });
});

// JSON 404 Handler for all API routes so HTML is never returned for /api/* calls
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Serve frontend static files
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback for all remaining non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      mongoose.set('bufferCommands', false);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log('Connected to MongoDB');
    } catch (dbErr) {
      console.warn('[AI Studio] MongoDB connection warning:', dbErr.message);
    }
  } else {
    console.log('[AI Studio] No MONGODB_URI provided — using in-memory demo storage');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BlackBox server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
