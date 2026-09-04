const bcrypt = require('bcrypt');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const AppError = require('../utils/AppError');

class UserService {
  async getAllUsers() {
    const users = await User.findAll({}, 'rating DESC, id ASC');
    return users.map((u) => {
      const { password, email_confirm_token, reset_password_token, reset_password_expires, ...sanitized } = u;
      return sanitized;
    });
  }

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    const currentRating = await User.calculateRating(id);
    user.rating = currentRating;

    const { password, email_confirm_token, reset_password_token, reset_password_expires, ...sanitized } = user;
    return sanitized;
  }

  async createUserByAdmin({ login, password, password_confirmation, email, role = 'user' }) {
    if (password !== password_confirmation) {
      throw new AppError('Password confirmation does not match.', 400);
    }

    const existingLogin = await User.findByLogin(login);
    if (existingLogin) {
      throw new AppError('Username is already taken.', 400);
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      throw new AppError('Email address is already in use.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      login,
      email,
      password: hashedPassword,
      full_name: login,
      role: role === 'admin' ? 'admin' : 'user',
      is_email_confirmed: true
    });

    const { password: _, ...sanitized } = user;
    return sanitized;
  }

  async updateAvatar(userId, filename) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const updated = await User.updateById(userId, { profile_picture: filename });
    const { password, email_confirm_token, reset_password_token, reset_password_expires, ...sanitized } = updated;
    return sanitized;
  }

  async updateUser(targetUserId, updateData, currentUserId, currentUserRole) {
    const user = await User.findById(targetUserId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    if (currentUserRole !== 'admin' && Number(targetUserId) !== Number(currentUserId)) {
      throw new AppError('You do not have permission to update this profile.', 403);
    }

    const allowedUpdates = {};

    if (updateData.full_name) allowedUpdates.full_name = updateData.full_name;
    if (updateData.email) {
      const existingEmail = await User.findByEmail(updateData.email);
      if (existingEmail && existingEmail.id !== Number(targetUserId)) {
        throw new AppError('Email is already in use.', 400);
      }
      allowedUpdates.email = updateData.email;
    }

    if (updateData.password) {
      allowedUpdates.password = await bcrypt.hash(updateData.password, 10);
    }

    if (currentUserRole === 'admin' && updateData.role) {
      allowedUpdates.role = updateData.role;
    }

    const updated = await User.updateById(targetUserId, allowedUpdates);
    const { password, email_confirm_token, reset_password_token, reset_password_expires, ...sanitized } = updated;
    return sanitized;
  }

  async deleteUser(targetUserId, currentUserId, currentUserRole) {
    const user = await User.findById(targetUserId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    if (currentUserRole !== 'admin' && Number(targetUserId) !== Number(currentUserId)) {
      throw new AppError('You do not have permission to delete this user.', 403);
    }

    await User.deleteById(targetUserId);
    return { message: 'User successfully deleted.' };
  }

  async getUserFavorites(userId) {
    return Favorite.getUserFavorites(userId);
  }
}

module.exports = new UserService();
