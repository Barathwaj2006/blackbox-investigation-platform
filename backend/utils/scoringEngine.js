const Hypothesis = require('../models/Hypothesis');
const EvidenceRelationship = require('../models/EvidenceRelationship');
const Evidence = require('../models/Evidence');
const ScoreHistory = require('../models/ScoreHistory');

const computeScore = (relationships = []) => {
  let score = 0;
  const explainability = [];

  for (const rel of relationships) {
    const evidence = rel.evidenceId || rel.evidence;
    if (!evidence) continue;

    const confScore = evidence.confidenceScore !== undefined ? evidence.confidenceScore : 50;
    const base = (Number(rel.strength) || 5) * (confScore / 100);
    let multiplier = 0.5;
    
    switch (evidence.verificationState) {
      case 'VERIFIED': multiplier = 1.0; break;
      case 'UNVERIFIED': multiplier = 0.5; break;
      case 'DISPUTED': multiplier = 0.2; break;
      case 'REJECTED': multiplier = 0.0; break;
      default: multiplier = 0.5; break;
    }

    const value = base * multiplier;
    
    if (rel.type === 'SUPPORT') {
      score += value;
      explainability.push(`+${value.toFixed(2)}: Evidence '${evidence.title || 'Untitled'}' supports (strength ${rel.strength}, confidence ${confScore}%, state ${evidence.verificationState || 'UNVERIFIED'})`);
    } else {
      score -= value;
      explainability.push(`-${value.toFixed(2)}: Evidence '${evidence.title || 'Untitled'}' contradicts (strength ${rel.strength}, confidence ${confScore}%, state ${evidence.verificationState || 'UNVERIFIED'})`);
    }
  }

  return { score: Number(score.toFixed(2)), explainability };
};

const calculateHypothesisScore = async (hypothesisId, triggerInfo = {}, actor = null) => {
  const relationships = await EvidenceRelationship.find({ hypothesisId }).populate('evidenceId');
  const { score, explainability } = computeScore(relationships);

  const hypothesis = await Hypothesis.findById(hypothesisId);
  if (hypothesis) {
    const previousScore = Number(hypothesis.score || 0);
    hypothesis.score = score;
    hypothesis.explainability = explainability;
    await hypothesis.save();

    const delta = Number((score - previousScore).toFixed(2));

    // Record score history if delta is non-zero or explicitly requested
    if (triggerInfo.forceRecord || Math.abs(delta) > 0.001 || triggerInfo.triggerType) {
      try {
        await ScoreHistory.create({
          caseId: hypothesis.caseId,
          hypothesisId: hypothesis._id,
          previousScore,
          newScore: score,
          delta,
          triggerType: triggerInfo.triggerType || 'MANUAL_RECALC',
          triggerEntityId: triggerInfo.triggerEntityId || null,
          triggerDetails: triggerInfo.triggerDetails || {},
          actor: actor ? {
            _id: actor._id,
            name: actor.name,
            username: actor.username,
            role: actor.role
          } : { name: 'Investigator', username: 'investigator', role: 'Investigator' },
          timestamp: new Date()
        });
      } catch (histErr) {
        console.warn('Error saving ScoreHistory:', histErr.message);
      }
    }

    return hypothesis;
  }

  return { _id: hypothesisId, score, explainability };
};

const updateScoresForEvidence = async (evidenceId, triggerInfo = {}, actor = null) => {
  const relationships = await EvidenceRelationship.find({ evidenceId });
  const hypothesisIds = [...new Set(relationships.map(r => r.hypothesisId.toString()))];
  for (const hId of hypothesisIds) {
    await calculateHypothesisScore(hId, triggerInfo, actor);
  }
};

module.exports = {
  computeScore,
  calculateHypothesisScore,
  updateScoresForEvidence
};


