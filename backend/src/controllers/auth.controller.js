const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 'Account created successfully', 201);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (err) { next(err); }
};

const refresh = (req, res, next) => {
  try {
    const result = authService.refreshTokens(req.body.refreshToken);
    sendSuccess(res, result, 'Tokens refreshed');
  } catch (err) { next(err); }
};

const logout = (req, res, next) => {
  try {
    authService.logout(req.user.userId, req.body.refreshToken);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) { next(err); }
};

const me = (req, res) => {
  sendSuccess(res, req.user, 'Current user info');
};

module.exports = { register, login, refresh, logout, me };