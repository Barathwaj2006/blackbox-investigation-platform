require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const caseRoutes = require('./routes/case.routes');
const evidenceRoutes = require('./routes/evidence.routes');
const hypothesisRoutes = require('./routes/hypothesis.routes');
const auditRoutes = require('./routes/audit.routes');
const errorHandler = require('./middleware/errorHandler');

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable is not set in production. Ensure it is configured in Vercel settings.');
}

const app = express();

app.use(cors());
app.use(express.json());

// Database connection middleware for serverless and local requests
app.use(async (req, res, next) => {
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in middleware:', err.message);
    return res.status(500).json({ success: false, error: 'Database connection failed: ' + err.message });
  }
  next();
});

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin reset demo
app.post(['/api/admin/reset-demo', '/admin/reset-demo'], async (req, res) => {
  try {
     const { seedDemo } = require('./seed');
     await seedDemo();
     res.json({ success: true, message: 'Demo reset successfully' });
  } catch(e) {
     res.status(500).json({ success: false, error: e.message });
  }
});

// API Routes mounted on both /api/* and /* to handle any Vercel rewrite pattern
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/cases', caseRoutes);
app.use('/cases', caseRoutes);

app.use('/api/evidence', evidenceRoutes);
app.use('/evidence', evidenceRoutes);

app.use('/api/cases/:caseId/evidence', evidenceRoutes);
app.use('/cases/:caseId/evidence', evidenceRoutes);

app.use('/api/cases/:caseId/hypotheses', hypothesisRoutes);
app.use('/cases/:caseId/hypotheses', hypothesisRoutes);

app.use('/api/hypotheses', hypothesisRoutes);
app.use('/hypotheses', hypothesisRoutes);

app.use('/api/audit', auditRoutes);
app.use('/audit', auditRoutes);

// API Error Handler
app.use('/api', errorHandler);
app.use(errorHandler);

// Static Asset Serving & SPA Fallback for local standalone use
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

app.get('/{*splat}', (req, res) => {
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/auth/') && !req.path.startsWith('/cases/') && !req.path.startsWith('/evidence/') && !req.path.startsWith('/hypotheses/') && !req.path.startsWith('/audit/')) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
});

module.exports = app;
