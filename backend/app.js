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

// Security check for production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is missing in production.');
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

// Database connection middleware for serverless and local requests
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    try {
      await connectDB();
    } catch (err) {
      console.error('Database connection error in middleware:', err.message);
      return res.status(500).json({ success: false, error: 'Database connection failed: ' + err.message });
    }
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/cases/:caseId/evidence', evidenceRoutes);
app.use('/api/cases/:caseId/hypotheses', hypothesisRoutes);
app.use('/api/hypotheses', hypothesisRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/admin/reset-demo', async (req, res) => {
  try {
     const { seedDemo } = require('./seed');
     await seedDemo();
     res.json({ success: true, message: 'Demo reset successfully' });
  } catch(e) {
     res.status(500).json({ success: false, error: e.message });
  }
});

// API Error Handler
app.use('/api', errorHandler);

// Static Asset Serving & SPA Fallback for local standalone use
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

app.get('/{*splat}', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
});

module.exports = app;
