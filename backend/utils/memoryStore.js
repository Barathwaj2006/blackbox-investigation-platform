const memoryStore = {
  users: [
    { _id: 'u_admin', username: 'admin', password: 'demo', name: 'Admin', role: 'Admin' },
    { _id: 'u_investigator', username: 'investigator', password: 'demo', name: 'Investigator', role: 'Investigator' },
    { _id: 'u_reviewer', username: 'reviewer', password: 'demo', name: 'Reviewer', role: 'Reviewer' }
  ],
  cases: [
    {
      _id: 'case_1',
      title: 'Incident 2026-Alpha: Cloud Ingress Breach',
      description: 'Forensic triage and causal hypothesis analysis into anomalous lateral credential access and data exfiltration.',
      status: 'INVESTIGATING',
      priority: 'HIGH',
      assignedTo: [{ _id: 'u_investigator', name: 'Investigator', username: 'investigator' }],
      createdBy: { _id: 'u_admin', name: 'Admin', username: 'admin' },
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      _id: 'case_2',
      title: 'Operation Phantom: Supply Chain Dependency Tampering',
      description: 'Investigation into unauthorized CI/CD pipeline build injections and rogue repository commits.',
      status: 'OPEN',
      priority: 'CRITICAL',
      assignedTo: [{ _id: 'u_investigator', name: 'Investigator', username: 'investigator' }],
      createdBy: { _id: 'u_admin', name: 'Admin', username: 'admin' },
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ],
  evidence: [
    {
      _id: 'ev_001',
      caseId: 'case_1',
      title: 'Auth0 Gateway Access Logs & Token Hashes',
      description: 'Authentication server logs recording multiple anomalous token exchanges from external VPN endpoints.',
      type: 'Digital',
      source: 'Identity Provider Gateway',
      verificationState: 'VERIFIED',
      confidenceScore: 92,
      fileHash: 'sha256:8f4c2e1b9a7d3f6e5c8b2a1d4e7f9a0c3b5d7e9f1a2c4e6b8d0f2a4c6e8b0d2f',
      uploadedBy: { _id: 'u_investigator', name: 'Investigator', username: 'investigator' },
      createdAt: new Date(Date.now() - 3600000 * 40).toISOString()
    },
    {
      _id: 'ev_002',
      caseId: 'case_1',
      title: 'Host Kernel Memory Core Dump',
      description: 'Volatile RAM extraction from primary database cluster node showing injected DLL payloads.',
      type: 'Forensic',
      source: 'Host EDR Agent',
      verificationState: 'VERIFIED',
      confidenceScore: 88,
      fileHash: 'sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      uploadedBy: { _id: 'u_investigator', name: 'Investigator', username: 'investigator' },
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
    },
    {
      _id: 'ev_003',
      caseId: 'case_1',
      title: 'Encrypted Staging Archive in /tmp/cache.dat',
      description: '7-Zip AES-256 archive discovered on staging server containing staged customer table fragments.',
      type: 'Digital',
      source: 'Server Filesystem Monitor',
      verificationState: 'UNVERIFIED',
      confidenceScore: 75,
      fileHash: 'sha256:9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b',
      uploadedBy: { _id: 'u_investigator', name: 'Investigator', username: 'investigator' },
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
    },
    {
      _id: 'ev_004',
      caseId: 'case_1',
      title: 'Outbound NetFlow PCAP Packet Trace',
      description: 'Egress traffic burst of 4.2 GB transmitted over port 443 to foreign hosting provider IP range.',
      type: 'Network',
      source: 'Border Firewall Sensor',
      verificationState: 'DISPUTED',
      confidenceScore: 65,
      fileHash: 'sha256:3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
      uploadedBy: { _id: 'u_investigator', name: 'Investigator', username: 'investigator' },
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      _id: 'ev_005',
      caseId: 'case_1',
      title: 'Threat Intel Bulletin: CozyShadow APT Indicators',
      description: 'CISA advisories matching registry persistence keys and TLS beaconing intervals.',
      type: 'Document',
      source: 'National Cyber Advisory',
      verificationState: 'VERIFIED',
      confidenceScore: 85,
      fileHash: 'sha256:5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
      uploadedBy: { _id: 'u_investigator', name: 'Investigator', username: 'investigator' },
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    {
      _id: 'ev_006',
      caseId: 'case_2',
      title: 'Git Commit Signature Audit Diff',
      description: 'Cryptographic commit verification failure for release build trigger script.',
      type: 'Digital',
      source: 'Version Control Auditor',
      verificationState: 'VERIFIED',
      confidenceScore: 95,
      uploadedBy: { _id: 'u_investigator', name: 'Investigator', username: 'investigator' },
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
  hypotheses: [
    {
      _id: 'hyp_001',
      caseId: 'case_1',
      title: 'State-Sponsored APT Infiltration (CozyShadow)',
      description: 'Persistent external threat actor leveraged stolen VPN credentials followed by kernel memory rootkit installation.',
      score: 13.79,
      explainability: [
        "+7.36: Evidence 'Auth0 Gateway Access Logs & Token Hashes' supports (strength 8, confidence 92%, state VERIFIED)",
        "+7.04: Evidence 'Host Kernel Memory Core Dump' supports (strength 8, confidence 88%, state VERIFIED)",
        "-0.61: Evidence 'Outbound NetFlow PCAP Packet Trace' contradicts (strength 7, confidence 65%, state DISPUTED)"
      ],
      createdBy: { _id: 'u_investigator', name: 'Investigator', username: 'investigator' },
      createdAt: new Date(Date.now() - 3600000 * 38).toISOString()
    },
    {
      _id: 'hyp_002',
      caseId: 'case_1',
      title: 'Privileged Insider Data Exfiltration',
      description: 'Disgruntled operations engineer staged and exfiltrated customer records via internal maintenance windows.',
      score: 2.81,
      explainability: [
        "+2.81: Evidence 'Encrypted Staging Archive in /tmp/cache.dat' supports (strength 7.5, confidence 75%, state UNVERIFIED)",
        "-6.44: Evidence 'Auth0 Gateway Access Logs & Token Hashes' contradicts (strength 7, confidence 92%, state VERIFIED)"
      ],
      createdBy: { _id: 'u_investigator', name: 'Investigator', username: 'investigator' },
      createdAt: new Date(Date.now() - 3600000 * 32).toISOString()
    },
    {
      _id: 'hyp_003',
      caseId: 'case_1',
      title: 'Automated Opportunistic Ransomware Sweep',
      description: 'Indiscriminate automated credential-stuffing botnet targeting unpatched edge VPN vulnerabilities.',
      score: -4.20,
      explainability: [
        "-7.04: Evidence 'Host Kernel Memory Core Dump' contradicts (strength 8, confidence 88%, state VERIFIED)"
      ],
      createdBy: { _id: 'u_investigator', name: 'Investigator', username: 'investigator' },
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    }
  ],
  relationships: [
    {
      _id: 'rel_001',
      caseId: 'case_1',
      hypothesisId: 'hyp_001',
      evidenceId: 'ev_001',
      type: 'SUPPORT',
      strength: 8,
      createdBy: 'u_investigator'
    },
    {
      _id: 'rel_002',
      caseId: 'case_1',
      hypothesisId: 'hyp_001',
      evidenceId: 'ev_002',
      type: 'SUPPORT',
      strength: 8,
      createdBy: 'u_investigator'
    },
    {
      _id: 'rel_003',
      caseId: 'case_1',
      hypothesisId: 'hyp_001',
      evidenceId: 'ev_004',
      type: 'CONTRADICT',
      strength: 7,
      createdBy: 'u_investigator'
    },
    {
      _id: 'rel_004',
      caseId: 'case_1',
      hypothesisId: 'hyp_002',
      evidenceId: 'ev_003',
      type: 'SUPPORT',
      strength: 7.5,
      createdBy: 'u_investigator'
    },
    {
      _id: 'rel_005',
      caseId: 'case_1',
      hypothesisId: 'hyp_002',
      evidenceId: 'ev_001',
      type: 'CONTRADICT',
      strength: 7,
      createdBy: 'u_investigator'
    },
    {
      _id: 'rel_006',
      caseId: 'case_1',
      hypothesisId: 'hyp_003',
      evidenceId: 'ev_002',
      type: 'CONTRADICT',
      strength: 8,
      createdBy: 'u_investigator'
    }
  ],
  scoreHistory: [
    {
      _id: 'sh_seed_1',
      caseId: 'case_1',
      hypothesisId: 'hyp_001',
      previousScore: 0,
      newScore: 7.36,
      delta: 7.36,
      triggerType: 'ADD_EVIDENCE_RELATIONSHIP',
      triggerEntityId: 'rel_001',
      triggerDetails: {
        evidenceId: 'ev_001',
        evidenceTitle: 'Auth0 Gateway Access Logs & Token Hashes',
        verificationState: 'VERIFIED',
        relationshipType: 'SUPPORT',
        relationshipStrength: 8,
        description: 'Linked Auth0 Gateway Access Logs to APT Infiltration theory'
      },
      actor: { name: 'Investigator', username: 'investigator', role: 'Investigator' },
      timestamp: new Date(Date.now() - 3600000 * 30).toISOString()
    },
    {
      _id: 'sh_seed_2',
      caseId: 'case_1',
      hypothesisId: 'hyp_001',
      previousScore: 7.36,
      newScore: 14.40,
      delta: 7.04,
      triggerType: 'ADD_EVIDENCE_RELATIONSHIP',
      triggerEntityId: 'rel_002',
      triggerDetails: {
        evidenceId: 'ev_002',
        evidenceTitle: 'Host Kernel Memory Core Dump',
        verificationState: 'VERIFIED',
        relationshipType: 'SUPPORT',
        relationshipStrength: 8,
        description: 'Linked Host Kernel Memory Core Dump (strength 8, state VERIFIED)'
      },
      actor: { name: 'Investigator', username: 'investigator', role: 'Investigator' },
      timestamp: new Date(Date.now() - 3600000 * 22).toISOString()
    },
    {
      _id: 'sh_seed_3',
      caseId: 'case_1',
      hypothesisId: 'hyp_001',
      previousScore: 14.40,
      newScore: 13.79,
      delta: -0.61,
      triggerType: 'ADD_EVIDENCE_RELATIONSHIP',
      triggerEntityId: 'rel_003',
      triggerDetails: {
        evidenceId: 'ev_004',
        evidenceTitle: 'Outbound NetFlow PCAP Packet Trace',
        verificationState: 'DISPUTED',
        relationshipType: 'CONTRADICT',
        relationshipStrength: 7,
        description: 'Linked disputed NetFlow Trace as contradicting evidence'
      },
      actor: { name: 'Reviewer', username: 'reviewer', role: 'Reviewer' },
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
    }
  ],
  auditLogs: [
    {
      _id: 'log_1',
      user: { name: 'Admin', username: 'admin', role: 'Admin' },
      action: 'CREATE_CASE',
      entityType: 'Case',
      entityId: 'case_1',
      details: { title: 'Incident 2026-Alpha: Cloud Ingress Breach' },
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      _id: 'log_2',
      user: { name: 'Investigator', username: 'investigator', role: 'Investigator' },
      action: 'ADD_EVIDENCE',
      entityType: 'Evidence',
      entityId: 'ev_001',
      details: { title: 'Auth0 Gateway Access Logs & Token Hashes', caseId: 'case_1' },
      createdAt: new Date(Date.now() - 3600000 * 40).toISOString()
    },
    {
      _id: 'log_3',
      user: { name: 'Investigator', username: 'investigator', role: 'Investigator' },
      action: 'VERIFY_EVIDENCE',
      entityType: 'Evidence',
      entityId: 'ev_001',
      details: { verificationState: 'VERIFIED', previousState: 'UNVERIFIED' },
      createdAt: new Date(Date.now() - 3600000 * 35).toISOString()
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
