const Evidence = require('../models/Evidence');
const logAudit = require('../utils/auditLogger');
const { updateScoresForEvidence } = require('../utils/scoringEngine');

exports.getEvidenceForCase = async (req, res, next) => {
  try {
    const evidence = await Evidence.find({ caseId: req.params.caseId }).populate('uploadedBy', 'name username').sort({ createdAt: -1 });
    res.json({ success: true, data: evidence });
  } catch (err) {
    next(err);
  }
};

exports.addEvidence = async (req, res, next) => {
  try {
    const evidence = await Evidence.create({
      ...req.body,
      caseId: req.params.caseId,
      uploadedBy: req.user._id
    });
    await logAudit(req.user._id, 'ADD_EVIDENCE', 'Evidence', evidence._id, { title: evidence.title, caseId: evidence.caseId });
    res.status(201).json({ success: true, data: evidence });
  } catch (err) {
    next(err);
  }
};

exports.verifyEvidence = async (req, res, next) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    if (!evidence) return res.status(404).json({ success: false, error: 'Evidence not found' });

    const oldState = evidence.verificationState;
    evidence.verificationState = req.body.verificationState;
    if (req.body.confidenceScore !== undefined) {
      evidence.confidenceScore = req.body.confidenceScore;
    }
    
    await evidence.save();
    await logAudit(req.user._id, 'VERIFY_EVIDENCE', 'Evidence', evidence._id, { oldState, newState: evidence.verificationState });
    
    // Update hypothesis scores affected by this evidence
    await updateScoresForEvidence(evidence._id);
    
    res.json({ success: true, data: evidence });
  } catch (err) {
    next(err);
  }
};
