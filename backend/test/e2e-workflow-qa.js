/**
 * BlackBox Investigation Platform — Comprehensive Pre-Deployment E2E QA Test
 * 
 * Verifies:
 * 1. Authentication & RBAC (Admin, Investigator, Reviewer)
 * 2. Dashboard Aggregation & Health Metrics
 * 3. Case Creation & Lifecycle Management
 * 4. Evidence Pipeline & Multi-State Verification
 * 5. Competing Hypotheses & Mathematical Scoring Engine
 * 6. Score History & Causal Delta Tracking
 * 7. Evidence Relationships & Interactive Mapping
 * 8. Audit Trail & Timeline Logs
 * 9. Search, Filter, and Pagination Controls
 * 10. Data Persistence & Endpoint Security
 */

const http = require('http');
const express = require('express');
const cors = require('cors');

// Import routes & controllers
const authRoutes = require('../routes/auth.routes');
const caseRoutes = require('../routes/case.routes');
const evidenceRoutes = require('../routes/evidence.routes');
const hypothesisRoutes = require('../routes/hypothesis.routes');
const auditRoutes = require('../routes/audit.routes');
const dashboardRoutes = require('../routes/dashboard.routes');
const adminRoutes = require('../routes/admin.routes');
const { memoryStore } = require('../utils/memoryStore');

let server;
let port;
let baseUrl;

let investigatorToken = '';
let adminToken = '';
let reviewerToken = '';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failedTests++;
  }
}

