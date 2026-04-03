const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

const getUsers = (req, res, next) => {
  try {
    const { page, limit, role, status, search } = req.query;
    const result = userService.getAllUsers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      role, status, search,
    });
    sendSuccess(res, result.users, 'Users retrieved', 200, {
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    });
  } catch (err) { next(err); }
};

const getUserById = (req, res, next) => {
  try {
    const user = userService.getUserById(req.params.id);
    sendSuccess(res, user, 'User retrieved');
  } catch (err) { next(err); }
};

const updateUser = (req, res, next) => {
  try {
    const user = userService.updateUser(req.params.id, req.body, req.user.userId, req.user.currentRole);
    sendSuccess(res, user, 'User updated');
  } catch (err) { next(err); }
};

const deleteUser = (req, res, next) => {
  try {
    userService.deleteUser(req.params.id, req.user.userId);
    sendSuccess(res, null, 'User deactivated');
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    await userService.changePassword(req.user.userId, req.body);
    sendSuccess(res, null, 'Password changed successfully');
  } catch (err) { next(err); }
};

const getUserStats = (req, res, next) => {
  try {
    const stats = userService.getUserStats();
    sendSuccess(res, stats, 'User statistics');
  } catch (err) { next(err); }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, changePassword, getUserStats };