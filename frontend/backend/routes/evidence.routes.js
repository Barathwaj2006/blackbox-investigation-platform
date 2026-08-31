const express = require('express');
const router = express.Router({ mergeParams: true });
const evidenceController = require('../controllers/evidence.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// /api/cases/:caseId/evidence
router.route('/')
  .get(evidenceController.getEvidenceForCase)
  .post(authorize('Investigator', 'Admin'), evidenceController.addEvidence);

// /api/evidence/:id/verify
router.route('/:id/verify')
  .put(authorize('Investigator', 'Reviewer', 'Admin'), evidenceController.verifyEvidence);

module.exports = router;
