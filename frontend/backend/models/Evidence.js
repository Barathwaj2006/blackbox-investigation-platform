const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['Document', 'Image', 'Audio', 'Video', 'Digital', 'Physical', 'Other'], default: 'Other' },
  verificationState: {
    type: String,
    enum: ['UNVERIFIED', 'VERIFIED', 'DISPUTED', 'REJECTED'],
    default: 'UNVERIFIED'
  },
  confidenceScore: { type: Number, min: 0, max: 100, default: 50 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Evidence', evidenceSchema);
