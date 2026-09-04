const pool = require('../../config/db.config');

class Favorite {
  constructor() {
    this.db = pool;
    this.tableName = 'favorites';
  }

  async add(userId, postId) {
    const sql = `INSERT IGNORE INTO ${this.tableName} (user_id, post_id) VALUES (?, ?)`;
    await this.db.query(sql, [userId, postId]);
  }

  async remove(userId, postId) {
    const sql = `DELETE FROM ${this.tableName} WHERE user_id = ? AND post_id = ?`;
    const [result] = await this.db.query(sql, [userId, postId]);
    return result.affectedRows > 0;
  }

  async isFavorite(userId, postId) {
    const sql = `SELECT 1 FROM ${this.tableName} WHERE user_id = ? AND post_id = ? LIMIT 1`;
    const [rows] = await this.db.query(sql, [userId, postId]);
    return rows.length > 0;
  }

  async getUserFavorites(userId) {
    const sql = `
      SELECT 
        p.*,
        u.login as author_login,
        u.profile_picture as author_avatar
      FROM favorites f
      JOIN posts p ON p.id = f.post_id
      JOIN users u ON u.id = p.author_id
      WHERE f.user_id = ? AND p.status = 'active'
      ORDER BY f.created_at DESC
    `;
    const [rows] = await this.db.query(sql, [userId]);
    return rows;
  }
}

module.exports = new Favorite();
