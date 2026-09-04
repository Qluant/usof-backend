const BaseModel = require('./BaseModel');

class Category extends BaseModel {
  constructor() {
    super('categories');
  }

  async findByTitle(title) {
    return this.findOne({ title });
  }

  async findCategoriesByPostId(postId) {
    const sql = `
      SELECT c.* 
      FROM categories c
      JOIN post_categories pc ON pc.category_id = c.id
      WHERE pc.post_id = ?
    `;
    const [rows] = await this.db.query(sql, [postId]);
    return rows;
  }
}

module.exports = new Category();
