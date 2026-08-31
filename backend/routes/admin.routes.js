const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Case = require('../models/Case');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');
const { memoryStore } = require('../utils/memoryStore');

// GET /api/admin/users
router.get('/users', protect, authorize('Admin'), async (req, res, next) => {
  try {
    const search = req.query.search ? req.query.search.trim().toLowerCase() : '';
    const role = req.query.role ? req.query.role.trim() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (role) query.role = role;
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ];
      }

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Enrich with case and activity counts
      const enriched = await Promise.all(users.map(async u => {
        const [caseCount, activityCount] = await Promise.all([
          Case.countDocuments({ createdBy: u._id }),
          AuditLog.countDocuments({ user: u._id })
        ]);
        return {
          ...u,
          status: 'Active',
          caseCount,
          activityCount
        };
      }));

      return res.json({
        success: true,
        data: enriched,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1
        }
      });
    } else {
      // MemoryStore fallback
      let users = memoryStore.users.map(u => {
        const caseCount = (memoryStore.cases || []).filter(c => c.createdBy?._id === u._id || c.createdBy?.username === u.username).length;
        const activityCount = (memoryStore.auditLogs || []).filter(l => l.user?.username === u.username).length;
        return {
          _id: u._id,
          username: u.username,
          name: u.name,
          role: u.role,
          status: 'Active',
          createdAt: u.createdAt || new Date().toISOString(),
          caseCount,
          activityCount
        };
      });

      if (role) {
        users = users.filter(u => u.role.toLowerCase() === role.toLowerCase());
      }
      if (search) {
        users = users.filter(u => u.username.toLowerCase().includes(search) || u.name.toLowerCase().includes(search));
      }

      const total = users.length;
      const paginated = users.slice((page - 1) * limit, page * limit);

      return res.json({
        success: true,
        data: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/case-monitoring
router.get('/case-monitoring', protect, authorize('Admin'), async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const [cases, recentAudit] = await Promise.all([
        Case.find().populate('createdBy', 'name username').sort({ updatedAt: -1 }).lean(),
        AuditLog.find().populate('user', 'name username role').sort({ createdAt: -1 }).limit(10).lean()
      ]);

      const totalCases = cases.length;
      const activeCases = cases.filter(c => ['OPEN', 'INVESTIGATING', 'REVIEW'].includes(c.status)).length;
      
      const statusCounts = {
        DRAFT: cases.filter(c => c.status === 'DRAFT').length,
        OPEN: cases.filter(c => c.status === 'OPEN').length,
        INVESTIGATING: cases.filter(c => c.status === 'INVESTIGATING').length,
        REVIEW: cases.filter(c => c.status === 'REVIEW').length,
        RESOLVED: cases.filter(c => c.status === 'RESOLVED').length,
        ARCHIVED: cases.filter(c => c.status === 'ARCHIVED').length
      };

      const highPriorityCases = cases
        .filter(c => ['INVESTIGATING', 'REVIEW'].includes(c.status))
        .slice(0, 5)
        .map(c => ({
          _id: c._id,
          title: c.title,
          status: c.status,
          priority: c.status === 'REVIEW' ? 'CRITICAL' : 'HIGH',
          createdBy: c.createdBy?.name || 'Unknown',
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        }));

      return res.json({
        success: true,
        data: {
          totalCases,
          activeCases,
          statusCounts,
          highPriorityCases,
          recentActivity: recentAudit
        }
      });
    } else {
      const cases = memoryStore.cases || [];
      const recentAudit = (memoryStore.auditLogs || []).slice(0, 10);

      const totalCases = cases.length;
      const activeCases = cases.filter(c => ['OPEN', 'INVESTIGATING', 'REVIEW'].includes(c.status)).length;

      const statusCounts = {
        DRAFT: cases.filter(c => c.status === 'DRAFT').length,
        OPEN: cases.filter(c => c.status === 'OPEN').length,
        INVESTIGATING: cases.filter(c => c.status === 'INVESTIGATING').length,
        REVIEW: cases.filter(c => c.status === 'REVIEW').length,
        RESOLVED: cases.filter(c => c.status === 'RESOLVED').length,
        ARCHIVED: cases.filter(c => c.status === 'ARCHIVED').length
      };

      const highPriorityCases = cases
        .filter(c => ['INVESTIGATING', 'REVIEW'].includes(c.status))
        .slice(0, 5)
        .map(c => ({
          _id: c._id,
          title: c.title,
          status: c.status,
          priority: c.status === 'REVIEW' ? 'CRITICAL' : 'HIGH',
          createdBy: c.createdBy?.name || 'Unknown',
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        }));

      return res.json({
        success: true,
        data: {
          totalCases,
          activeCases,
          statusCounts,
          highPriorityCases,
          recentActivity: recentAudit
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
