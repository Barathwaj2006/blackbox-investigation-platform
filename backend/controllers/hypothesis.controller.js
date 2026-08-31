const mongoose = require('mongoose');
const Hypothesis = require('../models/Hypothesis');
const EvidenceRelationship = require('../models/EvidenceRelationship');
const logAudit = require('../utils/auditLogger');
const { calculateHypothesisScore } = require('../utils/scoringEngine');
const { memoryStore, recalculateScoreInMemory } = require('../utils/memoryStore');

exports.getHypothesesForCase = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const hyp = memoryStore.hypotheses.filter(h => h.caseId === req.params.caseId).sort((a, b) => b.score - a.score);
      return res.json({ success: true, data: hyp });
    }
    const hypotheses = await Hypothesis.find({ caseId: req.params.caseId })
      .populate('createdBy', 'name username')
      .sort({ score: -1 });
    res.json({ success: true, data: hypotheses });
  } catch (err) {
    next(err);
  }
};

exports.createHypothesis = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const newHyp = {
        _id: 'hyp_' + Date.now(),
        caseId: req.params.caseId,
        ...req.body,
        score: 0,
        explainability: [],
        createdBy: { _id: req.user?._id || 'u_investigator', name: req.user?.name || 'Investigator', username: req.user?.username || 'investigator' },
        createdAt: new Date().toISOString()
      };
      memoryStore.hypotheses.push(newHyp);
      await logAudit(req.user?._id || 'u_investigator', 'CREATE_HYPOTHESIS', 'Hypothesis', newHyp._id, { title: newHyp.title, caseId: newHyp.caseId });
      return res.status(201).json({ success: true, data: newHyp });
    }
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
    if (mongoose.connection.readyState !== 1) {
      const existing = memoryStore.relationships.find(r => r.hypothesisId === req.params.id && r.evidenceId === evidenceId);
      if (existing) {
        return res.status(400).json({ success: false, error: 'Relationship already exists for this evidence and hypothesis.' });
      }
      const targetHyp = memoryStore.hypotheses.find(h => h._id === req.params.id);
      const caseId = targetHyp ? targetHyp.caseId : undefined;
      const newRel = {
        _id: 'rel_' + Date.now(),
        hypothesisId: req.params.id,
        evidenceId,
        type,
        strength: Number(strength) || 5,
        caseId,
        createdBy: req.user?._id || 'u_investigator'
      };
      memoryStore.relationships.push(newRel);
      const updatedHyp = recalculateScoreInMemory(req.params.id);
      await logAudit(req.user?._id || 'u_investigator', 'ADD_EVIDENCE_RELATIONSHIP', 'EvidenceRelationship', newRel._id, { 
        hypothesisId: req.params.id, 
        evidenceId, 
        type, 
        strength,
        caseId
      });
      return res.status(201).json({ success: true, data: updatedHyp });
    }
    const hypothesis = await Hypothesis.findById(req.params.id);
    const caseId = hypothesis ? hypothesis.caseId : undefined;

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
      strength,
      caseId
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
    if (mongoose.connection.readyState !== 1) {
      const rels = memoryStore.relationships.filter(r => r.hypothesisId === req.params.id);
      const populated = rels.map(r => ({
        ...r,
        evidenceId: memoryStore.evidence.find(e => e._id === r.evidenceId) || null
      }));
      return res.json({ success: true, data: populated });
    }
    const relationships = await EvidenceRelationship.find({ hypothesisId: req.params.id })
      .populate('evidenceId');
    res.json({ success: true, data: relationships });
  } catch (err) {
    next(err);
  }
};

exports.getRelationshipsForCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    if (mongoose.connection.readyState !== 1) {
      const caseHypotheses = memoryStore.hypotheses.filter(h => String(h.caseId) === String(caseId));
      const hypIds = caseHypotheses.map(h => h._id);
      const rels = memoryStore.relationships.filter(r => hypIds.includes(r.hypothesisId));
      return res.json({ success: true, data: rels });
    }
    const hypotheses = await Hypothesis.find({ caseId }).select('_id');
    const hypIds = hypotheses.map(h => h._id);
    const relationships = await EvidenceRelationship.find({ hypothesisId: { $in: hypIds } });
    res.json({ success: true, data: relationships });
  } catch (err) {
    next(err);
  }
};
