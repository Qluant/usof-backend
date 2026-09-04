const nodemailer = require('nodemailer');
const mailConfig = require('../../config/mail.config');
const appConfig = require('../../config/app.config');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass
      }
    });
  }

  async sendEmailConfirmation(email, token) {
    const confirmationLink = `${appConfig.clientUrl}/api/auth/confirm-email/${token}`;
    const mailOptions = {
      from: mailConfig.from,
      to: email,
      subject: 'USOF - Confirm Your Email Address',
      html: `
        <h2>Welcome to USOF!</h2>
        <p>Please click the link below to confirm your email and activate your account:</p>
        <a href="${confirmationLink}">${confirmationLink}</a>
        <p>If you did not register for an account, please ignore this email.</p>
      `
    };

    if (mailConfig.user) {
      await this.transporter.sendMail(mailOptions);
    } else {
      console.log(`[DEV MAIL] Email Confirmation for ${email}: ${confirmationLink}`);
    }
  }

  async sendPasswordReset(email, token) {
    const resetLink = `${appConfig.clientUrl}/api/auth/password-reset/${token}`;
    const mailOptions = {
      from: mailConfig.from,
      to: email,
      subject: 'USOF - Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
      `
    };

    if (mailConfig.user) {
      await this.transporter.sendMail(mailOptions);
    } else {
      console.log(`[DEV MAIL] Password Reset for ${email}: ${resetLink}`);
    }
  }
}

module.exports = new MailService();
