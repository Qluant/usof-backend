const Post = require('../models/Post');
const Category = require('../models/Category');
const Favorite = require('../models/Favorite');
const Like = require('../models/Like');
const AppError = require('../utils/AppError');

class PostService {
  async getAllPosts(queryParams, userRole = 'user', currentUserId = null) {
    return Post.findPostsAdvanced({
      ...queryParams,
      userRole,
      currentUserId
    });
  }

  async getPostById(id, userRole = 'user', currentUserId = null) {
    const post = await Post.findWithDetails(id);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    if (post.status === 'inactive' && userRole !== 'admin' && Number(post.author_id) !== Number(currentUserId)) {
      throw new AppError('Post not found or is inactive.', 404);
    }

    if (currentUserId) {
      post.is_favorite = await Favorite.isFavorite(currentUserId, post.id);
      const userVote = await Like.findByTargetAndAuthor('post', post.id, currentUserId);
      post.user_vote = userVote ? userVote.type : null;
    } else {
      post.is_favorite = false;
      post.user_vote = null;
    }

    return post;
  }

  async createPost({ title, content, categories }, authorId) {
    const post = await Post.create({
      author_id: authorId,
      title,
      content,
      status: 'active'
    });

    if (categories && Array.isArray(categories)) {
      await Post.setCategories(post.id, categories);
    }

    return this.getPostById(post.id, 'user', authorId);
  }

  async updatePost(postId, updateData, currentUserId, currentUserRole) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    const isAuthor = Number(post.author_id) === Number(currentUserId);
    const isAdmin = currentUserRole === 'admin';

    if (!isAuthor && !isAdmin) {
      throw new AppError('You do not have permission to update this post.', 403);
    }

    if (!isAuthor && isAdmin) {
      if (updateData.title !== undefined || updateData.content !== undefined) {
        throw new AppError('Content is not editable even for admins.', 403);
      }
    }

    const postUpdates = {};

    if (isAuthor) {
      if (updateData.title) postUpdates.title = updateData.title;
      if (updateData.content) postUpdates.content = updateData.content;
      if (updateData.status) postUpdates.status = updateData.status;
    } else if (isAdmin) {
      if (updateData.status) postUpdates.status = updateData.status;
    }

    if (Object.keys(postUpdates).length > 0) {
      await Post.updateById(postId, postUpdates);
    }

    if (updateData.categories && Array.isArray(updateData.categories)) {
      await Post.setCategories(postId, updateData.categories);
    }

    return this.getPostById(postId, currentUserRole, currentUserId);
  }

  async deletePost(postId, currentUserId, currentUserRole) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    if (currentUserRole !== 'admin' && Number(post.author_id) !== Number(currentUserId)) {
      throw new AppError('You do not have permission to delete this post.', 403);
    }

    await Post.deleteById(postId);
    return { message: 'Post successfully deleted.' };
  }

  async getPostCategories(postId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    return Category.findCategoriesByPostId(postId);
  }

  async toggleFavorite(userId, postId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    const isFav = await Favorite.isFavorite(userId, postId);
    if (isFav) {
      await Favorite.remove(userId, postId);
      return { isFavorite: false, message: 'Removed from favorites.' };
    } else {
      await Favorite.add(userId, postId);
      return { isFavorite: true, message: 'Added to favorites.' };
    }
  }
}

module.exports = new PostService();
