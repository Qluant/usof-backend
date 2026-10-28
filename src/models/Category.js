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

  async findAllWithPostCount() {
    const sql = `
      SELECT c.*, COUNT(pc.post_id) AS posts_count
      FROM categories c
      LEFT JOIN post_categories pc ON pc.category_id = c.id
      GROUP BY c.id
      ORDER BY posts_count DESC, c.title ASC
    `;
    const [rows] = await this.db.query(sql);
    return rows;
  }
}

module.exports = new Category();
