const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(authorize('Reviewer', 'Admin'), auditController.getAuditLogs);

module.exports = router;
