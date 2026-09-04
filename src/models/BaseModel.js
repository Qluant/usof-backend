const pool = require('../../config/db.config');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = pool;
  }

  async findAll(conditions = {}, orderBy = 'id DESC', limit = null, offset = null) {
    let sql = `SELECT * FROM ${this.tableName}`;
    const values = [];
    const keys = Object.keys(conditions);

    if (keys.length > 0) {
      const whereClauses = keys.map((key) => `${key} = ?`).join(' AND ');
      sql += ` WHERE ${whereClauses}`;
      values.push(...Object.values(conditions));
    }

    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }

    if (limit !== null) {
      sql += ` LIMIT ?`;
      values.push(Number(limit));

      if (offset !== null) {
        sql += ` OFFSET ?`;
        values.push(Number(offset));
      }
    }

    const [rows] = await this.db.query(sql, values);
    return rows;
  }

  async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const [rows] = await this.db.query(sql, [id]);
    return rows[0] || null;
  }

  async findOne(conditions = {}) {
    const keys = Object.keys(conditions);
    if (keys.length === 0) return null;

    const whereClauses = keys.map((key) => `${key} = ?`).join(' AND ');
    const sql = `SELECT * FROM ${this.tableName} WHERE ${whereClauses} LIMIT 1`;
    const [rows] = await this.db.query(sql, Object.values(conditions));
    return rows[0] || null;
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

    const [result] = await this.db.query(sql, values);
    return this.findById(result.insertId);
  }

  async updateById(id, data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key) => `${key} = ?`).join(', ');
    const sql = `UPDATE ${this.tableName} SET ${setClauses} WHERE id = ?`;
    await this.db.query(sql, [...Object.values(data), id]);
    return this.findById(id);
  }

  async deleteById(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const [result] = await this.db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  async count(conditions = {}) {
    let sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const values = [];
    const keys = Object.keys(conditions);

    if (keys.length > 0) {
      const whereClauses = keys.map((key) => `${key} = ?`).join(' AND ');
      sql += ` WHERE ${whereClauses}`;
      values.push(...Object.values(conditions));
    }

    const [rows] = await this.db.query(sql, values);
    return rows[0].total;
  }
}

module.exports = BaseModel;
