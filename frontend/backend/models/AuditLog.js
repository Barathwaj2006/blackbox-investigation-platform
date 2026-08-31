const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true }, // e.g., 'Case', 'Evidence', 'Hypothesis'
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
