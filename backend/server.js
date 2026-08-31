require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('./routes/auth.routes');
const caseRoutes = require('./routes/case.routes');
const evidenceRoutes = require('./routes/evidence.routes');
const hypothesisRoutes = require('./routes/hypothesis.routes');
const auditRoutes = require('./routes/audit.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/cases/:caseId/evidence', evidenceRoutes);
app.use('/api/cases/:caseId/hypotheses', hypothesisRoutes);
app.use('/api/hypotheses', hypothesisRoutes);
app.use('/api/audit', auditRoutes);

// Basic route to test server
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    // For hackathon/demo, we use MongoMemoryServer to avoid requiring local mongodb
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    console.log(`Using In-Memory MongoDB: ${mongoUri}`);

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
    
    app.post('/api/admin/reset-demo', async (req, res) => {
       try {
          const { seedDemo } = require('./seed');
          await seedDemo();
          res.json({ success: true, message: 'Demo reset successfully' });
       } catch(e) {
          res.status(500).json({ success: false, error: e.message });
       }
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
