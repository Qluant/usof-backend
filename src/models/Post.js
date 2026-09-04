const BaseModel = require('./BaseModel');

class Post extends BaseModel {
  constructor() {
    super('posts');
  }

  async findWithDetails(id) {
    const sql = `
      SELECT 
        p.*,
        u.login as author_login,
        u.profile_picture as author_avatar,
        u.rating as author_rating,
        COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) as likes_count,
        COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0) as dislikes_count,
        (COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0)) as score
      FROM posts p
      JOIN users u ON u.id = p.author_id
      LEFT JOIN likes l ON l.target_type = 'post' AND l.target_id = p.id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    const [rows] = await this.db.query(sql, [id]);
    if (!rows[0]) return null;

    const post = rows[0];
    const catSql = `
      SELECT c.id, c.title 
      FROM categories c
      JOIN post_categories pc ON pc.category_id = c.id
      WHERE pc.post_id = ?
    `;
    const [categories] = await this.db.query(catSql, [id]);
    post.categories = categories;

    return post;
  }

  async findPostsAdvanced({
    status = null,
    categoryId = null,
    dateFrom = null,
    dateTo = null,
    sortBy = 'likes',
    order = 'DESC',
    page = 1,
    limit = 10,
    search = null,
    authorId = null,
    userRole = 'user',
    currentUserId = null
  }) {
    let whereClauses = [];
    let values = [];

    if (userRole !== 'admin') {
      if (currentUserId) {
        whereClauses.push(`(p.status = 'active' OR p.author_id = ?)`);
        values.push(currentUserId);
      } else {
        whereClauses.push(`p.status = 'active'`);
      }
    } else if (status) {
      whereClauses.push(`p.status = ?`);
      values.push(status);
    }

    if (authorId) {
      whereClauses.push(`p.author_id = ?`);
      values.push(authorId);
    }

    if (dateFrom) {
      whereClauses.push(`p.publish_date >= ?`);
      values.push(dateFrom);
    }

    if (dateTo) {
      whereClauses.push(`p.publish_date <= ?`);
      values.push(dateTo);
    }

    if (search) {
      whereClauses.push(`(p.title LIKE ? OR p.content LIKE ?)`);
      values.push(`%${search}%`, `%${search}%`);
    }

    let joinCategory = '';
    if (categoryId) {
      joinCategory = `JOIN post_categories pc_filter ON pc_filter.post_id = p.id AND pc_filter.category_id = ?`;
      values.unshift(categoryId);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      ${joinCategory}
      ${whereSql}
    `;

    const [[countResult]] = await this.db.query(countSql, values);
    const total = countResult.total;

    let orderClause = 'score DESC';
    const sortDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    if (sortBy === 'date') {
      orderClause = `p.publish_date ${sortDirection}`;
    } else if (sortBy === 'likes') {
      orderClause = `score ${sortDirection}, p.publish_date DESC`;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const dataSql = `
      SELECT 
        p.*,
        u.login as author_login,
        u.profile_picture as author_avatar,
        u.rating as author_rating,
        COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) as likes_count,
        COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0) as dislikes_count,
        (COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN l.type = 'dislike' THEN 1 ELSE 0 END), 0)) as score
      FROM posts p
      JOIN users u ON u.id = p.author_id
      ${joinCategory}
      LEFT JOIN likes l ON l.target_type = 'post' AND l.target_id = p.id
      ${whereSql}
      GROUP BY p.id
      ORDER BY ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const dataValues = [...values, Number(limit), Number(offset)];
    const [posts] = await this.db.query(dataSql, dataValues);

    for (const post of posts) {
      const catSql = `
        SELECT c.id, c.title 
        FROM categories c
        JOIN post_categories pc ON pc.category_id = c.id
        WHERE pc.post_id = ?
      `;
      const [cats] = await this.db.query(catSql, [post.id]);
      post.categories = cats;
    }

    return {
      posts,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    };
  }

  async setCategories(postId, categoryIds) {
    await this.db.query('DELETE FROM post_categories WHERE post_id = ?', [postId]);
    if (categoryIds && categoryIds.length > 0) {
      const values = categoryIds.map((catId) => [postId, catId]);
      await this.db.query('INSERT INTO post_categories (post_id, category_id) VALUES ?', [values]);
    }
  }
}

module.exports = new Post();
