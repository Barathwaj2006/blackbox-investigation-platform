const mongoose = require('mongoose');
const Hypothesis = require('../models/Hypothesis');
const EvidenceRelationship = require('../models/EvidenceRelationship');
const Evidence = require('../models/Evidence');
const ScoreHistory = require('../models/ScoreHistory');
const logAudit = require('../utils/auditLogger');
const { calculateHypothesisScore } = require('../utils/scoringEngine');
const { memoryStore, recalculateScoreInMemory } = require('../utils/memoryStore');

exports.getHypothesesForCase = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const hyp = memoryStore.hypotheses.filter(h => String(h.caseId) === String(req.params.caseId)).sort((a, b) => b.score - a.score);
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
      const existing = memoryStore.relationships.find(r => String(r.hypothesisId) === String(req.params.id) && String(r.evidenceId) === String(evidenceId));
      if (existing) {
        return res.status(400).json({ success: false, error: 'Relationship already exists for this evidence and hypothesis.' });
      }
      const targetHyp = memoryStore.hypotheses.find(h => String(h._id) === String(req.params.id));
      const caseId = targetHyp ? targetHyp.caseId : undefined;
      const targetEv = memoryStore.evidence.find(e => String(e._id) === String(evidenceId));
      
      const newRel = {
        _id: 'rel_' + Date.now(),
        hypothesisId: req.params.id,
        evidenceId,
        type: type || 'SUPPORT',
        strength: Number(strength) || 5,
        caseId,
        createdBy: req.user?._id || 'u_investigator'
      };
      memoryStore.relationships.push(newRel);

      const triggerInfo = {
        triggerType: 'ADD_EVIDENCE_RELATIONSHIP',
        triggerEntityId: newRel._id,
        triggerDetails: {
          evidenceId,
          evidenceTitle: targetEv ? targetEv.title : 'Evidence Item',
          verificationState: targetEv ? targetEv.verificationState : 'UNVERIFIED',
          relationshipType: newRel.type,
          relationshipStrength: newRel.strength,
          description: `Linked evidence '${targetEv ? targetEv.title : 'Evidence'}' as ${newRel.type} (strength ${newRel.strength})`
        },
        forceRecord: true
      };

      const updatedHyp = recalculateScoreInMemory(req.params.id, triggerInfo, req.user);
      await logAudit(req.user?._id || 'u_investigator', 'ADD_EVIDENCE_RELATIONSHIP', 'EvidenceRelationship', newRel._id, { 
        hypothesisId: req.params.id, 
        evidenceId, 
        type: newRel.type, 
        strength: newRel.strength,
        caseId
      });
      return res.status(201).json({ success: true, data: updatedHyp });
    }
    
    const hypothesis = await Hypothesis.findById(req.params.id);
    const caseId = hypothesis ? hypothesis.caseId : undefined;
    const evidence = await Evidence.findById(evidenceId);

    const relationship = await EvidenceRelationship.create({
      hypothesisId: req.params.id,
      evidenceId,
      type: type || 'SUPPORT',
      strength: Number(strength) || 5,
      createdBy: req.user._id
    });
    
    await logAudit(req.user._id, 'ADD_EVIDENCE_RELATIONSHIP', 'EvidenceRelationship', relationship._id, { 
      hypothesisId: req.params.id, 
      evidenceId, 
      type: relationship.type, 
      strength: relationship.strength,
      caseId
    });

    const triggerInfo = {
      triggerType: 'ADD_EVIDENCE_RELATIONSHIP',
      triggerEntityId: relationship._id,
      triggerDetails: {
        evidenceId,
        evidenceTitle: evidence ? evidence.title : 'Evidence Item',
        verificationState: evidence ? evidence.verificationState : 'UNVERIFIED',
        relationshipType: relationship.type,
        relationshipStrength: relationship.strength,
        description: `Linked evidence '${evidence ? evidence.title : 'Evidence'}' as ${relationship.type} (strength ${relationship.strength})`
      },
      forceRecord: true
    };

    const updatedHypothesis = await calculateHypothesisScore(req.params.id, triggerInfo, req.user);
    
    res.status(201).json({ success: true, data: updatedHypothesis });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Relationship already exists for this evidence and hypothesis.' });
    }
    next(err);
  }
};

