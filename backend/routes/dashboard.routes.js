const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Case = require('../models/Case');
const Evidence = require('../models/Evidence');
const Hypothesis = require('../models/Hypothesis');
const AuditLog = require('../models/AuditLog');
const { memoryStore } = require('../utils/memoryStore');

// GET /api/dashboard/stats & /api/dashboard/summary
router.get(['/stats', '/summary'], protect, async (req, res) => {
  try {
    const isMongo = mongoose.connection.readyState === 1;

    if (isMongo) {
      const [cases, evidence, hypotheses, recentLogs] = await Promise.all([
        Case.find({}).sort({ updatedAt: -1 }).lean(),
        Evidence.find({}).lean(),
        Hypothesis.find({}).lean(),
        AuditLog.find({}).sort({ createdAt: -1 }).limit(10).lean()
      ]);

      const totalCases = cases.length;
      const activeInvestigations = cases.filter(c => c.status === 'INVESTIGATING' || c.status === 'OPEN').length;
      const casesUnderReview = cases.filter(c => c.status === 'REVIEW').length;
      const resolvedCases = cases.filter(c => c.status === 'RESOLVED' || c.status === 'ARCHIVED').length;

      const totalEvidence = evidence.length;
      const verifiedEvidence = evidence.filter(e => e.verificationState === 'VERIFIED').length;
      const unverifiedEvidence = evidence.filter(e => e.verificationState === 'UNVERIFIED').length;
      const disputedEvidence = evidence.filter(e => e.verificationState === 'DISPUTED').length;
      const rejectedEvidence = evidence.filter(e => e.verificationState === 'REJECTED').length;

      const activeHypotheses = hypotheses.length;

      // Status Distribution Breakdown
      const statusDistribution = {
        DRAFT: cases.filter(c => c.status === 'DRAFT').length,
        OPEN: cases.filter(c => c.status === 'OPEN').length,
        INVESTIGATING: cases.filter(c => c.status === 'INVESTIGATING').length,
        REVIEW: cases.filter(c => c.status === 'REVIEW').length,
        RESOLVED: cases.filter(c => c.status === 'RESOLVED').length,
        ARCHIVED: cases.filter(c => c.status === 'ARCHIVED').length
      };

      // Priority Cases with evidence & hypothesis counts
      const priorityCases = cases.slice(0, 5).map(c => {
        const cEvCount = evidence.filter(e => String(e.caseId) === String(c._id)).length;
        const cHypCount = hypotheses.filter(h => String(h.caseId) === String(c._id)).length;
        return {
          _id: c._id,
          title: c.title,
          description: c.description,
          status: c.status,
          priority: c.status === 'INVESTIGATING' ? 'HIGH' : c.status === 'REVIEW' ? 'CRITICAL' : 'NORMAL',
          evidenceCount: cEvCount,
          hypothesisCount: cHypCount,
          updatedAt: c.updatedAt || c.createdAt
        };
      });

      return res.json({
        success: true,
        data: {
          metrics: {
            totalCases,
            activeInvestigations,
            casesUnderReview,
            resolvedCases,
            totalEvidence,
            verifiedEvidence,
            unverifiedEvidence,
            disputedEvidence,
            rejectedEvidence,
            activeHypotheses
          },
          statusDistribution,
          priorityCases,
          recentActivity: recentLogs
        }
      });
    } else {
      // Memory Store Fallback
      const cases = memoryStore.cases || [];
      const evidence = memoryStore.evidence || [];
      const hypotheses = memoryStore.hypotheses || [];
      const auditLogs = memoryStore.auditLogs || [];

      const totalCases = cases.length;
      const activeInvestigations = cases.filter(c => c.status === 'INVESTIGATING' || c.status === 'OPEN').length;
      const casesUnderReview = cases.filter(c => c.status === 'REVIEW').length;
      const resolvedCases = cases.filter(c => c.status === 'RESOLVED' || c.status === 'ARCHIVED').length;

      const totalEvidence = evidence.length;
      const verifiedEvidence = evidence.filter(e => e.verificationState === 'VERIFIED').length;
      const unverifiedEvidence = evidence.filter(e => e.verificationState === 'UNVERIFIED').length;
      const disputedEvidence = evidence.filter(e => e.verificationState === 'DISPUTED').length;
      const rejectedEvidence = evidence.filter(e => e.verificationState === 'REJECTED').length;

      const activeHypotheses = hypotheses.length;

      const statusDistribution = {
        DRAFT: cases.filter(c => c.status === 'DRAFT').length,
        OPEN: cases.filter(c => c.status === 'OPEN').length,
        INVESTIGATING: cases.filter(c => c.status === 'INVESTIGATING').length,
        REVIEW: cases.filter(c => c.status === 'REVIEW').length,
        RESOLVED: cases.filter(c => c.status === 'RESOLVED').length,
        ARCHIVED: cases.filter(c => c.status === 'ARCHIVED').length
      };

      const priorityCases = cases.slice(0, 5).map(c => {
        const cEvCount = evidence.filter(e => String(e.caseId) === String(c._id)).length;
        const cHypCount = hypotheses.filter(h => String(h.caseId) === String(c._id)).length;
        return {
          _id: c._id,
          title: c.title,
          description: c.description,
          status: c.status,
          priority: c.status === 'INVESTIGATING' ? 'HIGH' : c.status === 'REVIEW' ? 'CRITICAL' : 'NORMAL',
          evidenceCount: cEvCount,
          hypothesisCount: cHypCount,
          updatedAt: c.updatedAt || c.createdAt
        };
      });

      const recentActivity = auditLogs.slice(0, 10);

      return res.json({
        success: true,
        data: {
          metrics: {
            totalCases,
            activeInvestigations,
            casesUnderReview,
            resolvedCases,
            totalEvidence,
            verifiedEvidence,
            unverifiedEvidence,
            disputedEvidence,
            rejectedEvidence,
            activeHypotheses
          },
          statusDistribution,
          priorityCases,
          recentActivity
        }
      });
    }
  } catch (err) {
    console.error('Error fetching dashboard statistics:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;
