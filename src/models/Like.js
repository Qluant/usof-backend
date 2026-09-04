const BaseModel = require('./BaseModel');

class Like extends BaseModel {
  constructor() {
    super('likes');
  }

  async findByTargetAndAuthor(targetType, targetId, authorId) {
    const sql = `SELECT * FROM ${this.tableName} WHERE target_type = ? AND target_id = ? AND author_id = ? LIMIT 1`;
    const [rows] = await this.db.query(sql, [targetType, targetId, authorId]);
    return rows[0] || null;
  }

  async getLikesByTarget(targetType, targetId) {
    const sql = `
      SELECT 
        l.*,
        u.login as author_login,
        u.profile_picture as author_avatar
      FROM likes l
      JOIN users u ON u.id = l.author_id
      WHERE l.target_type = ? AND l.target_id = ?
      ORDER BY l.publish_date DESC
    `;
    const [rows] = await this.db.query(sql, [targetType, targetId]);
    return rows;
  }

  async deleteByTargetAndAuthor(targetType, targetId, authorId) {
    const sql = `DELETE FROM ${this.tableName} WHERE target_type = ? AND target_id = ? AND author_id = ?`;
    const [result] = await this.db.query(sql, [targetType, targetId, authorId]);
    return result.affectedRows > 0;
  }
}

module.exports = new Like();
