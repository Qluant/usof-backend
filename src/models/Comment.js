const BaseModel = require('./BaseModel');

class Comment extends BaseModel {
  constructor() {
    super('comments');
  }

  async findByPostId(postId, userRole = 'user', currentUserId = null) {
    let whereClause = `WHERE c.post_id = ?`;
    let values = [postId];

    if (userRole !== 'admin') {
      if (currentUserId) {
        whereClause += ` AND (c.status = 'active' OR c.author_id = ?)`;
        values.push(currentUserId);
      } else {
        whereClause += ` AND c.status = 'active'`;
      }
    }

    const sql = `
      SELECT 
        c.*,
        u.login as author_login,
        u.profile_picture as author_avatar,
        u.rating as author_rating,
        COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) as likes_count,
        COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0) as dislikes_count,
        (COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0)) as score
      FROM comments c
      JOIN users u ON u.id = c.author_id
      LEFT JOIN likes l ON l.target_type = 'comment' AND l.target_id = c.id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.publish_date ASC
    `;
    const [rows] = await this.db.query(sql, values);
    return rows;
  }

  async findWithDetails(id) {
    const sql = `
      SELECT 
        c.*,
        u.login as author_login,
        u.profile_picture as author_avatar,
        u.rating as author_rating,
        COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) as likes_count,
        COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0) as dislikes_count,
        (COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0)) as score
      FROM comments c
      JOIN users u ON u.id = c.author_id
      LEFT JOIN likes l ON l.target_type = 'comment' AND l.target_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
    `;
    const [rows] = await this.db.query(sql, [id]);
    return rows[0] || null;
  }
}

module.exports = new Comment();
