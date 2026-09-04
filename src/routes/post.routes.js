const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const likeController = require('../controllers/like.controller');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');

router.get('/', optionalAuthenticate, postController.getAllPosts);
router.get('/:post_id', optionalAuthenticate, postController.getPostById);
router.post(
  '/',
  authenticate,
  validateBody(['title', 'content']),
  postController.createPost
);
router.patch('/:post_id', authenticate, postController.updatePost);
router.delete('/:post_id', authenticate, postController.deletePost);

router.get('/:post_id/categories', postController.getPostCategories);

router.get('/:post_id/comments', optionalAuthenticate, commentController.getCommentsByPostId);
router.post(
  '/:post_id/comments',
  authenticate,
  validateBody(['content']),
  commentController.createComment
);

router.get('/:post_id/like', likeController.getPostLikes);
router.post('/:post_id/like', authenticate, likeController.addPostLike);
router.delete('/:post_id/like', authenticate, likeController.deletePostLike);

router.post('/:post_id/favorite', authenticate, postController.toggleFavorite);

module.exports = router;
