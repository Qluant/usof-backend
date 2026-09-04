const likeService = require('../services/like.service');
const { successResponse } = require('../utils/response.util');

class LikeController {
  async getPostLikes(req, res, next) {
    try {
      const { post_id } = req.params;
      const likes = await likeService.getLikes('post', post_id);
      return successResponse(res, 200, 'Post likes retrieved successfully', likes);
    } catch (error) {
      next(error);
    }
  }

  async addPostLike(req, res, next) {
    try {
      const { post_id } = req.params;
      const { type = 'like' } = req.body;
      const result = await likeService.addOrUpdateLike('post', post_id, req.user.id, type);
      return successResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async deletePostLike(req, res, next) {
    try {
      const { post_id } = req.params;
      const result = await likeService.removeLike('post', post_id, req.user.id, req.user.role);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getCommentLikes(req, res, next) {
    try {
      const { comment_id } = req.params;
      const likes = await likeService.getLikes('comment', comment_id);
      return successResponse(res, 200, 'Comment likes retrieved successfully', likes);
    } catch (error) {
      next(error);
    }
  }

  async addCommentLike(req, res, next) {
    try {
      const { comment_id } = req.params;
      const { type = 'like' } = req.body;
      const result = await likeService.addOrUpdateLike('comment', comment_id, req.user.id, type);
      return successResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentLike(req, res, next) {
    try {
      const { comment_id } = req.params;
      const result = await likeService.removeLike('comment', comment_id, req.user.id, req.user.role);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LikeController();
