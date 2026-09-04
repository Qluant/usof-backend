const postService = require('../services/post.service');
const { successResponse } = require('../utils/response.util');

class PostController {
  async getAllPosts(req, res, next) {
    try {
      const userRole = req.user ? req.user.role : 'user';
      const currentUserId = req.user ? req.user.id : null;
      const result = await postService.getAllPosts(req.query, userRole, currentUserId);
      return successResponse(res, 200, 'Posts retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req, res, next) {
    try {
      const { post_id } = req.params;
      const userRole = req.user ? req.user.role : 'user';
      const currentUserId = req.user ? req.user.id : null;
      const post = await postService.getPostById(post_id, userRole, currentUserId);
      return successResponse(res, 200, 'Post retrieved successfully', post);
    } catch (error) {
      next(error);
    }
  }

  async createPost(req, res, next) {
    try {
      const { title, content, categories } = req.body;
      const parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
      const post = await postService.createPost(
        { title, content, categories: parsedCategories },
        req.user.id
      );
      return successResponse(res, 201, 'Post created successfully', post);
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req, res, next) {
    try {
      const { post_id } = req.params;
      const { title, content, categories, status } = req.body;
      const parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
      const updatedPost = await postService.updatePost(
        post_id,
        { title, content, categories: parsedCategories, status },
        req.user.id,
        req.user.role
      );
      return successResponse(res, 200, 'Post updated successfully', updatedPost);
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req, res, next) {
    try {
      const { post_id } = req.params;
      const result = await postService.deletePost(post_id, req.user.id, req.user.role);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getPostCategories(req, res, next) {
    try {
      const { post_id } = req.params;
      const categories = await postService.getPostCategories(post_id);
      return successResponse(res, 200, 'Categories retrieved successfully', categories);
    } catch (error) {
      next(error);
    }
  }

  async toggleFavorite(req, res, next) {
    try {
      const { post_id } = req.params;
      const result = await postService.toggleFavorite(req.user.id, post_id);
      return successResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();
