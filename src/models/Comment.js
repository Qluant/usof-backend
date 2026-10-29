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

    const selectUserVote = currentUserId
      ? `, MAX(CASE WHEN l.author_id = ? THEN l.type ELSE NULL END) as user_vote`
      : `, NULL as user_vote`;

    const sqlParams = currentUserId ? [currentUserId, ...values] : values;

    const sql = `
      SELECT 
        c.*,
        u.login as author_login,
        u.profile_picture as author_avatar,
        u.rating as author_rating,
        CAST(COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) AS SIGNED) as likes_count,
        CAST(COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0) AS SIGNED) as dislikes_count,
        CAST((COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0)) AS SIGNED) as score
        ${selectUserVote}
      FROM comments c
      JOIN users u ON u.id = c.author_id
      LEFT JOIN likes l ON l.target_type = 'comment' AND l.target_id = c.id
      ${whereClause}
      GROUP BY c.id, u.id
      ORDER BY c.publish_date ASC
    `;
    const [rows] = await this.db.query(sql, sqlParams);
    return rows.map((c) => ({
      ...c,
      likes_count: Number(c.likes_count) || 0,
      dislikes_count: Number(c.dislikes_count) || 0,
      score: Number(c.score) || 0
    }));
  }

  async findWithDetails(id) {
    const sql = `
      SELECT 
        c.*,
        u.login as author_login,
        u.profile_picture as author_avatar,
        u.rating as author_rating,
        CAST(COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) AS SIGNED) as likes_count,
        CAST(COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0) AS SIGNED) as dislikes_count,
        CAST((COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0)) AS SIGNED) as score
      FROM comments c
      JOIN users u ON u.id = c.author_id
      LEFT JOIN likes l ON l.target_type = 'comment' AND l.target_id = c.id
      WHERE c.id = ?
      GROUP BY c.id, u.id
    `;
    const [rows] = await this.db.query(sql, [id]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      likes_count: Number(rows[0].likes_count) || 0,
      dislikes_count: Number(rows[0].dislikes_count) || 0,
      score: Number(rows[0].score) || 0
    };
  }
}

module.exports = new Comment();
