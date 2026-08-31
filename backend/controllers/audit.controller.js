const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const { memoryStore } = require('../utils/memoryStore');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const search = req.query.search ? req.query.search.trim() : '';
    const action = req.query.action ? req.query.action.trim() : '';
    const entityType = req.query.entityType ? req.query.entityType.trim() : '';
    const caseId = req.query.caseId ? req.query.caseId.trim() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;

    if (mongoose.connection.readyState !== 1) {
      let logs = [...(memoryStore.auditLogs || [])];

      if (caseId) {
        logs = logs.filter(l => 
          String(l.entityId) === String(caseId) || 
          (l.details && String(l.details.caseId) === String(caseId))
        );
      }

      if (action) {
        logs = logs.filter(l => l.action === action);
      }

      if (entityType) {
        logs = logs.filter(l => l.entityType === entityType);
      }

      if (search) {
        const s = search.toLowerCase();
        logs = logs.filter(l => {
          const userName = (l.user?.name || '').toLowerCase();
          const userUsername = (l.user?.username || '').toLowerCase();
          const act = (l.action || '').toLowerCase();
          const entity = (l.entityType || '').toLowerCase();
          const entityId = (l.entityId || '').toLowerCase();
          const detailsStr = JSON.stringify(l.details || {}).toLowerCase();
          return userName.includes(s) || userUsername.includes(s) || act.includes(s) || entity.includes(s) || entityId.includes(s) || detailsStr.includes(s);
        });
      }

      const total = logs.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginated = isPaginated ? logs.slice((page - 1) * limit, page * limit) : logs;

      return res.json({
        success: true,
        data: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    }

    const query = {};

    if (caseId) {
      query.$or = [
        { entityId: caseId },
        { 'details.caseId': caseId }
      ];
    }

    if (action) {
      query.action = action;
    }

    if (entityType) {
      query.entityType = entityType;
    }

    if (search) {
      const searchConditions = [
        { action: { $regex: search, $options: 'i' } },
        { entityType: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } }
      ];
      query.$or = query.$or ? [...query.$or, ...searchConditions] : searchConditions;
    }

    const total = await AuditLog.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    let queryBuilder = AuditLog.find(query)
      .populate('user', 'name username role')
      .sort({ createdAt: -1 });

    if (isPaginated) {
      queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
    }

    const logs = await queryBuilder.exec();

    // Secondary filter for user name/username search if needed
    let filteredLogs = logs;
    if (search) {
      const s = search.toLowerCase();
      filteredLogs = logs.filter(l => {
        const u = l.user;
        const matchesUser = u && ((u.name && u.name.toLowerCase().includes(s)) || (u.username && u.username.toLowerCase().includes(s)));
        const matchesAction = l.action && l.action.toLowerCase().includes(s);
        const matchesEntity = l.entityType && l.entityType.toLowerCase().includes(s);
        const matchesDetails = JSON.stringify(l.details || {}).toLowerCase().includes(s);
        return matchesUser || matchesAction || matchesEntity || matchesDetails;
      });
    }

    res.json({
      success: true,
      data: filteredLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
};
