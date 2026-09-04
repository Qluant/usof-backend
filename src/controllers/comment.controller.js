const commentService = require('../services/comment.service');
const { successResponse } = require('../utils/response.util');

class CommentController {
  async getCommentsByPostId(req, res, next) {
    try {
      const { post_id } = req.params;
      const userRole = req.user ? req.user.role : 'user';
      const currentUserId = req.user ? req.user.id : null;
      const comments = await commentService.getCommentsByPostId(post_id, userRole, currentUserId);
      return successResponse(res, 200, 'Comments retrieved successfully', comments);
    } catch (error) {
      next(error);
    }
  }

  async getCommentById(req, res, next) {
    try {
      const { comment_id } = req.params;
      const comment = await commentService.getCommentById(comment_id);
      return successResponse(res, 200, 'Comment retrieved successfully', comment);
    } catch (error) {
      next(error);
    }
  }

  async createComment(req, res, next) {
    try {
      const { post_id } = req.params;
      const { content } = req.body;
      const comment = await commentService.createComment(post_id, { content }, req.user.id);
      return successResponse(res, 201, 'Comment created successfully', comment);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const { comment_id } = req.params;
      const { status } = req.body;
      const comment = await commentService.updateComment(
        comment_id,
        { status },
        req.user.id,
        req.user.role
      );
      return successResponse(res, 200, 'Comment updated successfully', comment);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const { comment_id } = req.params;
      const result = await commentService.deleteComment(comment_id, req.user.id, req.user.role);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
