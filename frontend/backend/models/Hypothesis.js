const mongoose = require('mongoose');

const hypothesisSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  explainability: [{ type: String }] // Array of strings explaining how the score was calculated
}, { timestamps: true });

module.exports = mongoose.model('Hypothesis', hypothesisSchema);
