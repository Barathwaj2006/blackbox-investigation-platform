const Hypothesis = require('../models/Hypothesis');
const EvidenceRelationship = require('../models/EvidenceRelationship');
const Evidence = require('../models/Evidence');

const calculateHypothesisScore = async (hypothesisId) => {
  const relationships = await EvidenceRelationship.find({ hypothesisId }).populate('evidenceId');
  
  let score = 0;
  const explainability = [];

  for (const rel of relationships) {
    const evidence = rel.evidenceId;
    if (!evidence) continue;

    const base = rel.strength * (evidence.confidenceScore / 100);
    let multiplier = 0;
    
    switch (evidence.verificationState) {
      case 'VERIFIED': multiplier = 1.0; break;
      case 'UNVERIFIED': multiplier = 0.5; break;
      case 'DISPUTED': multiplier = 0.2; break;
      case 'REJECTED': multiplier = 0.0; break;
    }

    const value = base * multiplier;
    
    if (rel.type === 'SUPPORT') {
      score += value;
      explainability.push(`+${value.toFixed(2)}: Evidence '${evidence.title}' supports (strength ${rel.strength}, confidence ${evidence.confidenceScore}%, state ${evidence.verificationState})`);
    } else {
      score -= value;
      explainability.push(`-${value.toFixed(2)}: Evidence '${evidence.title}' contradicts (strength ${rel.strength}, confidence ${evidence.confidenceScore}%, state ${evidence.verificationState})`);
    }
  }

  const hypothesis = await Hypothesis.findById(hypothesisId);
  hypothesis.score = score;
  hypothesis.explainability = explainability;
  await hypothesis.save();

  return hypothesis;
};

const updateScoresForEvidence = async (evidenceId) => {
  const relationships = await EvidenceRelationship.find({ evidenceId });
  const hypothesisIds = [...new Set(relationships.map(r => r.hypothesisId.toString()))];
  for (const hId of hypothesisIds) {
    await calculateHypothesisScore(hId);
  }
};

module.exports = {
  calculateHypothesisScore,
  updateScoresForEvidence
};
