const express = require('express');
const router = express.Router({ mergeParams: true });
const hypothesisController = require('../controllers/hypothesis.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// /api/cases/:caseId/hypotheses
router.route('/')
  .get(hypothesisController.getHypothesesForCase)
  .post(authorize('Investigator', 'Admin'), hypothesisController.createHypothesis);

// /api/hypotheses/:id
router.route('/:id')
  .get(hypothesisController.getHypothesis);

// /api/hypotheses/:id/relationships
router.route('/:id/relationships')
  .get(hypothesisController.getRelationships)
  .post(authorize('Investigator', 'Admin'), hypothesisController.addRelationship);

// /api/hypotheses/relationships/:id
router.route('/relationships/:id')
  .delete(authorize('Investigator', 'Admin'), hypothesisController.deleteRelationship);

// /api/hypotheses/:id/score-history
router.route('/:id/score-history')
  .get(hypothesisController.getScoreHistoryForHypothesis);

module.exports = router;