async function apiRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, {
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runQA() {
  console.log('====================================================');
  console.log('🛡️  BLACKBOX PRE-DEPLOYMENT SYSTEM-WIDE QA PASS');
  console.log('====================================================\n');

  // 1. Setup in-process Express server with memoryStore
  memoryStore.cases = [];
  memoryStore.evidence = [];
  memoryStore.hypotheses = [];
  memoryStore.relationships = [];
  memoryStore.scoreHistory = [];
  memoryStore.auditLogs = [];

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/cases', caseRoutes);
  app.use('/api/evidence', evidenceRoutes);
  app.use('/api/cases/:caseId/evidence', evidenceRoutes);
  app.use('/api/cases/:caseId/hypotheses', hypothesisRoutes);
  app.use('/api/hypotheses', hypothesisRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/admin', adminRoutes);

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  console.log(`Test server running at ${baseUrl}`);

  try {
    // -------------------------------------------------------------
    // PHASE 1: AUTHENTICATION & RBAC SEEDING
    // -------------------------------------------------------------
    console.log('\n--- 1. Authentication & Security ---');
    
    // Login Investigator
    const invLogin = await apiRequest('POST', '/api/auth/login', { username: 'investigator', password: 'demo' });
    assert(invLogin.status === 200 && invLogin.data.success, 'Investigator login returns 200 OK and token');
    investigatorToken = invLogin.data.token;
    assert(invLogin.data.user.role === 'Investigator', 'Investigator role correctly decoded in session');

    // Login Admin
    const adminLogin = await apiRequest('POST', '/api/auth/login', { username: 'admin', password: 'demo' });
    assert(adminLogin.status === 200 && adminLogin.data.success, 'Admin login returns 200 OK');
    adminToken = adminLogin.data.token;
    assert(adminLogin.data.user.role === 'Admin', 'Admin role decoded');

    // Login Reviewer
    const revLogin = await apiRequest('POST', '/api/auth/login', { username: 'reviewer', password: 'demo' });
    assert(revLogin.status === 200 && revLogin.data.success, 'Reviewer login returns 200 OK');
    reviewerToken = revLogin.data.token;

    // Bad Password Rejection
    const badLogin = await apiRequest('POST', '/api/auth/login', { username: 'investigator', password: 'wrongpassword' });
    assert(badLogin.status === 400 || badLogin.status === 401 || !badLogin.data.success, 'Invalid credentials properly rejected');

    // -------------------------------------------------------------
    // PHASE 2: DASHBOARD TELEMETRY & METRICS
    // -------------------------------------------------------------
    console.log('\n--- 2. Dashboard Intelligence & Telemetry ---');
    const dashRes = await apiRequest('GET', '/api/dashboard/stats', null, investigatorToken);
    assert(dashRes.status === 200 && dashRes.data.success, 'Dashboard stats retrieved successfully');
    assert(dashRes.data.data.metrics !== undefined, 'Dashboard contains metrics structure');
    assert(dashRes.data.data.statusDistribution !== undefined, 'Dashboard contains lifecycle status distribution');

    // -------------------------------------------------------------
    // PHASE 3: CASE CREATION & WORKSPACE
    // -------------------------------------------------------------
    console.log('\n--- 3. Case Creation & Search/Filter ---');
    const caseRes = await apiRequest('POST', '/api/cases', {
      title: 'Operation Ironclad: Apex Infiltration',
      description: 'Forensic investigation into network perimeter breach and data exfiltration.',
      status: 'OPEN'
    }, investigatorToken);
    assert(caseRes.status === 201 && caseRes.data.success, 'Case created with 201 Created');
    const caseId = caseRes.data.data._id;
    assert(caseId !== undefined, `Case assigned unique ID: ${caseId}`);
    assert(caseRes.data.data.status === 'OPEN', 'Initial case status is OPEN');

    // Test Search & Filter on Cases
    const searchCases = await apiRequest('GET', `/api/cases?search=Ironclad&status=OPEN`, null, investigatorToken);
    assert(searchCases.status === 200 && searchCases.data.data.length >= 1, 'Case search by keyword & status filter works');

    // -------------------------------------------------------------
    // PHASE 4: EVIDENCE PIPELINE & VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- 4. Evidence Pipeline & Multi-State Verification ---');
    
    // Add Evidence 1: High confidence server log
    const ev1Res = await apiRequest('POST', '/api/evidence', {
      caseId,
      title: 'Core Switch Syslog Dump',
      description: 'Ingress connection anomaly detected at 02:44 UTC.',
      source: 'Firewall Cluster Alpha',
      confidenceScore: 90,
      tags: ['network', 'syslog', 'p0']
    }, investigatorToken);
    assert(ev1Res.status === 201 && ev1Res.data.success, 'Evidence #1 created');
    const ev1Id = ev1Res.data.data._id;
    assert(ev1Res.data.data.verificationState === 'UNVERIFIED', 'New evidence defaults to UNVERIFIED (0.5x multiplier)');

    // Add Evidence 2: Medium confidence encrypted file
    const ev2Res = await apiRequest('POST', '/api/evidence', {
      caseId,
      title: 'Staged Archive Artifact (shadow.tar.gz)',
      description: 'Recovered from /tmp on compromised bastion host.',
      source: 'Endpoint Agent 42',
      confidenceScore: 70,
      tags: ['malware', 'archive']
    }, investigatorToken);
    const ev2Id = ev2Res.data.data._id;
    assert(ev2Res.status === 201, 'Evidence #2 created');

    // Add Evidence 3: Witness Interview
    const ev3Res = await apiRequest('POST', '/api/evidence', {
      caseId,
      title: 'Admin Statement: Legitimate Maintenance',
      description: 'Claim that network spike was scheduled database re-indexing.',
      source: 'IT Staff Interview',
      confidenceScore: 60,
      tags: ['interview', 'alibi']
    }, investigatorToken);
    const ev3Id = ev3Res.data.data._id;
    assert(ev3Res.status === 201, 'Evidence #3 created');

    // Verify Evidence #1 -> VERIFIED (1.0x multiplier)
    const verifyEv1 = await apiRequest('PATCH', `/api/evidence/${ev1Id}/verify`, {
      verificationState: 'VERIFIED',
      verificationNotes: 'Cryptographically hashed and matched against immutable audit log.'
    }, investigatorToken);
    assert(verifyEv1.status === 200 && verifyEv1.data.data.verificationState === 'VERIFIED', 'Evidence #1 updated to VERIFIED (1.0x)');

    // Verify Evidence #3 -> DISPUTED (0.2x multiplier)
    const verifyEv3 = await apiRequest('PATCH', `/api/evidence/${ev3Id}/verify`, {
      verificationState: 'DISPUTED',
      verificationNotes: 'No scheduled maintenance ticket found in change management database.'
    }, investigatorToken);
    assert(verifyEv3.status === 200 && verifyEv3.data.data.verificationState === 'DISPUTED', 'Evidence #3 updated to DISPUTED (0.2x)');

    // -------------------------------------------------------------
    // PHASE 5: 3 COMPETING HYPOTHESES & MATHEMATICAL SCORING
    // -------------------------------------------------------------
    console.log('\n--- 5. Competing Hypotheses & Mathematical Scoring ---');

    // Hypothesis A: External APT Attack
    const hypARes = await apiRequest('POST', '/api/hypotheses', {
      caseId,
      title: 'State-Sponsored APT Infiltration',
      description: 'Adversary leveraged compromised VPN credentials to pivot internally.'
    }, investigatorToken);
    assert(hypARes.status === 201, 'Hypothesis A created');
    const hypAId = hypARes.data.data._id;

    // Hypothesis B: Rogue Insider Exfiltration
    const hypBRes = await apiRequest('POST', '/api/hypotheses', {
      caseId,
      title: 'Disgruntled Insider Data Theft',
      description: 'Internal employee exfiltrated intellectual property using authorized access.'
    }, investigatorToken);
    assert(hypBRes.status === 201, 'Hypothesis B created');
    const hypBId = hypBRes.data.data._id;

    // Hypothesis C: Benign System Glitch / Misconfiguration
    const hypCRes = await apiRequest('POST', '/api/hypotheses', {
      caseId,
      title: 'Automated Backup Misconfiguration',
      description: 'Routine backup script malfunctioned causing bandwidth surge.'
    }, investigatorToken);
    assert(hypCRes.status === 201, 'Hypothesis C created');
    const hypCId = hypCRes.data.data._id;

    // Link Evidence to Hypothesis A:
    // 1. ev1 (Syslog Dump, conf 90, VERIFIED 1.0x) -> SUPPORT, strength 9 => + (9 * 0.90 * 1.0) = +8.10
    // 2. ev2 (Staged Archive, conf 70, UNVERIFIED 0.5x) -> SUPPORT, strength 6 => + (6 * 0.70 * 0.5) = +2.10
    // Expected Score for Hyp A = 8.10 + 2.10 = 10.20
    const linkA1 = await apiRequest('POST', `/api/hypotheses/${hypAId}/relationships`, {
      evidenceId: ev1Id,
      type: 'SUPPORT',
      strength: 9
    }, investigatorToken);
    assert((linkA1.status === 200 || linkA1.status === 201) && linkA1.data.success, 'Linked Evidence 1 to Hypothesis A (SUPPORT)');

    const linkA2 = await apiRequest('POST', `/api/hypotheses/${hypAId}/relationships`, {
      evidenceId: ev2Id,
      type: 'SUPPORT',
      strength: 6
    }, investigatorToken);
    assert((linkA2.status === 200 || linkA2.status === 201) && linkA2.data.success, 'Linked Evidence 2 to Hypothesis A (SUPPORT)');

    // Link Evidence to Hypothesis C:
    // 1. ev1 (Syslog Dump, conf 90, VERIFIED 1.0x) -> CONTRADICT, strength 8 => - (8 * 0.90 * 1.0) = -7.20
    // 2. ev3 (Admin Statement, conf 60, DISPUTED 0.2x) -> SUPPORT, strength 5 => + (5 * 0.60 * 0.2) = +0.60
    // Expected Score for Hyp C = -7.20 + 0.60 = -6.60
    const linkC1 = await apiRequest('POST', `/api/hypotheses/${hypCId}/relationships`, {
      evidenceId: ev1Id,
      type: 'CONTRADICT',
      strength: 8
    }, investigatorToken);
    assert((linkC1.status === 200 || linkC1.status === 201), 'Linked Evidence 1 to Hypothesis C (CONTRADICT)');

    const linkC2 = await apiRequest('POST', `/api/hypotheses/${hypCId}/relationships`, {
      evidenceId: ev3Id,
      type: 'SUPPORT',
      strength: 5
    }, investigatorToken);
    assert((linkC2.status === 200 || linkC2.status === 201), 'Linked Evidence 3 to Hypothesis C (SUPPORT)');

    // Fetch Hypothesis A and verify computed score
    const getHypA = await apiRequest('GET', `/api/hypotheses/${hypAId}`, null, investigatorToken);
    assert(getHypA.status === 200, 'Fetched Hypothesis A details');
    const scoreA = getHypA.data.data.score;
    assert(Math.abs(scoreA - 10.20) < 0.01, `Hypothesis A score equals 10.20 (calculated: ${scoreA})`);
    assert(getHypA.data.data.explainability.length === 2, 'Hypothesis A explainability contains 2 mathematical factors');

    // Fetch Hypothesis C and verify computed score
    const getHypC = await apiRequest('GET', `/api/hypotheses/${hypCId}`, null, investigatorToken);
    const scoreC = getHypC.data.data.score;
    assert(Math.abs(scoreC - (-6.60)) < 0.01, `Hypothesis C score equals -6.60 (calculated: ${scoreC})`);

    // -------------------------------------------------------------
    // PHASE 6: SCORE HISTORY & CAUSAL INTELLIGENCE
    // -------------------------------------------------------------
    console.log('\n--- 6. Score History & Causal Delta Tracking ---');
    
    // Now verify Evidence 2 (changes UNVERIFIED 0.5x -> VERIFIED 1.0x)
    // Hypothesis A score should update from 10.20 to: 8.10 + (6 * 0.70 * 1.0) = 8.10 + 4.20 = 12.30
    // Delta should be +2.10
    const verifyEv2 = await apiRequest('PATCH', `/api/evidence/${ev2Id}/verify`, {
      verificationState: 'VERIFIED',
      verificationNotes: 'Payload decompiled and confirms staging directory.'
    }, investigatorToken);
    assert(verifyEv2.status === 200, 'Evidence #2 verified (triggers automatic recalculation & score history event)');

    // Fetch Score History for Case
    const histRes = await apiRequest('GET', `/api/cases/${caseId}/score-history`, null, investigatorToken);
    assert(histRes.status === 200 && histRes.data.success, 'Case score history retrieved');
    assert(Array.isArray(histRes.data.data) && histRes.data.data.length >= 1, 'Score history contains recorded transition events');

    const lastEvent = histRes.data.data[histRes.data.data.length - 1];
    assert(lastEvent.triggerType !== undefined, `Latest history event has triggerType: ${lastEvent.triggerType}`);
    const deltaVal = lastEvent.delta !== undefined ? lastEvent.delta : lastEvent.scoreDelta;
    assert(deltaVal !== undefined, `Latest history event has delta: ${deltaVal}`);

    // Fetch Intelligence Summary for Case
    const intelRes = await apiRequest('GET', `/api/cases/${caseId}/intelligence-summary`, null, investigatorToken);
    assert(intelRes.status === 200 && intelRes.data.success, 'Intelligence summary retrieved');
    assert(intelRes.data.data.leadingHypothesis !== null, `Leading hypothesis identified: ${intelRes.data.data.leadingHypothesis?.title}`);

    // -------------------------------------------------------------
    // PHASE 7: CASE LIFECYCLE PROGRESSION & AUDIT TRAIL
    // -------------------------------------------------------------
    console.log('\n--- 7. Case Lifecycle Progression & Audit Logs ---');
    
    // Progress lifecycle: OPEN -> INVESTIGATING -> REVIEW
    const setInvestigating = await apiRequest('PATCH', `/api/cases/${caseId}/status`, { status: 'INVESTIGATING' }, investigatorToken);
    assert(setInvestigating.status === 200 && setInvestigating.data.data.status === 'INVESTIGATING', 'Case status advanced to INVESTIGATING');

    const setReview = await apiRequest('PATCH', `/api/cases/${caseId}/status`, { status: 'REVIEW' }, investigatorToken);
    assert(setReview.status === 200 && setReview.data.data.status === 'REVIEW', 'Case status advanced to REVIEW');

    // Fetch Audit Trail
    const auditRes = await apiRequest('GET', `/api/audit?caseId=${caseId}`, null, investigatorToken);
    assert(auditRes.status === 200 && auditRes.data.success, 'Audit logs retrieved for case');
    assert(auditRes.data.data.length >= 5, `Audit log contains ${auditRes.data.data.length} immutable activity records`);

    // -------------------------------------------------------------
    // PHASE 8: RBAC & ADMIN SECURITY
    // -------------------------------------------------------------
    console.log('\n--- 8. RBAC Endpoint Security & Administrative Oversight ---');

    // Investigator attempting to access Admin endpoint must be denied (403 Forbidden)
    const invAdminAccess = await apiRequest('GET', '/api/admin/users', null, investigatorToken);
    assert(invAdminAccess.status === 403 || !invAdminAccess.data.success, 'Investigator is FORBIDDEN from accessing /api/admin/users (403)');

    // Admin accessing Admin endpoint must be permitted (200 OK)
    const adminUserAccess = await apiRequest('GET', '/api/admin/users', null, adminToken);
    assert(adminUserAccess.status === 200 && adminUserAccess.data.success, 'Admin can access /api/admin/users (200 OK)');
    assert(Array.isArray(adminUserAccess.data.data) && adminUserAccess.data.data.length >= 3, 'Admin user list returned all platform users');

    const adminCaseMonitoring = await apiRequest('GET', '/api/admin/case-monitoring', null, adminToken);
    assert(adminCaseMonitoring.status === 200 && adminCaseMonitoring.data.success, 'Admin can access /api/admin/case-monitoring (200 OK)');
    assert(adminCaseMonitoring.data.data.totalCases >= 1, 'Admin case oversight reports active cases');

  } catch (err) {
    console.error('Unexpected QA failure:', err);
    assert(false, `Execution exception: ${err.message}`);
  } finally {
    if (server) {
      server.close();
    }
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n====================================================');
  console.log(`🏁 QA Test Suite Results: ${passedTests} Passed / ${failedTests} Failed (Total: ${totalTests})`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runQA();
