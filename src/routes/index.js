const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const postRoutes = require('./post.routes');
const categoryRoutes = require('./category.routes');
const commentRoutes = require('./comment.routes');
const adminRoutes = require('./admin.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/categories', categoryRoutes);
router.use('/comments', commentRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
