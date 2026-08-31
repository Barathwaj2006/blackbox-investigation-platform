const express = require('express');
const router = express.Router({ mergeParams: true });
const hypothesisController = require('../controllers/hypothesis.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// /api/cases/:caseId/hypotheses
router.route('/')
  .get(hypothesisController.getHypothesesForCase)
  .post(authorize('Investigator', 'Admin'), hypothesisController.createHypothesis);

// /api/hypotheses/:id/relationships
router.route('/:id/relationships')
  .get(hypothesisController.getRelationships)
  .post(authorize('Investigator', 'Admin'), hypothesisController.addRelationship);

module.exports = router;
