const mongoose = require('mongoose');

const evidenceRelationshipSchema = new mongoose.Schema({
  hypothesisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hypothesis', required: true },
  evidenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evidence', required: true },
  type: { type: String, enum: ['SUPPORT', 'CONTRADICT'], required: true },
  strength: { type: Number, min: 1, max: 10, default: 5 }, // 1 is weak, 10 is strong
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Prevent duplicate relationships between same evidence and hypothesis
evidenceRelationshipSchema.index({ hypothesisId: 1, evidenceId: 1 }, { unique: true });

module.exports = mongoose.model('EvidenceRelationship', evidenceRelationshipSchema);
