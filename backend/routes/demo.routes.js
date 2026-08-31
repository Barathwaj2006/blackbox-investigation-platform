const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Case = require('../models/Case');
const Evidence = require('../models/Evidence');
const Hypothesis = require('../models/Hypothesis');
const EvidenceRelationship = require('../models/EvidenceRelationship');
const ScoreHistory = require('../models/ScoreHistory');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/auth');
const { memoryStore, recalculateScoreInMemory } = require('../utils/memoryStore');
const { calculateHypothesisScore } = require('../utils/scoringEngine');

router.use(protect);

// Helper to seed rich BK-2041 demo investigation
async function seedDemoDataset(user) {
  const actor = user || { _id: 'u_investigator', name: 'A. Kumar', username: 'investigator', role: 'Investigator' };

  if (mongoose.connection.readyState !== 1) {
    // Memory store seeding
    const caseId = 'case_bk2041';
    
    // Check if case already exists, remove previous if re-seeding
    memoryStore.cases = memoryStore.cases.filter(c => c._id !== caseId);
    memoryStore.evidence = memoryStore.evidence.filter(e => e.caseId !== caseId);
    memoryStore.hypotheses = memoryStore.hypotheses.filter(h => h.caseId !== caseId);
    memoryStore.relationships = memoryStore.relationships.filter(r => r.caseId !== caseId);
    memoryStore.scoreHistory = (memoryStore.scoreHistory || []).filter(sh => sh.caseId !== caseId);
    memoryStore.auditLogs = (memoryStore.auditLogs || []).filter(al => al.details?.caseId !== caseId);

    const demoCase = {
      _id: caseId,
      title: 'BK-2041: Corporate Data Exfiltration & Vault Breach',
      description: 'Systematic exfiltration of aerospace R&D datasets from internal vault to overseas command servers.',
      status: 'INVESTIGATING',
      assignedTo: [{ _id: actor._id, name: actor.name || 'A. Kumar', username: actor.username || 'investigator' }],
      createdBy: { _id: 'u_admin', name: 'Admin', username: 'admin' },
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    };
    memoryStore.cases.unshift(demoCase);

    // 6 Evidence artifacts
    const ev1 = {
      _id: 'ev_017',
      caseId,
      title: 'E-017: Foreign Authentication Sockets (Moscow/Sofia IP Cluster)',
      description: 'Multiple failed brute force logins followed by a successful privileged session from ASN 49231.',
      type: 'Digital',
      source: 'Authentication Gateway Node-02',
      verificationState: 'VERIFIED',
      confidenceScore: 92,
      uploadedBy: { _id: actor._id, name: actor.name, username: actor.username },
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
    };
    const ev2 = {
      _id: 'ev_009',
      caseId,
      title: 'E-009: Physical Badge Access Log (Dr. Vance Server Vault)',
      description: 'Turnstile access badge recorded off-hours entry at 02:14 AM without associated CCTV correlation.',
      type: 'Physical',
      source: 'Perimeter Security Turnstile 04',
      verificationState: 'VERIFIED',
      confidenceScore: 88,
      uploadedBy: { _id: actor._id, name: actor.name, username: actor.username },
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
    };
    const ev3 = {
      _id: 'ev_022',
      caseId,
      title: 'E-022: Encrypted Staging Tarball (exfil_archive.tar.gz)',
      description: 'Staged 42GB compressed archive discovered in hidden tmp folder /var/tmp/.syslog_d containing CAD designs.',
      type: 'Digital',
      source: 'Storage Node Vault-07',
      verificationState: 'VERIFIED',
      confidenceScore: 95,
      uploadedBy: { _id: actor._id, name: actor.name, username: actor.username },
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    };
    const ev4 = {
      _id: 'ev_031',
      caseId,
      title: 'E-031: Outbound Encrypted Tor Circuit Sockets',
      description: 'Burst of encrypted outbound TLS sessions on non-standard port 8443 matching known exit relays.',
      type: 'Network',
      source: 'Border Firewall Core-East',
      verificationState: 'UNVERIFIED',
      confidenceScore: 75,
      uploadedBy: { _id: actor._id, name: actor.name, username: actor.username },
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    };
    const ev5 = {
      _id: 'ev_040',
      caseId,
      title: 'E-040: Anonymized Whistleblower Internal Hotline Tip',
      description: 'Anonymous tip claiming an engineering lead was coerced into exporting schematics under debt pressure.',
      type: 'Document',
      source: 'Ethics Compliance Portal',
      verificationState: 'DISPUTED',
      confidenceScore: 40,
      uploadedBy: { _id: actor._id, name: actor.name, username: actor.username },
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
    };
    const ev6 = {
      _id: 'ev_055',
      caseId,
      title: 'E-055: Workstation WK-88 USB Mass Storage Kernel Dumps',
      description: 'Kernel traces showing SanDisk Extreme 256GB flash drive mounted for 14 minutes during lunch hour.',
      type: 'Digital',
      source: 'Engineering Workstation WK-88',
      verificationState: 'UNVERIFIED',
      confidenceScore: 85,
      uploadedBy: { _id: actor._id, name: actor.name, username: actor.username },
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    };

    memoryStore.evidence.push(ev1, ev2, ev3, ev4, ev5, ev6);

    // 3 Hypotheses
    const hyp1 = {
      _id: 'hyp_101',
      caseId,
      title: 'H1: Malicious Insider Theft & Sabotage (Dr. Vance)',
      score: 0,
      explainability: [],
      createdBy: { _id: actor._id, name: actor.name, username: actor.username },
      createdAt: new Date(Date.now() - 3600000 * 40).toISOString()
    };
    const hyp2 = {
      _id: 'hyp_102',
      caseId,
      title: 'H2: State-Sponsored APT Infiltration (Cobalt Mirage)',
      score: 0,
      explainability: [],
      createdBy: { _id: actor._id, name: actor.name, username: actor.username },
      createdAt: new Date(Date.now() - 3600000 * 38).toISOString()
    };
    const hyp3 = {
      _id: 'hyp_103',
      caseId,
      title: 'H3: Compromised Employee Credentials & Lateral Pivot',
      score: 0,
      explainability: [],
      createdBy: { _id: actor._id, name: actor.name, username: actor.username },
      createdAt: new Date(Date.now() - 3600000 * 35).toISOString()
    };

    memoryStore.hypotheses.push(hyp1, hyp2, hyp3);

    // Relationships
    const rels = [
      { _id: 'rel_101', caseId, hypothesisId: 'hyp_102', evidenceId: 'ev_017', type: 'SUPPORT', strength: 9, createdBy: actor._id },
      { _id: 'rel_102', caseId, hypothesisId: 'hyp_101', evidenceId: 'ev_017', type: 'CONTRADICT', strength: 9, createdBy: actor._id },
      { _id: 'rel_103', caseId, hypothesisId: 'hyp_103', evidenceId: 'ev_017', type: 'SUPPORT', strength: 7, createdBy: actor._id },
      { _id: 'rel_104', caseId, hypothesisId: 'hyp_101', evidenceId: 'ev_009', type: 'SUPPORT', strength: 8, createdBy: actor._id },
      { _id: 'rel_105', caseId, hypothesisId: 'hyp_103', evidenceId: 'ev_009', type: 'CONTRADICT', strength: 6, createdBy: actor._id },
      { _id: 'rel_106', caseId, hypothesisId: 'hyp_102', evidenceId: 'ev_022', type: 'SUPPORT', strength: 9, createdBy: actor._id },
      { _id: 'rel_107', caseId, hypothesisId: 'hyp_103', evidenceId: 'ev_022', type: 'SUPPORT', strength: 7, createdBy: actor._id },
      { _id: 'rel_108', caseId, hypothesisId: 'hyp_102', evidenceId: 'ev_031', type: 'SUPPORT', strength: 7, createdBy: actor._id },
      { _id: 'rel_109', caseId, hypothesisId: 'hyp_101', evidenceId: 'ev_040', type: 'SUPPORT', strength: 5, createdBy: actor._id },
      { _id: 'rel_110', caseId, hypothesisId: 'hyp_103', evidenceId: 'ev_055', type: 'SUPPORT', strength: 8, createdBy: actor._id }
    ];

    memoryStore.relationships.push(...rels);

    // Initial calculations with history
    recalculateScoreInMemory('hyp_101', { triggerType: 'INITIAL_EVALUATION', forceRecord: true }, actor);
    recalculateScoreInMemory('hyp_102', { triggerType: 'VERIFY_EVIDENCE', triggerEntityId: 'ev_017', triggerDetails: { evidenceId: 'ev_017', evidenceTitle: ev1.title, description: 'E-017 verified by Senior Analyst' }, forceRecord: true }, actor);
    recalculateScoreInMemory('hyp_103', { triggerType: 'ADD_EVIDENCE_RELATIONSHIP', triggerEntityId: 'rel_110', triggerDetails: { evidenceId: 'ev_055', evidenceTitle: ev6.title, description: 'Linked USB Kernel Dumps to Lateral Pivot' }, forceRecord: true }, actor);

    // Audit logs
    memoryStore.auditLogs.unshift(
      {
        _id: 'log_bk_' + Date.now() + '_1',
        user: { name: actor.name, username: actor.username, role: actor.role },
        action: 'CREATE_CASE',
        entityType: 'Case',
        entityId: caseId,
        details: { title: demoCase.title, caseId },
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        _id: 'log_bk_' + Date.now() + '_2',
        user: { name: actor.name, username: actor.username, role: actor.role },
        action: 'ADD_EVIDENCE',
        entityType: 'Evidence',
        entityId: 'ev_017',
        details: { title: ev1.title, caseId },
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
      },
      {
        _id: 'log_bk_' + Date.now() + '_3',
        user: { name: actor.name, username: actor.username, role: actor.role },
        action: 'VERIFY_EVIDENCE',
        entityType: 'Evidence',
        entityId: 'ev_017',
        details: { oldState: 'UNVERIFIED', newState: 'VERIFIED', caseId },
        createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
      },
      {
        _id: 'log_bk_' + Date.now() + '_4',
        user: { name: actor.name, username: actor.username, role: actor.role },
        action: 'CREATE_HYPOTHESIS',
        entityType: 'Hypothesis',
        entityId: 'hyp_102',
        details: { title: hyp2.title, caseId },
        createdAt: new Date(Date.now() - 3600000 * 25).toISOString()
      }
    );

    return { caseId, title: demoCase.title };
  }

  // MongoDB Seeding
  let demoCase = await Case.findOne({ title: { $regex: 'BK-2041', $options: 'i' } });
  if (!demoCase) {
    demoCase = await Case.create({
      title: 'BK-2041: Corporate Data Exfiltration & Vault Breach',
      description: 'Systematic exfiltration of aerospace R&D datasets from internal vault to overseas command servers.',
      status: 'INVESTIGATING',
      createdBy: actor._id,
      assignedTo: [actor._id]
    });
  }

  const caseId = demoCase._id;

  // Clear existing for this case
  await Evidence.deleteMany({ caseId });
  await Hypothesis.deleteMany({ caseId });
  await EvidenceRelationship.deleteMany({ caseId });
  await ScoreHistory.deleteMany({ caseId });

  // Create evidence
  const ev1 = await Evidence.create({
    caseId,
    title: 'E-017: Foreign Authentication Sockets (Moscow/Sofia IP Cluster)',
    description: 'Multiple failed brute force logins followed by a successful privileged session from ASN 49231.',
    type: 'Digital',
    source: 'Authentication Gateway Node-02',
    verificationState: 'VERIFIED',
    confidenceScore: 92,
    uploadedBy: actor._id
  });

  const ev2 = await Evidence.create({
    caseId,
    title: 'E-009: Physical Badge Access Log (Dr. Vance Server Vault)',
    description: 'Turnstile access badge recorded off-hours entry at 02:14 AM without associated CCTV correlation.',
    type: 'Physical',
    source: 'Perimeter Security Turnstile 04',
    verificationState: 'VERIFIED',
    confidenceScore: 88,
    uploadedBy: actor._id
  });

  const ev3 = await Evidence.create({
    caseId,
    title: 'E-022: Encrypted Staging Tarball (exfil_archive.tar.gz)',
    description: 'Staged 42GB compressed archive discovered in hidden tmp folder /var/tmp/.syslog_d containing CAD designs.',
    type: 'Digital',
    source: 'Storage Node Vault-07',
    verificationState: 'VERIFIED',
    confidenceScore: 95,
    uploadedBy: actor._id
  });

  const ev4 = await Evidence.create({
    caseId,
    title: 'E-031: Outbound Encrypted Tor Circuit Sockets',
    description: 'Burst of encrypted outbound TLS sessions on non-standard port 8443 matching known exit relays.',
    type: 'Network',
    source: 'Border Firewall Core-East',
    verificationState: 'UNVERIFIED',
    confidenceScore: 75,
    uploadedBy: actor._id
  });

  const ev5 = await Evidence.create({
    caseId,
    title: 'E-040: Anonymized Whistleblower Internal Hotline Tip',
    description: 'Anonymous tip claiming an engineering lead was coerced into exporting schematics under debt pressure.',
    type: 'Document',
    source: 'Ethics Compliance Portal',
    verificationState: 'DISPUTED',
    confidenceScore: 40,
    uploadedBy: actor._id
  });

  const ev6 = await Evidence.create({
    caseId,
    title: 'E-055: Workstation WK-88 USB Mass Storage Kernel Dumps',
    description: 'Kernel traces showing SanDisk Extreme 256GB flash drive mounted for 14 minutes during lunch hour.',
    type: 'Digital',
    source: 'Engineering Workstation WK-88',
    verificationState: 'UNVERIFIED',
    confidenceScore: 85,
    uploadedBy: actor._id
  });

  // Create hypotheses
  const h1 = await Hypothesis.create({
    caseId,
    title: 'H1: Malicious Insider Theft & Sabotage (Dr. Vance)',
    createdBy: actor._id
  });
  const h2 = await Hypothesis.create({
    caseId,
    title: 'H2: State-Sponsored APT Infiltration (Cobalt Mirage)',
    createdBy: actor._id
  });
  const h3 = await Hypothesis.create({
    caseId,
    title: 'H3: Compromised Employee Credentials & Lateral Pivot',
    createdBy: actor._id
  });

  // Create Relationships
  await EvidenceRelationship.create([
    { hypothesisId: h2._id, evidenceId: ev1._id, type: 'SUPPORT', strength: 9, caseId, createdBy: actor._id },
    { hypothesisId: h1._id, evidenceId: ev1._id, type: 'CONTRADICT', strength: 9, caseId, createdBy: actor._id },
    { hypothesisId: h3._id, evidenceId: ev1._id, type: 'SUPPORT', strength: 7, caseId, createdBy: actor._id },
    { hypothesisId: h1._id, evidenceId: ev2._id, type: 'SUPPORT', strength: 8, caseId, createdBy: actor._id },
    { hypothesisId: h3._id, evidenceId: ev2._id, type: 'CONTRADICT', strength: 6, caseId, createdBy: actor._id },
    { hypothesisId: h2._id, evidenceId: ev3._id, type: 'SUPPORT', strength: 9, caseId, createdBy: actor._id },
    { hypothesisId: h3._id, evidenceId: ev3._id, type: 'SUPPORT', strength: 7, caseId, createdBy: actor._id },
    { hypothesisId: h2._id, evidenceId: ev4._id, type: 'SUPPORT', strength: 7, caseId, createdBy: actor._id },
    { hypothesisId: h1._id, evidenceId: ev5._id, type: 'SUPPORT', strength: 5, caseId, createdBy: actor._id },
    { hypothesisId: h3._id, evidenceId: ev6._id, type: 'SUPPORT', strength: 8, caseId, createdBy: actor._id }
  ]);

  // Recalculate
  await calculateHypothesisScore(h1._id, { triggerType: 'INITIAL_EVALUATION' }, actor);
  await calculateHypothesisScore(h2._id, { triggerType: 'VERIFY_EVIDENCE', triggerEntityId: ev1._id }, actor);
  await calculateHypothesisScore(h3._id, { triggerType: 'ADD_EVIDENCE_RELATIONSHIP' }, actor);

  return { caseId, title: demoCase.title };
}

// POST /api/demo/seed - Seed rich demo dataset
router.post('/seed', async (req, res, next) => {
  try {
    const result = await seedDemoDataset(req.user);
    res.json({
      success: true,
      message: 'Demo investigation dataset loaded successfully.',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/demo/reset - Reset demo investigation back to pristine state
router.post('/reset', async (req, res, next) => {
  try {
    const result = await seedDemoDataset(req.user);
    res.json({
      success: true,
      message: 'Demo investigation reset to pristine baseline state.',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
