const mongoose = require('mongoose');
const Evidence = require('../models/Evidence');
const logAudit = require('../utils/auditLogger');
const { updateScoresForEvidence } = require('../utils/scoringEngine');
const { memoryStore, recalculateScoreInMemory } = require('../utils/memoryStore');

exports.getEvidenceForCase = async (req, res, next) => {
  try {
    const search = req.query.search ? req.query.search.trim() : '';
    const verificationState = req.query.verificationState ? req.query.verificationState.trim() : '';
    const type = req.query.type ? req.query.type.trim() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;

    if (mongoose.connection.readyState !== 1) {
      let ev = memoryStore.evidence.filter(e => String(e.caseId) === String(req.params.caseId));

      if (search) {
        const s = search.toLowerCase();
        ev = ev.filter(e =>
          (e.title && e.title.toLowerCase().includes(s)) ||
          (e.type && e.type.toLowerCase().includes(s)) ||
          (e.source && e.source.toLowerCase().includes(s)) ||
          (e.description && e.description.toLowerCase().includes(s)) ||
          (e._id && e._id.toLowerCase().includes(s))
        );
      }

      if (verificationState) {
        ev = ev.filter(e => e.verificationState === verificationState);
      }

      if (type) {
        ev = ev.filter(e => e.type === type);
      }

      const total = ev.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginated = isPaginated ? ev.slice((page - 1) * limit, page * limit) : ev;

      return res.json({
        success: true,
        data: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    }

    const query = { caseId: req.params.caseId };

    if (search) {
      const searchConditions = [
        { title: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push({ _id: search });
      }
      query.$or = searchConditions;
    }

    if (verificationState) {
      query.verificationState = verificationState;
    }

    if (type) {
      query.type = type;
    }

    const total = await Evidence.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    let queryBuilder = Evidence.find(query)
      .populate('uploadedBy', 'name username')
      .sort({ createdAt: -1 });

    if (isPaginated) {
      queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
    }

    const evidence = await queryBuilder.exec();

    res.json({
      success: true,
      data: evidence,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.addEvidence = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const newEv = {
        _id: 'ev_' + Date.now(),
        caseId: req.params.caseId,
        ...req.body,
        verificationState: req.body.verificationState || 'UNVERIFIED',
        confidenceScore: req.body.confidenceScore !== undefined ? req.body.confidenceScore : 50,
        uploadedBy: { name: req.user?.name || 'Investigator', username: req.user?.username || 'investigator' },
        createdAt: new Date().toISOString()
      };
      memoryStore.evidence.unshift(newEv);
      await logAudit(req.user?._id || 'u_investigator', 'ADD_EVIDENCE', 'Evidence', newEv._id, { title: newEv.title, caseId: newEv.caseId });
      return res.status(201).json({ success: true, data: newEv });
    }
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
    if (mongoose.connection.readyState !== 1) {
      const ev = memoryStore.evidence.find(e => String(e._id) === String(req.params.id));
      if (!ev) return res.status(404).json({ success: false, error: 'Evidence not found' });
      const oldState = ev.verificationState || 'UNVERIFIED';
      ev.verificationState = req.body.verificationState;
      if (req.body.confidenceScore !== undefined) {
        ev.confidenceScore = req.body.confidenceScore;
      }
      const affectedRels = memoryStore.relationships.filter(r => String(r.evidenceId) === String(ev._id));
      const affectedHypothesisIds = [...new Set(affectedRels.map(r => String(r.hypothesisId)))];
      
      const triggerType = ev.verificationState === 'DISPUTED' ? 'DISPUTE_EVIDENCE' 
        : ev.verificationState === 'REJECTED' ? 'REJECT_EVIDENCE' 
        : 'VERIFY_EVIDENCE';

      const triggerInfo = {
        triggerType,
        triggerEntityId: ev._id,
        triggerDetails: {
          evidenceId: ev._id,
          evidenceTitle: ev.title,
          verificationState: ev.verificationState,
          oldState,
          description: `Evidence verification updated from ${oldState} to ${ev.verificationState}`
        },
        forceRecord: true
      };

      for (const hypId of affectedHypothesisIds) {
        recalculateScoreInMemory(hypId, triggerInfo, req.user);
      }
      
      await logAudit(req.user?._id || 'u_reviewer', 'VERIFY_EVIDENCE', 'Evidence', ev._id, { 
        oldState, 
        newState: ev.verificationState,
        caseId: ev.caseId,
        title: ev.title
      });
      return res.json({ success: true, data: ev });
    }
    const evidence = await Evidence.findById(req.params.id);
    if (!evidence) return res.status(404).json({ success: false, error: 'Evidence not found' });

    const oldState = evidence.verificationState || 'UNVERIFIED';
    evidence.verificationState = req.body.verificationState;
    if (req.body.confidenceScore !== undefined) {
      evidence.confidenceScore = req.body.confidenceScore;
    }
    
    await evidence.save();
    await logAudit(req.user._id, 'VERIFY_EVIDENCE', 'Evidence', evidence._id, { 
      oldState, 
      newState: evidence.verificationState,
      caseId: evidence.caseId,
      title: evidence.title
    });
    
    const triggerType = evidence.verificationState === 'DISPUTED' ? 'DISPUTE_EVIDENCE' 
      : evidence.verificationState === 'REJECTED' ? 'REJECT_EVIDENCE' 
      : 'VERIFY_EVIDENCE';

    const triggerInfo = {
      triggerType,
      triggerEntityId: evidence._id,
      triggerDetails: {
        evidenceId: evidence._id,
        evidenceTitle: evidence.title,
        verificationState: evidence.verificationState,
        oldState,
        description: `Evidence verification updated from ${oldState} to ${evidence.verificationState}`
      },
      forceRecord: true
    };

    // Update hypothesis scores affected by this evidence
    await updateScoresForEvidence(evidence._id, triggerInfo, req.user);
    
    res.json({ success: true, data: evidence });
  } catch (err) {
    next(err);
  }
};
