const categoryService = require('../services/category.service');
const { successResponse } = require('../utils/response.util');

class CategoryController {
  async getAllCategories(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      return successResponse(res, 200, 'Categories retrieved successfully', categories);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const { category_id } = req.params;
      const category = await categoryService.getCategoryById(category_id);
      return successResponse(res, 200, 'Category retrieved successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryPosts(req, res, next) {
    try {
      const { category_id } = req.params;
      const userRole = req.user ? req.user.role : 'user';
      const userId = req.user ? req.user.id : null;
      const result = await categoryService.getCategoryPosts(category_id, req.query, userRole, userId);
      return successResponse(res, 200, 'Category posts retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const { title, description } = req.body;
      const category = await categoryService.createCategory({ title, description });
      return successResponse(res, 201, 'Category created successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const { category_id } = req.params;
      const { title, description } = req.body;
      const category = await categoryService.updateCategory(category_id, { title, description });
      return successResponse(res, 200, 'Category updated successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { category_id } = req.params;
      const result = await categoryService.deleteCategory(category_id);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
