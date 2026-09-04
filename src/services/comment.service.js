const Comment = require('../models/Comment');
const Post = require('../models/Post');
const AppError = require('../utils/AppError');

class CommentService {
  async getCommentsByPostId(postId, userRole = 'user', currentUserId = null) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    return Comment.findByPostId(postId, userRole, currentUserId);
  }

  async getCommentById(commentId) {
    const comment = await Comment.findWithDetails(commentId);
    if (!comment) {
      throw new AppError('Comment not found.', 404);
    }
    return comment;
  }

  async createComment(postId, { content }, authorId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    if (post.status !== 'active') {
      throw new AppError('Cannot comment on an inactive post.', 400);
    }

    const comment = await Comment.create({
      post_id: postId,
      author_id: authorId,
      content,
      status: 'active'
    });

    return this.getCommentById(comment.id);
  }

  async updateComment(commentId, updateData, currentUserId, currentUserRole) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError('Comment not found.', 404);
    }

    const isAuthor = Number(comment.author_id) === Number(currentUserId);
    const isAdmin = currentUserRole === 'admin';

    if (!isAuthor && !isAdmin) {
      throw new AppError('You do not have permission to update this comment.', 403);
    }

    const updates = {};
    if (updateData.status) {
      updates.status = updateData.status;
    }

    if (Object.keys(updates).length > 0) {
      await Comment.updateById(commentId, updates);
    }

    return this.getCommentById(commentId);
  }

  async deleteComment(commentId, currentUserId, currentUserRole) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError('Comment not found.', 404);
    }

    if (currentUserRole !== 'admin' && Number(comment.author_id) !== Number(currentUserId)) {
      throw new AppError('You do not have permission to delete this comment.', 403);
    }

    await Comment.deleteById(commentId);
    return { message: 'Comment successfully deleted.' };
  }
}

module.exports = new CommentService();
