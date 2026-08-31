const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const { memoryStore } = require('./memoryStore');

const logAudit = async (userId, action, entityType, entityId, details = {}) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await AuditLog.create({
        user: userId,
        action,
        entityType,
        entityId,
        details
      });
    } else {
      const userObj = memoryStore.users.find(u => u._id === String(userId)) || { name: 'User', username: 'user', role: 'Investigator' };
      memoryStore.auditLogs.unshift({
        _id: 'log_' + Date.now(),
        user: { name: userObj.name, username: userObj.username, role: userObj.role },
        action,
        entityType,
        entityId,
        details,
        createdAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

module.exports = logAudit;
