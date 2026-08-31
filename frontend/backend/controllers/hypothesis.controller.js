const Hypothesis = require('../models/Hypothesis');
const EvidenceRelationship = require('../models/EvidenceRelationship');
const logAudit = require('../utils/auditLogger');
const { calculateHypothesisScore } = require('../utils/scoringEngine');

exports.getHypothesesForCase = async (req, res, next) => {
  try {
    const hypotheses = await Hypothesis.find({ caseId: req.params.caseId })
      .populate('createdBy', 'name username')
      .sort({ score: -1 }); // Sort by score descending
    res.json({ success: true, data: hypotheses });
  } catch (err) {
    next(err);
  }
};

exports.createHypothesis = async (req, res, next) => {
  try {
    const hypothesis = await Hypothesis.create({
      ...req.body,
      caseId: req.params.caseId,
      createdBy: req.user._id
    });
    await logAudit(req.user._id, 'CREATE_HYPOTHESIS', 'Hypothesis', hypothesis._id, { title: hypothesis.title, caseId: hypothesis.caseId });
    res.status(201).json({ success: true, data: hypothesis });
  } catch (err) {
    next(err);
  }
};

exports.addRelationship = async (req, res, next) => {
  try {
    const { evidenceId, type, strength } = req.body;
    const relationship = await EvidenceRelationship.create({
      hypothesisId: req.params.id,
      evidenceId,
      type,
      strength,
      createdBy: req.user._id
    });
    
    await logAudit(req.user._id, 'ADD_EVIDENCE_RELATIONSHIP', 'EvidenceRelationship', relationship._id, { 
      hypothesisId: req.params.id, 
      evidenceId, 
      type, 
      strength 
    });

    const updatedHypothesis = await calculateHypothesisScore(req.params.id);
    
    res.status(201).json({ success: true, data: updatedHypothesis });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Relationship already exists for this evidence and hypothesis.' });
    }
    next(err);
  }
};

exports.getRelationships = async (req, res, next) => {
  try {
    const relationships = await EvidenceRelationship.find({ hypothesisId: req.params.id })
      .populate('evidenceId');
    res.json({ success: true, data: relationships });
  } catch (err) {
    next(err);
  }
};
