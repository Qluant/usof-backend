const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(authenticate);
router.use(restrictTo('admin'));

router.get('/stats', adminController.getDashboardStats);

module.exports = router;
