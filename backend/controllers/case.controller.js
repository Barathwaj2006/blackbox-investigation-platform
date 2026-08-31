const mongoose = require('mongoose');
const Case = require('../models/Case');
const logAudit = require('../utils/auditLogger');
const { memoryStore } = require('../utils/memoryStore');

exports.getCases = async (req, res, next) => {
  try {
    const search = req.query.search ? req.query.search.trim() : '';
    const status = req.query.status ? req.query.status.trim() : '';
    const priority = req.query.priority ? req.query.priority.trim() : '';
    const investigator = req.query.investigator ? req.query.investigator.trim() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;

    if (mongoose.connection.readyState !== 1) {
      let cases = [...(memoryStore.cases || [])];

      if (search) {
        const s = search.toLowerCase();
        cases = cases.filter(c => 
          (c.title && c.title.toLowerCase().includes(s)) ||
          (c.description && c.description.toLowerCase().includes(s)) ||
          (c._id && c._id.toLowerCase().includes(s))
        );
      }

      if (status) {
        cases = cases.filter(c => c.status === status);
      }

      if (priority) {
        if (priority === 'CRITICAL') cases = cases.filter(c => c.status === 'REVIEW');
        else if (priority === 'HIGH') cases = cases.filter(c => c.status === 'INVESTIGATING');
        else if (priority === 'NORMAL') cases = cases.filter(c => !['REVIEW', 'INVESTIGATING'].includes(c.status));
      }

      if (investigator) {
        const inv = investigator.toLowerCase();
        cases = cases.filter(c => 
          (c.createdBy?.name && c.createdBy.name.toLowerCase().includes(inv)) ||
          (c.createdBy?.username && c.createdBy.username.toLowerCase().includes(inv))
        );
      }

      const total = cases.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginated = isPaginated ? cases.slice((page - 1) * limit, page * limit) : cases;

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

    const query = {};

    if (search) {
      const searchConditions = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push({ _id: search });
      }
      query.$or = searchConditions;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      if (priority === 'CRITICAL') query.status = 'REVIEW';
      else if (priority === 'HIGH') query.status = 'INVESTIGATING';
      else if (priority === 'NORMAL') query.status = { $nin: ['REVIEW', 'INVESTIGATING'] };
    }

    const total = await Case.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    let queryBuilder = Case.find(query)
      .populate('assignedTo', 'name username')
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 });

    if (isPaginated) {
      queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
    }

    const cases = await queryBuilder.exec();

    res.json({
      success: true,
      data: cases,
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

exports.getCase = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const c = memoryStore.cases.find(item => item._id === req.params.id);
      if (!c) return res.status(404).json({ success: false, error: 'Case not found' });
      return res.json({ success: true, data: c });
    }
    const caseItem = await Case.findById(req.params.id).populate('assignedTo', 'name username').populate('createdBy', 'name username');
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });
    res.json({ success: true, data: caseItem });
  } catch (err) {
    next(err);
  }
};

exports.createCase = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const newCase = {
        _id: 'case_' + Date.now(),
        ...req.body,
        status: req.body.status || 'DRAFT',
        createdBy: req.user ? { _id: req.user._id, name: req.user.name, username: req.user.username } : { name: 'Investigator' },
        createdAt: new Date().toISOString()
      };
      memoryStore.cases.unshift(newCase);
      await logAudit(req.user?._id || 'u_investigator', 'CREATE_CASE', 'Case', newCase._id, { title: newCase.title, caseId: newCase._id });
      return res.status(201).json({ success: true, data: newCase });
    }
    const caseItem = await Case.create({
      ...req.body,
      createdBy: req.user._id
    });
    await logAudit(req.user._id, 'CREATE_CASE', 'Case', caseItem._id, { title: caseItem.title, caseId: caseItem._id });
    res.status(201).json({ success: true, data: caseItem });
  } catch (err) {
    next(err);
  }
};

exports.updateCaseStatus = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const c = memoryStore.cases.find(item => item._id === req.params.id);
      if (!c) return res.status(404).json({ success: false, error: 'Case not found' });
      const oldStatus = c.status;
      c.status = req.body.status;
      await logAudit(req.user?._id || 'u_investigator', 'UPDATE_CASE_STATUS', 'Case', c._id, { oldStatus, newStatus: c.status, caseId: c._id });
      return res.json({ success: true, data: c });
    }
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });
    
    const oldStatus = caseItem.status;
    caseItem.status = req.body.status;
    await caseItem.save();
    
    await logAudit(req.user._id, 'UPDATE_CASE_STATUS', 'Case', caseItem._id, { oldStatus, newStatus: caseItem.status, caseId: caseItem._id });
    res.json({ success: true, data: caseItem });
  } catch (err) {
    next(err);
  }
};
