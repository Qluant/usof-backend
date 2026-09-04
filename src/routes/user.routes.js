const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

router.get('/', userController.getAllUsers);
router.get('/favorites', authenticate, userController.getFavorites);
router.get('/:user_id', userController.getUserById);

router.post(
  '/',
  authenticate,
  restrictTo('admin'),
  validateBody(['login', 'password', 'password_confirmation', 'email', 'role']),
  userController.createUser
);

router.patch('/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);
router.patch('/:user_id', authenticate, userController.updateUser);
router.delete('/:user_id', authenticate, userController.deleteUser);

module.exports = router;
