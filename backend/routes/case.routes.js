const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(caseController.getCases)
  .post(authorize('Investigator', 'Admin'), caseController.createCase);

router.route('/:id')
  .get(caseController.getCase);

router.route('/:id/status')
  .put(authorize('Investigator', 'Reviewer', 'Admin'), caseController.updateCaseStatus);

module.exports = router;
