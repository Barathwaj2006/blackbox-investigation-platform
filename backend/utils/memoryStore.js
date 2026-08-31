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
      createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
    }
  ],
  relationships: [
    {
      _id: 'rel_1',
      hypothesisId: 'hyp_1',
      evidenceId: 'ev_1',
      type: 'SUPPORT',
      strength: 8,
      createdBy: 'u_investigator'
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
      createdAt: new Date().toISOString()
    },
    {
      _id: 'log_2',
      user: { name: 'Investigator', username: 'investigator', role: 'Investigator' },
      action: 'ADD_EVIDENCE',
      entityType: 'Evidence',
      entityId: 'ev_1',
      details: { title: 'Server Access Logs', caseId: 'case_1' },
      createdAt: new Date().toISOString()
    }
  ]
};

function recalculateScoreInMemory(hypothesisId) {
  const rels = memoryStore.relationships.filter(r => r.hypothesisId === hypothesisId);
  let score = 0;
  const explainability = [];
  for (const rel of rels) {
    const evidence = memoryStore.evidence.find(e => e._id === rel.evidenceId);
    if (!evidence) continue;
    const base = rel.strength * (evidence.confidenceScore / 100);
    let multiplier = 0;
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
  const hyp = memoryStore.hypotheses.find(h => h._id === hypothesisId);
  if (hyp) {
    hyp.score = score;
    hyp.explainability = explainability;
  }
  return hyp;
}

module.exports = {
  memoryStore,
  recalculateScoreInMemory
};