exports.deleteRelationship = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryStore.relationships.findIndex(r => String(r._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, error: 'Relationship not found' });
      const rel = memoryStore.relationships[idx];
      memoryStore.relationships.splice(idx, 1);

      const targetEv = memoryStore.evidence.find(e => String(e._id) === String(rel.evidenceId));
      const triggerInfo = {
        triggerType: 'DELETE_EVIDENCE_RELATIONSHIP',
        triggerEntityId: rel._id,
        triggerDetails: {
          evidenceId: rel.evidenceId,
          evidenceTitle: targetEv ? targetEv.title : 'Evidence Item',
          relationshipType: rel.type,
          relationshipStrength: rel.strength,
          description: `Removed link to evidence '${targetEv ? targetEv.title : 'Evidence'}'`
        },
        forceRecord: true
      };

      const updatedHyp = recalculateScoreInMemory(rel.hypothesisId, triggerInfo, req.user);
      await logAudit(req.user?._id || 'u_investigator', 'DELETE_EVIDENCE_RELATIONSHIP', 'EvidenceRelationship', rel._id, {
        hypothesisId: rel.hypothesisId,
        evidenceId: rel.evidenceId
      });

      return res.json({ success: true, data: updatedHyp });
    }

    const relationship = await EvidenceRelationship.findById(id);
    if (!relationship) return res.status(404).json({ success: false, error: 'Relationship not found' });

    const hypothesisId = relationship.hypothesisId;
    const evidence = await Evidence.findById(relationship.evidenceId);

    await EvidenceRelationship.findByIdAndDelete(id);

    await logAudit(req.user._id, 'DELETE_EVIDENCE_RELATIONSHIP', 'EvidenceRelationship', id, {
      hypothesisId,
      evidenceId: relationship.evidenceId
    });

    const triggerInfo = {
      triggerType: 'DELETE_EVIDENCE_RELATIONSHIP',
      triggerEntityId: id,
      triggerDetails: {
        evidenceId: relationship.evidenceId,
        evidenceTitle: evidence ? evidence.title : 'Evidence Item',
        relationshipType: relationship.type,
        relationshipStrength: relationship.strength,
        description: `Removed link to evidence '${evidence ? evidence.title : 'Evidence'}'`
      },
      forceRecord: true
    };

    const updatedHypothesis = await calculateHypothesisScore(hypothesisId, triggerInfo, req.user);
    res.json({ success: true, data: updatedHypothesis });
  } catch (err) {
    next(err);
  }
};

