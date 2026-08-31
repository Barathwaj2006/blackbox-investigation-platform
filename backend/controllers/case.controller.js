const Case = require('../models/Case');
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
