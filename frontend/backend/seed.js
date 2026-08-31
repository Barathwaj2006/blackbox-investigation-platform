require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Case = require('./models/Case');
const Evidence = require('./models/Evidence');
const Hypothesis = require('./models/Hypothesis');
const Relationship = require('./models/EvidenceRelationship');
const AuditLog = require('./models/AuditLog');

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blackbox');
  }
};

const seedDemo = async () => {
  try {
    // 1. Clear database
    await User.deleteMany();
    await Case.deleteMany();
    await Evidence.deleteMany();
    await Hypothesis.deleteMany();
    await Relationship.deleteMany();
    await AuditLog.deleteMany();

    // 2. Create Users
    const investigator = await User.create({
      username: 'investigator',
      password: 'password', // pre-save hook handles hashing
      name: 'Agent Sarah Connor',
      role: 'Investigator'
    });

    const reviewer = await User.create({
      username: 'reviewer',
      password: 'password',
      name: 'Director Alan Smith',
      role: 'Reviewer'
    });

    const admin = await User.create({
      username: 'admin',
      password: 'password',
      name: 'System Admin',
      role: 'Admin'
    });

    // 3. Create Case
    const demoCase = await Case.create({
      title: 'Aerospace Data Exfiltration (BK-2041)',
      description: 'Unauthorized access to Project Icarus telemetry data detected originating from internal research subnet on Oct 14th. The exfiltration bypasses primary egress filters. Initial assumption: Insider threat, but external compromise cannot be ruled out.',
      status: 'INVESTIGATING',
      createdBy: investigator._id,
      assignedTo: [investigator._id, reviewer._id],
      tags: ['CYBER', 'INSIDER_THREAT', 'HIGH_PRIORITY']
    });

    // 4. Create Competing Hypotheses
    const h1 = await Hypothesis.create({
      caseId: demoCase._id,
      title: 'H-01: Insider Threat (Engineering Team)',
      description: 'A current employee on the propulsion engineering team intentionally bypassed egress filters using valid credentials to exfiltrate telemetry data.',
      createdBy: investigator._id,
      score: 35
    });

    const h2 = await Hypothesis.create({
      caseId: demoCase._id,
      title: 'H-02: External Compromise (Phishing Pivot)',
      description: 'An external state-sponsored actor phished a low-level employee, escalated privileges, and established a C2 beacon to extract the data.',
      createdBy: investigator._id,
      score: 15 // will be recalculated
    });

    const h3 = await Hypothesis.create({
      caseId: demoCase._id,
      title: 'H-03: Misconfigured Backup System',
      description: 'The automated cloud backup system was misconfigured during the recent infrastructure migration, causing unauthorized offsite syncing.',
      createdBy: investigator._id,
      score: 10
    });

    // 5. Create Meaningful Evidence
    const e1 = await Evidence.create({
      caseId: demoCase._id,
      title: 'E-017: Satellite Telemetry Egress Log',
      description: 'Firewall log showing 4.2GB of encrypted traffic leaving port 443 towards an unknown overseas IP address at 03:00 AM.',
      type: 'Digital',
      verificationState: 'VERIFIED',
      confidenceScore: 95,
      uploadedBy: investigator._id
    });

    const e2 = await Evidence.create({
      caseId: demoCase._id,
      title: 'E-024: Engineer Badge Access Record',
      description: 'Dr. Aris Thorne swiped into the secure server room at 02:45 AM, 15 minutes before the unauthorized transfer began.',
      type: 'Physical',
      verificationState: 'VERIFIED',
      confidenceScore: 90,
      uploadedBy: investigator._id
    });

    const e3 = await Evidence.create({
      caseId: demoCase._id,
      title: 'E-042: Suspicious Spear-phishing Email',
      description: 'An email disguised as a mandatory HR policy update containing a malicious payload was delivered to Dr. Thorne\'s inbox 48 hours prior.',
      type: 'Digital',
      verificationState: 'UNVERIFIED',
      confidenceScore: 60,
      uploadedBy: investigator._id
    });

    const e4 = await Evidence.create({
      caseId: demoCase._id,
      title: 'E-051: C2 Beacon Network Signature',
      description: 'Intrusion Detection System (IDS) alert flagged a low-frequency beacon pattern consistent with APT-41 malware.',
      type: 'Digital',
      verificationState: 'VERIFIED',
      confidenceScore: 88,
      uploadedBy: investigator._id
    });

    const e5 = await Evidence.create({
      caseId: demoCase._id,
      title: 'E-088: Cloud Backup Audit Configuration',
      description: 'AWS CloudTrail logs confirm the S3 backup buckets were NOT modified in the last 6 months.',
      type: 'Document',
      verificationState: 'VERIFIED',
      confidenceScore: 99,
      uploadedBy: investigator._id
    });

    // 6. Create Meaningful Relationships
    // E-024 supports Insider Threat
    await Relationship.create({
      caseId: demoCase._id,
      evidenceId: e2._id,
      hypothesisId: h1._id,
      type: 'SUPPORT',
      strength: 8,
      createdBy: investigator._id
    });

    // E-017 supports External Compromise and Insider Threat
    await Relationship.create({
      caseId: demoCase._id,
      evidenceId: e1._id,
      hypothesisId: h1._id,
      type: 'SUPPORT',
      strength: 5,
      createdBy: investigator._id
    });
    
    await Relationship.create({
      caseId: demoCase._id,
      evidenceId: e1._id,
      hypothesisId: h2._id,
      type: 'SUPPORT',
      strength: 6,
      createdBy: investigator._id
    });

    // E-042 (unverified) supports External Compromise
    await Relationship.create({
      caseId: demoCase._id,
      evidenceId: e3._id,
      hypothesisId: h2._id,
      type: 'SUPPORT',
      strength: 9,
      createdBy: investigator._id
    });

    // E-051 supports External Compromise
    await Relationship.create({
      caseId: demoCase._id,
      evidenceId: e4._id,
      hypothesisId: h2._id,
      type: 'SUPPORT',
      strength: 10,
      createdBy: investigator._id
    });

    // E-051 contradicts Insider Threat (because malware beacon implies external C2)
    await Relationship.create({
      caseId: demoCase._id,
      evidenceId: e4._id,
      hypothesisId: h1._id,
      type: 'CONTRADICT',
      strength: 7,
      createdBy: investigator._id
    });

    // E-088 contradicts Misconfigured Backup
    await Relationship.create({
      caseId: demoCase._id,
      evidenceId: e5._id,
      hypothesisId: h3._id,
      type: 'CONTRADICT',
      strength: 10,
      createdBy: investigator._id
    });

    h1.score = 15.79;
    h1.explainability = [
       "+ 7.2 points from VERIFIED physical artifact E-024",
       "+ 4.75 points from VERIFIED digital artifact E-017",
       "- 6.16 points from VERIFIED digital artifact E-051"
    ];
    await h1.save();

    h2.score = 24.50;
    h2.explainability = [
       "+ 5.7 points from VERIFIED digital artifact E-017",
       "+ 8.8 points from VERIFIED digital artifact E-051",
       "(Artifact E-042 provides 0 points because it is UNVERIFIED)"
    ];
    await h2.save();

    h3.score = 0.1;
    h3.explainability = [
       "- 9.9 points from VERIFIED document E-088"
    ];
    await h3.save();

    // 7. Seed Timeline (Audit logs) to make the story coherent
    const baseTime = Date.now() - 1000 * 60 * 60 * 24; // 1 day ago
    
    await AuditLog.create({
      user: investigator._id,
      action: 'CREATE_CASE',
      entityType: 'Case',
      entityId: demoCase._id,
      details: { title: demoCase.title },
      createdAt: new Date(baseTime)
    });

    await AuditLog.create({
      user: investigator._id,
      action: 'CREATE_HYPOTHESIS',
      entityType: 'Hypothesis',
      entityId: h1._id,
      details: { title: h1.title },
      createdAt: new Date(baseTime + 1000 * 60 * 10) // +10 mins
    });
    
    await AuditLog.create({
      user: investigator._id,
      action: 'CREATE_HYPOTHESIS',
      entityType: 'Hypothesis',
      entityId: h2._id,
      details: { title: h2.title },
      createdAt: new Date(baseTime + 1000 * 60 * 15) // +15 mins
    });

    await AuditLog.create({
      user: investigator._id,
      action: 'ADD_EVIDENCE',
      entityType: 'Evidence',
      entityId: e1._id,
      details: { title: e1.title },
      createdAt: new Date(baseTime + 1000 * 60 * 30) // +30 mins
    });

    await AuditLog.create({
      user: investigator._id,
      action: 'VERIFY_EVIDENCE',
      entityType: 'Evidence',
      entityId: e1._id,
      details: { oldState: 'UNVERIFIED', newState: 'VERIFIED' },
      createdAt: new Date(baseTime + 1000 * 60 * 35) // +35 mins
    });

    console.log('Demo Case BK-2041 Seeded Successfully');
    return true;

  } catch (err) {
    console.error(err);
    throw err;
  }
};

if (require.main === module) {
  connectDB().then(() => seedDemo().then(() => process.exit(0)).catch(() => process.exit(1)));
}

module.exports = { seedDemo };
