const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const likeController = require('../controllers/like.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/:comment_id', commentController.getCommentById);
router.patch('/:comment_id', authenticate, commentController.updateComment);
router.delete('/:comment_id', authenticate, commentController.deleteComment);

router.get('/:comment_id/like', likeController.getCommentLikes);
router.post('/:comment_id/like', authenticate, likeController.addCommentLike);
router.delete('/:comment_id/like', authenticate, likeController.deleteCommentLike);

module.exports = router;
