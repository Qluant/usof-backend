const Like = require('../models/Like');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const AppError = require('../utils/AppError');

class LikeService {
  async getLikes(targetType, targetId) {
    if (targetType === 'post') {
      const post = await Post.findById(targetId);
      if (!post) throw new AppError('Post not found.', 404);
    } else if (targetType === 'comment') {
      const comment = await Comment.findById(targetId);
      if (!comment) throw new AppError('Comment not found.', 404);
    }

    return Like.getLikesByTarget(targetType, targetId);
  }

  async addOrUpdateLike(targetType, targetId, authorId, type = 'like') {
    let targetAuthorId;

    if (targetType === 'post') {
      const post = await Post.findById(targetId);
      if (!post) throw new AppError('Post not found.', 404);
      targetAuthorId = post.author_id;
    } else if (targetType === 'comment') {
      const comment = await Comment.findById(targetId);
      if (!comment) throw new AppError('Comment not found.', 404);
      targetAuthorId = comment.author_id;
    } else {
      throw new AppError('Invalid target type.', 400);
    }

    const validTypes = ['like', 'dislike'];
    if (!validTypes.includes(type)) {
      throw new AppError('Type must be either like or dislike.', 400);
    }

    const existingLike = await Like.findByTargetAndAuthor(targetType, targetId, authorId);

    if (existingLike) {
      if (existingLike.type === type) {
        await Like.deleteById(existingLike.id);
        await User.calculateRating(targetAuthorId);
        return { message: `${type} removed.`, currentStatus: null };
      } else {
        await Like.updateById(existingLike.id, { type });
        await User.calculateRating(targetAuthorId);
        return { message: `Updated to ${type}.`, currentStatus: type };
      }
    }

    await Like.create({
      author_id: authorId,
      target_type: targetType,
      target_id: targetId,
      type
    });

    await User.calculateRating(targetAuthorId);
    return { message: `${type} added successfully.`, currentStatus: type };
  }

  async removeLike(targetType, targetId, authorId, userRole = 'user') {
    let targetAuthorId;

    if (targetType === 'post') {
      const post = await Post.findById(targetId);
      if (!post) throw new AppError('Post not found.', 404);
      targetAuthorId = post.author_id;
    } else if (targetType === 'comment') {
      const comment = await Comment.findById(targetId);
      if (!comment) throw new AppError('Comment not found.', 404);
      targetAuthorId = comment.author_id;
    }

    const existingLike = await Like.findByTargetAndAuthor(targetType, targetId, authorId);
    if (!existingLike) {
      throw new AppError('Like or dislike not found.', 404);
    }

    await Like.deleteById(existingLike.id);
    await User.calculateRating(targetAuthorId);

    return { message: 'Vote removed successfully.' };
  }
}

module.exports = new LikeService();
