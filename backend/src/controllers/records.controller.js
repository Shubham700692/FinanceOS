const recordsService = require('../services/records.service');
const { sendSuccess } = require('../utils/response');

const getRecords = (req, res, next) => {
  try {
    const result = recordsService.getRecords(
      req.validatedQuery,
      req.user.userId,
      req.user.currentRole
    );
    sendSuccess(res, result.records, 'Records retrieved', 200, {
      total: result.total, page: result.page, limit: result.limit,
      totalPages: result.totalPages, hasNext: result.hasNext, hasPrev: result.hasPrev,
    });
  } catch (err) { next(err); }
};

const getRecord = (req, res, next) => {
  try {
    const record = recordsService.getRecordById(req.params.id, req.user.userId, req.user.currentRole);
    sendSuccess(res, record, 'Record retrieved');
  } catch (err) { next(err); }
};

const createRecord = (req, res, next) => {
  try {
    const record = recordsService.createRecord(req.body, req.user.userId);
    sendSuccess(res, record, 'Record created', 201);
  } catch (err) { next(err); }
};

const updateRecord = (req, res, next) => {
  try {
    // Capture old values for audit
    const record = recordsService.updateRecord(req.params.id, req.body, req.user.userId, req.user.currentRole);
    sendSuccess(res, record, 'Record updated');
  } catch (err) { next(err); }
};

const deleteRecord = (req, res, next) => {
  try {
    const result = recordsService.deleteRecord(req.params.id, req.user.userId, req.user.currentRole);
    sendSuccess(res, result, 'Record deleted');
  } catch (err) { next(err); }
};

module.exports = { getRecords, getRecord, createRecord, updateRecord, deleteRecord };