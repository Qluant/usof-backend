const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response.util');

class AuthController {
  async register(req, res, next) {
    try {
      const { login, email, password, password_confirmation } = req.body;
      const result = await authService.register({
        login,
        email,
        password,
        password_confirmation
      });
      return successResponse(res, 201, result.message, {
        id: result.id,
        login: result.login,
        email: result.email
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmEmail(req, res, next) {
    try {
      const { confirm_token } = req.params;
      const result = await authService.confirmEmail(confirm_token);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { login, email, password } = req.body;
      const result = await authService.login({ login, email, password });
      return successResponse(res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      return successResponse(res, 200, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { confirm_token } = req.params;
      const { password } = req.body;
      const result = await authService.resetPassword(confirm_token, password);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
