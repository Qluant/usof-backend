const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT) || 3306,
    multipleStatements: true
  });

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await connection.query(schemaSql);

    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await connection.query(seedSql);

    console.log('Database initialized and seeded successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
