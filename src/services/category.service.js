const Category = require('../models/Category');
const Post = require('../models/Post');
const AppError = require('../utils/AppError');

class CategoryService {
  async getAllCategories() {
    return Category.findAll({}, 'title ASC');
  }

  async getCategoryById(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found.', 404);
    }
    return category;
  }

  async getCategoryPosts(categoryId, query, userRole, userId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new AppError('Category not found.', 404);
    }

    return Post.findPostsAdvanced({
      ...query,
      categoryId,
      userRole,
      currentUserId: userId
    });
  }

  async createCategory({ title, description }) {
    const existing = await Category.findByTitle(title);
    if (existing) {
      throw new AppError('Category with this title already exists.', 400);
    }

    return Category.create({ title, description });
  }

  async updateCategory(id, { title, description }) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found.', 404);
    }

    if (title && title !== category.title) {
      const existing = await Category.findByTitle(title);
      if (existing) {
        throw new AppError('Category with this title already exists.', 400);
      }
    }

    return Category.updateById(id, {
      title: title || category.title,
      description: description !== undefined ? description : category.description
    });
  }

  async deleteCategory(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found.', 404);
    }

    await Category.deleteById(id);
    return { message: 'Category successfully deleted.' };
  }
}

module.exports = new CategoryService();
