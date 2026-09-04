const BaseModel = require('./BaseModel');

class User extends BaseModel {
  constructor() {
    super('users');
  }

  async findByLogin(login) {
    return this.findOne({ login });
  }

  async findByEmail(email) {
    return this.findOne({ email });
  }

  async findByConfirmToken(token) {
    return this.findOne({ email_confirm_token: token });
  }

  async findByResetToken(token) {
    const sql = `SELECT * FROM ${this.tableName} WHERE reset_password_token = ? AND reset_password_expires > NOW() LIMIT 1`;
    const [rows] = await this.db.query(sql, [token]);
    return rows[0] || null;
  }

  async calculateRating(userId) {
    const postLikesSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) as post_score
      FROM posts p
      LEFT JOIN likes l ON l.target_type = 'post' AND l.target_id = p.id
      WHERE p.author_id = ?
    `;

    const commentLikesSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) as comment_score
      FROM comments c
      LEFT JOIN likes l ON l.target_type = 'comment' AND l.target_id = c.id
      WHERE c.author_id = ?
    `;

    const [[postRes]] = await this.db.query(postLikesSql, [userId]);
    const [[commentRes]] = await this.db.query(commentLikesSql, [userId]);

    const totalRating = Number(postRes.post_score) + Number(commentRes.comment_score);
    await this.updateById(userId, { rating: totalRating });

    return totalRating;
  }
}

module.exports = new User();
