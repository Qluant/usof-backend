const User = require('../models/User');
const Post = require('../models/Post');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const { successResponse } = require('../utils/response.util');

class AdminController {
  async getDashboardStats(req, res, next) {
    try {
      const usersCount = await User.count();
      const postsCount = await Post.count();
      const categoriesCount = await Category.count();
      const commentsCount = await Comment.count();

      return successResponse(res, 200, 'Admin statistics retrieved successfully', {
        users: usersCount,
        posts: postsCount,
        categories: categoriesCount,
        comments: commentsCount
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
