const nodemailer = require('nodemailer');
const mailConfig = require('../../config/mail.config');
const appConfig = require('../../config/app.config');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.port === 465,
      auth: mailConfig.user ? {
        user: mailConfig.user,
        pass: mailConfig.pass
      } : undefined
    });
  }

  async sendEmailConfirmation(email, token) {
    const confirmationLink = `${appConfig.clientUrl}/confirm-email/${token}`;
    const mailOptions = {
      from: mailConfig.from,
      to: email,
      subject: 'GamerEars - Confirm Your Player Account',
      html: `
        <h2>Welcome to GamerEars!</h2>
        <p>Please click the link below to confirm your email and activate your player account:</p>
        <a href="${confirmationLink}">${confirmationLink}</a>
        <p>If you did not register for an account, please ignore this email.</p>
      `
    };

    if (mailConfig.user) {
      try {
        await this.transporter.sendMail(mailOptions);
      } catch (err) {
        console.error(`[SMTP ERROR] Could not send to ${email}:`, err.message);
        console.log(`[FALLBACK LINK] ${confirmationLink}`);
      }
    } else {
      console.log(`[DEV MAIL] Email Confirmation for ${email}: ${confirmationLink}`);
    }
  }

  async sendPasswordReset(email, token) {
    const resetLink = `${appConfig.clientUrl}/password-reset/${token}`;
    const mailOptions = {
      from: mailConfig.from,
      to: email,
      subject: 'GamerEars - Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
      `
    };

    if (mailConfig.user) {
      try {
        await this.transporter.sendMail(mailOptions);
      } catch (err) {
        console.error(`[SMTP ERROR] Could not send to ${email}:`, err.message);
        console.log(`[FALLBACK LINK] ${resetLink}`);
      }
    } else {
      console.log(`[DEV MAIL] Password Reset for ${email}: ${resetLink}`);
    }
  }
}

module.exports = new MailService();
