require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./models/User');
const Case = require('./models/Case');
const Evidence = require('./models/Evidence');
const Hypothesis = require('./models/Hypothesis');
const EvidenceRelationship = require('./models/EvidenceRelationship');
const { calculateHypothesisScore } = require('./utils/scoringEngine');

async function seed() {
  const mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();
  await mongoose.connect(mongoUri);
  console.log('Connected to Memory DB for seeding');

  // Create Users
  const admin = await User.create({ username: 'admin', password: 'password', name: 'Admin User', role: 'Admin' });
  const investigator = await User.create({ username: 'investigator', password: 'password', name: 'John Investigator', role: 'Investigator' });

  // Create Case
  const caseItem = await Case.create({
    title: 'Operation Phantom Strike',
    description: 'Investigation into the cyber breach at Acme Corp.',
    status: 'INVESTIGATING',
    createdBy: admin._id,
    assignedTo: [investigator._id]
  });

  // Create Evidence
  const evidence1 = await Evidence.create({
    caseId: caseItem._id,
    title: 'Server Logs',
    type: 'Digital',
    verificationState: 'VERIFIED',
    confidenceScore: 90,
    uploadedBy: investigator._id
  });

  const evidence2 = await Evidence.create({
    caseId: caseItem._id,
    title: 'Employee Testimony',
    type: 'Document',
    verificationState: 'UNVERIFIED',
    confidenceScore: 60,
    uploadedBy: investigator._id
  });

  // Create Hypothesis
  const h1 = await Hypothesis.create({
    caseId: caseItem._id,
    title: 'Insider Threat',
    createdBy: investigator._id
  });

  const h2 = await Hypothesis.create({
    caseId: caseItem._id,
    title: 'External APT',
    createdBy: investigator._id
  });

  // Create Relationships
  await EvidenceRelationship.create({
    hypothesisId: h1._id,
    evidenceId: evidence1._id,
    type: 'CONTRADICT',
    strength: 8,
    createdBy: investigator._id
  });

  await EvidenceRelationship.create({
    hypothesisId: h1._id,
    evidenceId: evidence2._id,
    type: 'SUPPORT',
    strength: 5,
    createdBy: investigator._id
  });

  await EvidenceRelationship.create({
    hypothesisId: h2._id,
    evidenceId: evidence1._id,
    type: 'SUPPORT',
    strength: 9,
    createdBy: investigator._id
  });

  // Calculate scores
  await calculateHypothesisScore(h1._id);
  await calculateHypothesisScore(h2._id);

  console.log('Seeding complete!');
  process.exit(0);
}

seed();
