const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

router.get('/', categoryController.getAllCategories);
router.get('/:category_id', categoryController.getCategoryById);
router.get('/:category_id/posts', optionalAuthenticate, categoryController.getCategoryPosts);

router.post(
  '/',
  authenticate,
  restrictTo('admin'),
  validateBody(['title']),
  categoryController.createCategory
);

router.patch('/:category_id', authenticate, restrictTo('admin'), categoryController.updateCategory);
router.delete('/:category_id', authenticate, restrictTo('admin'), categoryController.deleteCategory);

module.exports = router;
