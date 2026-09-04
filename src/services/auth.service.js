const bcrypt = require('bcrypt');
const User = require('../models/User');
const mailService = require('./mail.service');
const { generateJwtToken, generateRandomToken } = require('../utils/token.util');
const AppError = require('../utils/AppError');

class AuthService {
  async register({ login, email, password, password_confirmation }) {
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
    const confirmToken = generateRandomToken();

    const newUser = await User.create({
      login,
      email,
      password: hashedPassword,
      full_name: login,
      role: 'user',
      is_email_confirmed: false,
      email_confirm_token: confirmToken
    });

    await mailService.sendEmailConfirmation(email, confirmToken);

    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      message: 'Registration successful. Please check your email to confirm your account.'
    };
  }

  async confirmEmail(token) {
    const user = await User.findByConfirmToken(token);
    if (!user) {
      throw new AppError('Invalid or expired confirmation token.', 400);
    }

    await User.updateById(user.id, {
      is_email_confirmed: true,
      email_confirm_token: null
    });

    return { message: 'Email confirmed successfully. You can now log in.' };
  }

  async login({ login, email, password }) {
    let user;
    if (login) {
      user = await User.findByLogin(login);
    } else if (email) {
      user = await User.findByEmail(email);
    }

    if (!user) {
      throw new AppError('Invalid login credentials.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid login credentials.', 401);
    }

    if (!user.is_email_confirmed) {
      throw new AppError('Please confirm your email address before logging in.', 403);
    }

    const token = generateJwtToken({
      id: user.id,
      login: user.login,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        login: user.login,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        rating: user.rating,
        profile_picture: user.profile_picture
      }
    };
  }

  async requestPasswordReset(email) {
    const user = await User.findByEmail(email);
    if (!user) {
      return { message: 'If that email exists, a password reset link has been sent.' };
    }

    const resetToken = generateRandomToken();
    const expires = new Date(Date.now() + 3600000);

    await User.updateById(user.id, {
      reset_password_token: resetToken,
      reset_password_expires: expires
    });

    await mailService.sendPasswordReset(email, resetToken);

    return { message: 'If that email exists, a password reset link has been sent.' };
  }

  async resetPassword(token, newPassword) {
    const user = await User.findByResetToken(token);
    if (!user) {
      throw new AppError('Password reset token is invalid or has expired.', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateById(user.id, {
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null
    });

    return { message: 'Password has been successfully reset. You can now log in.' };
  }
}

module.exports = new AuthService();
