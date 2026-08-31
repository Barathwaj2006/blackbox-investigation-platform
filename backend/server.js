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
      console.log('Seeding demo database...');
      const admin = await User.create({ username: 'admin', password: 'demo', name: 'Admin', role: 'Admin' });
      const investigator = await User.create({ username: 'investigator', password: 'demo', name: 'Investigator', role: 'Investigator' });
      
      const Case = require('./models/Case');
      const Evidence = require('./models/Evidence');
      const Hypothesis = require('./models/Hypothesis');
      const EvidenceRelationship = require('./models/EvidenceRelationship');
      const { calculateHypothesisScore } = require('./utils/scoringEngine');

      const c1 = await Case.create({ title: 'Operation Phantom', description: 'Sample case data', status: 'INVESTIGATING', createdBy: admin._id });
      const e1 = await Evidence.create({ caseId: c1._id, title: 'Server Logs', verificationState: 'VERIFIED', confidenceScore: 90, uploadedBy: investigator._id });
      const h1 = await Hypothesis.create({ caseId: c1._id, title: 'External Attack', createdBy: investigator._id });
      await EvidenceRelationship.create({ hypothesisId: h1._id, evidenceId: e1._id, type: 'SUPPORT', strength: 8, createdBy: investigator._id });
      await calculateHypothesisScore(h1._id);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
