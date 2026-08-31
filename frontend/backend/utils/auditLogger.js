const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, action, entityType, entityId, details = {}) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      entityType,
      entityId,
      details
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

module.exports = logAudit;
