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
        u.profile_picture as author_avatar,
        u.rating as author_rating,
        CAST(COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) AS SIGNED) as likes_count,
        CAST(COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0) AS SIGNED) as dislikes_count,
        CAST((COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0)) AS SIGNED) as score
      FROM favorites f
      JOIN posts p ON p.id = f.post_id
      JOIN users u ON u.id = p.author_id
      LEFT JOIN likes l ON l.target_type = 'post' AND l.target_id = p.id
      WHERE f.user_id = ? AND p.status = 'active'
      GROUP BY p.id, f.created_at, u.id
      ORDER BY f.created_at DESC
    `;
    const [rows] = await this.db.query(sql, [userId]);
    for (const post of rows) {
      post.likes_count = Number(post.likes_count) || 0;
      post.dislikes_count = Number(post.dislikes_count) || 0;
      post.score = Number(post.score) || 0;
      const catSql = `
        SELECT c.id, c.title 
        FROM categories c
        JOIN post_categories pc ON pc.category_id = c.id
        WHERE pc.post_id = ?
      `;
      const [cats] = await this.db.query(catSql, [post.id]);
      post.categories = cats;
    }
    return rows;
  }
}

module.exports = new Favorite();
