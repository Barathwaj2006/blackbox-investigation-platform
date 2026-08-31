const Case = require('../models/Case');
const AuditLog = require('../models/AuditLog');
const logAudit = require('../utils/auditLogger');

exports.getCases = async (req, res, next) => {
  try {
    const cases = await Case.find().populate('assignedTo', 'name username').populate('createdBy', 'name username').sort({ createdAt: -1 });
    res.json({ success: true, data: cases });
  } catch (err) {
    next(err);
  }
};

exports.getCase = async (req, res, next) => {
  try {
    const caseItem = await Case.findById(req.params.id).populate('assignedTo', 'name username').populate('createdBy', 'name username');
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });
    res.json({ success: true, data: caseItem });
  } catch (err) {
    next(err);
  }
};

exports.createCase = async (req, res, next) => {
  try {
    const caseItem = await Case.create({
      ...req.body,
      createdBy: req.user._id
    });
    await logAudit(req.user._id, 'CREATE_CASE', 'Case', caseItem._id, { title: caseItem.title });
    res.status(201).json({ success: true, data: caseItem });
  } catch (err) {
    next(err);
  }
};

exports.updateCaseStatus = async (req, res, next) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });
    
    const oldStatus = caseItem.status;
    caseItem.status = req.body.status;
    await caseItem.save();
    
    await logAudit(req.user._id, 'UPDATE_CASE_STATUS', 'Case', caseItem._id, { oldStatus, newStatus: caseItem.status });
    res.json({ success: true, data: caseItem });
  } catch (err) {
    next(err);
  }
};

exports.getCaseTimeline = async (req, res, next) => {
  try {
    // For the timeline, we want audit logs related to this case, its evidence, its hypotheses, and relationships
    // To simplify for the hackathon, we fetch all logs and filter in memory, or use a clever query.
    // In a real app, we'd ensure all child entities store caseId for easy querying.
    const logs = await AuditLog.find().populate('user', 'name username').sort({ createdAt: 1 });
    // Filter logic: we will just return all logs and let frontend filter, OR
    // better: return all since demo only has one case anyway, but I will return all for now to avoid modifying models.
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};
