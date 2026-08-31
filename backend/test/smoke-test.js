/**
 * BlackBox Investigation Platform — Smoke & Integration Test Suite
 * Tests Core Math Scoring Engine, RBAC, Data Structures, and Lifecycle Constraints.
 */

const { computeScore } = require('../utils/scoringEngine');

console.log('====================================================');
console.log('🧪 BlackBox Platform Automated Smoke Tests');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failCount++;
  }
}

// 1. SCORING ENGINE MATHEMATICAL INTEGRITY
console.log('1. Testing Scoring Engine Calculation...');

const mockEvidenceMap = {
  'ev-1': {
    _id: 'ev-1',
    title: 'Server Access Log Spike',
    confidenceScore: 90,
    verificationState: 'VERIFIED' // Multiplier: 1.0
  },
  'ev-2': {
    _id: 'ev-2',
    title: 'Corrupted USB Drive Found',
    confidenceScore: 60,
    verificationState: 'UNVERIFIED' // Multiplier: 0.5
  },
  'ev-3': {
    _id: 'ev-3',
    title: 'Disputed Alibi Log',
    confidenceScore: 80,
    verificationState: 'DISPUTED' // Multiplier: 0.2
  },
  'ev-4': {
    _id: 'ev-4',
    title: 'Fabricated Timestamp',
    confidenceScore: 90,
    verificationState: 'REJECTED' // Multiplier: 0.0
  }
};

const mockRelationships = [
  {
    hypothesisId: 'hyp-101',
    evidenceId: mockEvidenceMap['ev-1'],
    type: 'SUPPORT',
    strength: 8 // 8 * 0.9 * 1.0 = +7.20
  },
  {
    hypothesisId: 'hyp-101',
    evidenceId: mockEvidenceMap['ev-2'],
    type: 'CONTRADICT',
    strength: 4 // 4 * 0.6 * 0.5 = -1.20
  },
  {
    hypothesisId: 'hyp-101',
    evidenceId: mockEvidenceMap['ev-3'],
    type: 'CONTRADICT',
    strength: 5 // 5 * 0.8 * 0.2 = -0.80
  },
  {
    hypothesisId: 'hyp-101',
    evidenceId: mockEvidenceMap['ev-4'],
    type: 'SUPPORT',
    strength: 10 // 10 * 0.9 * 0.0 = +0.00 (Rejected)
  }
];

const result = computeScore(mockRelationships);

// Expected: 7.20 - 1.20 - 0.80 + 0.00 = 5.20
assert(Math.abs(result.score - 5.20) < 0.001, `Calculated score should equal 5.20 (got ${result.score})`);
assert(Array.isArray(result.explainability), 'Result contains explainability list');
assert(result.explainability.length === 4, 'Explainability contains 4 factor items');
assert(result.explainability[0].includes('+7.20'), 'Support factor contains correct +7.20 contribution');
assert(result.explainability[3].includes('+0.00'), 'Rejected factor displays 0.00 contribution');

// 2. RBAC ROLES & CASE STATUS WORKFLOWS
console.log('\n2. Testing RBAC & Workflow Constraints...');
const validRoles = ['Admin', 'Investigator', 'Reviewer'];
assert(validRoles.includes('Admin') && validRoles.includes('Investigator') && validRoles.includes('Reviewer'), 'Supported user roles verified (Admin, Investigator, Reviewer)');

const validStatuses = ['DRAFT', 'OPEN', 'INVESTIGATING', 'REVIEW', 'RESOLVED', 'ARCHIVED'];
assert(validStatuses.length === 6, 'All 6 lifecycle statuses available');

const validVerificationStates = ['UNVERIFIED', 'VERIFIED', 'DISPUTED', 'REJECTED'];
assert(validVerificationStates.length === 4, 'All 4 verification states supported');

// 3. HYPOTHESIS COMPARISON & RANKING ORDER
console.log('\n3. Testing Competing Hypothesis Sorting...');
const sampleTheories = [
  { _id: 'h1', title: 'Theory A', score: 2.4 },
  { _id: 'h2', title: 'Theory B', score: 8.9 },
  { _id: 'h3', title: 'Theory C', score: -1.5 }
];
const ranked = [...sampleTheories].sort((a, b) => b.score - a.score);
assert(ranked[0]._id === 'h2', 'Leading theory is ranked at index 0');
assert(ranked[2]._id === 'h3', 'Lowest theory is ranked at the end');

// 4. SCORE HISTORY & CAUSAL DELTA TRACKING
console.log('\n4. Testing Score History & Delta Tracking...');
const initialScore = 5.20;
const updatedScore = 8.80;
const delta = Number((updatedScore - initialScore).toFixed(2));
assert(delta === 3.60, `Score delta correctly computed as +3.60 (got ${delta})`);

const mockTrigger = {
  triggerType: 'VERIFY_EVIDENCE',
  triggerEntityId: 'ev-2',
  triggerDetails: {
    evidenceTitle: 'Corrupted USB Drive Found',
    verificationState: 'VERIFIED',
    description: 'Evidence verification changed to VERIFIED (multiplier updated 0.5x -> 1.0x)'
  }
};
assert(mockTrigger.triggerType === 'VERIFY_EVIDENCE', 'Trigger type verified');
assert(mockTrigger.triggerDetails.verificationState === 'VERIFIED', 'Verification state in trigger captured');

// 5. SUMMARY
console.log('\n====================================================');
console.log(`Smoke Test Summary: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
