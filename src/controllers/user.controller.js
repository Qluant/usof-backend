const userService = require('../services/user.service');
const { successResponse } = require('../utils/response.util');
const AppError = require('../utils/AppError');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return successResponse(res, 200, 'Users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { user_id } = req.params;
      const user = await userService.getUserById(user_id);
      return successResponse(res, 200, 'User profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const { login, password, password_confirmation, email, role } = req.body;
      const newUser = await userService.createUserByAdmin({
        login,
        password,
        password_confirmation,
        email,
        role
      });
      return successResponse(res, 201, 'User created successfully', newUser);
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError('Please provide an image file for avatar.', 400);
      }
      const updatedUser = await userService.updateAvatar(req.user.id, req.file.filename);
      return successResponse(res, 200, 'Avatar updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { user_id } = req.params;
      const updatedUser = await userService.updateUser(user_id, req.body, req.user.id, req.user.role);
      return successResponse(res, 200, 'User updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { user_id } = req.params;
      const result = await userService.deleteUser(user_id, req.user.id, req.user.role);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getFavorites(req, res, next) {
    try {
      const favorites = await userService.getUserFavorites(req.user.id);
      return successResponse(res, 200, 'Favorites retrieved successfully', favorites);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