exports.getRelationships = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const rels = memoryStore.relationships.filter(r => String(r.hypothesisId) === String(req.params.id));
      const populated = rels.map(r => ({
        ...r,
        evidenceId: memoryStore.evidence.find(e => String(e._id) === String(r.evidenceId)) || null
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
      const hypIds = caseHypotheses.map(h => String(h._id));
      const rels = memoryStore.relationships.filter(r => hypIds.includes(String(r.hypothesisId)));
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

exports.getScoreHistoryForCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    if (mongoose.connection.readyState !== 1) {
      const history = (memoryStore.scoreHistory || [])
        .filter(h => String(h.caseId) === String(caseId))
        .map(h => {
          const hyp = memoryStore.hypotheses.find(item => String(item._id) === String(h.hypothesisId));
          return {
            ...h,
            hypothesisTitle: hyp ? hyp.title : 'Hypothesis'
          };
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return res.json({ success: true, data: history });
    }

    const history = await ScoreHistory.find({ caseId })
      .populate('hypothesisId', 'title score')
      .sort({ timestamp: -1 })
      .limit(100);

    const formatted = history.map(h => ({
      _id: h._id,
      caseId: h.caseId,
      hypothesisId: h.hypothesisId?._id || h.hypothesisId,
      hypothesisTitle: h.hypothesisId?.title || 'Hypothesis',
      previousScore: h.previousScore,
      newScore: h.newScore,
      delta: h.delta,
      triggerType: h.triggerType,
      triggerEntityId: h.triggerEntityId,
      triggerDetails: h.triggerDetails,
      actor: h.actor,
      timestamp: h.timestamp
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

exports.getScoreHistoryForHypothesis = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState !== 1) {
      const history = (memoryStore.scoreHistory || [])
        .filter(h => String(h.hypothesisId) === String(id))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return res.json({ success: true, data: history });
    }

    const history = await ScoreHistory.find({ hypothesisId: id })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

exports.getIntelligenceSummary = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    
    let hypotheses = [];
    let evidence = [];
    let relationships = [];
    let scoreHistory = [];

    if (mongoose.connection.readyState !== 1) {
      hypotheses = memoryStore.hypotheses.filter(h => String(h.caseId) === String(caseId));
      evidence = memoryStore.evidence.filter(e => String(e.caseId) === String(caseId));
      const hypIds = hypotheses.map(h => String(h._id));
      relationships = memoryStore.relationships.filter(r => hypIds.includes(String(r.hypothesisId)));
      scoreHistory = (memoryStore.scoreHistory || []).filter(h => String(h.caseId) === String(caseId));
    } else {
      hypotheses = await Hypothesis.find({ caseId }).sort({ score: -1 });
      evidence = await Evidence.find({ caseId });
      const hypIds = hypotheses.map(h => h._id);
      relationships = await EvidenceRelationship.find({ hypothesisId: { $in: hypIds } });
      scoreHistory = await ScoreHistory.find({ caseId }).sort({ timestamp: -1 }).limit(20);
    }

    // Ranked leading hypothesis
    const sortedHypotheses = [...hypotheses].sort((a, b) => (b.score || 0) - (a.score || 0));
    const leading = sortedHypotheses[0] || null;

    // Largest positive & negative score movements in recent history
    let largestPositiveChange = null;
    let largestNegativeChange = null;

    for (const sh of scoreHistory) {
      const delta = Number(sh.delta || 0);
      if (delta > 0) {
        if (!largestPositiveChange || delta > largestPositiveChange.delta) {
          largestPositiveChange = sh;
        }
      } else if (delta < 0) {
        if (!largestNegativeChange || delta < largestNegativeChange.delta) {
          largestNegativeChange = sh;
        }
      }
    }

    // High impact evidence item (evidence linked to the most hypotheses or highest cumulative weight)
    const evidenceImpactMap = {};
    for (const rel of relationships) {
      const eId = String(rel.evidenceId?._id || rel.evidenceId);
      if (!evidenceImpactMap[eId]) {
        evidenceImpactMap[eId] = { evidenceId: eId, totalStrength: 0, linkCount: 0 };
      }
      evidenceImpactMap[eId].totalStrength += (rel.strength || 5);
      evidenceImpactMap[eId].linkCount += 1;
    }

    let topImpactId = null;
    let maxStrength = -1;
    for (const [eId, stat] of Object.entries(evidenceImpactMap)) {
      if (stat.totalStrength > maxStrength) {
        maxStrength = stat.totalStrength;
        topImpactId = eId;
      }
    }

    const highestImpactEvidence = topImpactId 
      ? evidence.find(e => String(e._id) === String(topImpactId))
      : null;

    const unverifiedCount = evidence.filter(e => !e.verificationState || e.verificationState === 'UNVERIFIED').length;
    const disputedCount = evidence.filter(e => e.verificationState === 'DISPUTED').length;
    const verifiedCount = evidence.filter(e => e.verificationState === 'VERIFIED').length;

    res.json({
      success: true,
      data: {
        leadingHypothesis: leading,
        largestPositiveChange,
        largestNegativeChange,
        highestImpactEvidence: highestImpactEvidence ? {
          _id: highestImpactEvidence._id,
          title: highestImpactEvidence.title,
          type: highestImpactEvidence.type,
          verificationState: highestImpactEvidence.verificationState,
          linkCount: topImpactId ? evidenceImpactMap[topImpactId]?.linkCount : 0
        } : null,
        counts: {
          totalEvidence: evidence.length,
          verifiedEvidence: verifiedCount,
          unverifiedEvidence: unverifiedCount,
          disputedEvidence: disputedCount,
          totalHypotheses: hypotheses.length,
          totalRelationships: relationships.length
        },
        recentScoreHistory: scoreHistory.slice(0, 10)
      }
    });
  } catch (err) {
    next(err);
  }
};

