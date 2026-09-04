const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

router.post(
  '/register',
  validateBody(['login', 'password', 'password_confirmation', 'email']),
  authController.register
);
router.get('/confirm-email/:confirm_token', authController.confirmEmail);
router.post('/login', validateBody(['password']), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/password-reset', validateBody(['email']), authController.requestPasswordReset);
router.post(
  '/password-reset/:confirm_token',
  validateBody(['password']),
  authController.resetPassword
);

module.exports = router;
