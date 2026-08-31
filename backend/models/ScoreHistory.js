const mongoose = require('mongoose');

const scoreHistorySchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  hypothesisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hypothesis', required: true },
  previousScore: { type: Number, required: true },
  newScore: { type: Number, required: true },
  delta: { type: Number, required: true },
  triggerType: { 
    type: String, 
    enum: [
      'VERIFY_EVIDENCE', 
      'DISPUTE_EVIDENCE',
      'REJECT_EVIDENCE',
      'ADD_EVIDENCE_RELATIONSHIP', 
      'UPDATE_EVIDENCE_RELATIONSHIP', 
      'DELETE_EVIDENCE_RELATIONSHIP', 
      'MANUAL_RECALC', 
      'INIT'
    ], 
    required: true 
  },
  triggerEntityId: { type: mongoose.Schema.Types.Mixed },
  triggerDetails: {
    evidenceId: { type: mongoose.Schema.Types.Mixed },
    evidenceTitle: { type: String },
    verificationState: { type: String },
    relationshipType: { type: String }, // 'SUPPORT' or 'CONTRADICT'
    relationshipStrength: { type: Number },
    description: { type: String }
  },
  actor: {
    _id: { type: mongoose.Schema.Types.Mixed },
    name: { type: String },
    username: { type: String },
    role: { type: String }
  },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

scoreHistorySchema.index({ caseId: 1, timestamp: -1 });
scoreHistorySchema.index({ hypothesisId: 1, timestamp: -1 });

module.exports = mongoose.model('ScoreHistory', scoreHistorySchema);
