require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
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

// CORS configuration for split deployment (Vercel Frontend -> Render Backend)
if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
} else {
  app.use(cors({ origin: process.env.FRONTEND_URL || '*' })); 
}

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/cases/:caseId/evidence', evidenceRoutes);
app.use('/api/cases/:caseId/hypotheses', hypothesisRoutes);
app.use('/api/hypotheses', hypothesisRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
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

// Static Asset Serving & SPA Fallback (Only active in production or if static dir exists)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));

  app.get('/{*splat}', (req, res) => {
    // Only fallback if the request isn't an API request
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API route not found' });
    }
  });
}

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    // Fallback to MongoMemoryServer only if no URI is provided (e.g. local dev)
    if (!mongoUri) {
      if (process.env.NODE_ENV === 'production') {
        console.error('FATAL: MONGODB_URI environment variable is missing in production. Cannot use MongoMemoryServer in production.');
        process.exit(1);
      }
      console.log('No MONGODB_URI provided. Starting in-memory fallback...');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log(`Using In-Memory MongoDB: ${mongoUri}`);
    } else {
      console.log('Connecting to provided MONGODB_URI...');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Auto-seed for hackathon if no users exist
    const User = require('./models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding demo database from seed.js...');
      const { seedDemo } = require('./seed');
      await seedDemo();
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
