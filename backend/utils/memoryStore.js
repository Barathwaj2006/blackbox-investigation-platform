const memoryStore = {
  users: [
    { _id: 'u_admin', username: 'admin', password: 'demo', name: 'Admin', role: 'Admin' },
    { _id: 'u_investigator', username: 'investigator', password: 'demo', name: 'Investigator', role: 'Investigator' },
    { _id: 'u_reviewer', username: 'reviewer', password: 'demo', name: 'Reviewer', role: 'Reviewer' }
  ],
  cases: [
    {
      _id: 'case_1',
      title: 'Operation Phantom',
      description: 'Sample digital evidence case for cyber incident analysis',
      status: 'INVESTIGATING',
      assignedTo: [{ _id: 'u_investigator', name: 'Investigator', username: 'investigator' }],
      createdBy: { _id: 'u_admin', name: 'Admin', username: 'admin' },
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ],
  evidence: [
    {
      _id: 'ev_1',
      caseId: 'case_1',
      title: 'Server Access Logs',
      type: 'Digital',
      verificationState: 'VERIFIED',
      confidenceScore: 90,
      uploadedBy: { _id: 'u_investigator', name: 'Investigator', username: 'investigator' },
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    }
  ],
  hypotheses: [
    {
      _id: 'hyp_1',
      caseId: 'case_1',
      title: 'External Attack Vector',
      score: 7.2,
      explainability: ["+7.20: Evidence 'Server Access Logs' supports (strength 8, confidence 90%, state VERIFIED)"],
      createdBy: { _id: 'u_investigator', name: 'Investigator', username: 'investigator' },
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  ],
  relationships: [
    {
      _id: 'rel_1',
      hypothesisId: 'hyp_1',
      evidenceId: 'ev_1',
      type: 'SUPPORT',
      strength: 8,
      caseId: 'case_1',
      createdBy: 'u_investigator'
    }
  ],
  scoreHistory: [
    {
      _id: 'sh_seed_1',
      caseId: 'case_1',
      hypothesisId: 'hyp_1',
      previousScore: 0,
      newScore: 3.6,
      delta: 3.6,
      triggerType: 'ADD_EVIDENCE_RELATIONSHIP',
      triggerEntityId: 'rel_1',
      triggerDetails: {
        evidenceId: 'ev_1',
        evidenceTitle: 'Server Access Logs',
        verificationState: 'UNVERIFIED',
        relationshipType: 'SUPPORT',
        relationshipStrength: 8,
        description: 'Linked Server Access Logs (strength 8, state UNVERIFIED)'
      },
      actor: { name: 'Investigator', username: 'investigator', role: 'Investigator' },
      timestamp: new Date(Date.now() - 3600000 * 10).toISOString()
    },
    {
      _id: 'sh_seed_2',
      caseId: 'case_1',
      hypothesisId: 'hyp_1',
      previousScore: 3.6,
      newScore: 7.2,
      delta: 3.6,
      triggerType: 'VERIFY_EVIDENCE',
      triggerEntityId: 'ev_1',
      triggerDetails: {
        evidenceId: 'ev_1',
        evidenceTitle: 'Server Access Logs',
        verificationState: 'VERIFIED',
        relationshipType: 'SUPPORT',
        relationshipStrength: 8,
        description: 'Evidence verification upgraded from UNVERIFIED (0.5x) to VERIFIED (1.0x)'
      },
      actor: { name: 'Reviewer', username: 'reviewer', role: 'Reviewer' },
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  auditLogs: [
    {
      _id: 'log_1',
      user: { name: 'Admin', username: 'admin', role: 'Admin' },
      action: 'CREATE_CASE',
      entityType: 'Case',
      entityId: 'case_1',
      details: { title: 'Operation Phantom' },
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      _id: 'log_2',
      user: { name: 'Investigator', username: 'investigator', role: 'Investigator' },
      action: 'ADD_EVIDENCE',
      entityType: 'Evidence',
      entityId: 'ev_1',
      details: { title: 'Server Access Logs', caseId: 'case_1' },
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    }
  ]
};

function recalculateScoreInMemory(hypothesisId, triggerInfo = {}, actor = null) {
  const hyp = memoryStore.hypotheses.find(h => String(h._id) === String(hypothesisId));
  if (!hyp) return null;

  const previousScore = Number(hyp.score || 0);
  const rels = memoryStore.relationships.filter(r => String(r.hypothesisId) === String(hypothesisId));
  let score = 0;
  const explainability = [];

  for (const rel of rels) {
    const evidence = memoryStore.evidence.find(e => String(e._id) === String(rel.evidenceId));
    if (!evidence) continue;
    const base = (Number(rel.strength) || 5) * ((evidence.confidenceScore !== undefined ? evidence.confidenceScore : 50) / 100);
    let multiplier = 0.5;
    switch (evidence.verificationState) {
      case 'VERIFIED': multiplier = 1.0; break;
      case 'UNVERIFIED': multiplier = 0.5; break;
      case 'DISPUTED': multiplier = 0.2; break;
      case 'REJECTED': multiplier = 0.0; break;
    }
    const val = base * multiplier;
    if (rel.type === 'SUPPORT') {
      score += val;
      explainability.push(`+${val.toFixed(2)}: Evidence '${evidence.title}' supports (strength ${rel.strength}, confidence ${evidence.confidenceScore}%, state ${evidence.verificationState})`);
    } else {
      score -= val;
      explainability.push(`-${val.toFixed(2)}: Evidence '${evidence.title}' contradicts (strength ${rel.strength}, confidence ${evidence.confidenceScore}%, state ${evidence.verificationState})`);
    }
  }

  const newScore = Number(score.toFixed(2));
  hyp.score = newScore;
  hyp.explainability = explainability;

  const delta = Number((newScore - previousScore).toFixed(2));

  // Persist history if there is a change or an explicit trigger
  if (triggerInfo.forceRecord || Math.abs(delta) > 0.001 || triggerInfo.triggerType) {
    const historyEntry = {
      _id: 'sh_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      caseId: hyp.caseId,
      hypothesisId: hyp._id,
      previousScore,
      newScore,
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
      timestamp: new Date().toISOString()
    };

    if (!memoryStore.scoreHistory) memoryStore.scoreHistory = [];
    memoryStore.scoreHistory.unshift(historyEntry);
  }

  return hyp;
}

module.exports = {
  memoryStore,
  recalculateScoreInMemory
};
