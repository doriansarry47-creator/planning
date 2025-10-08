if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

let db: any;

if (process.env.DATABASE_URL.startsWith('file:')) {
  // Configuration SQLite pour le développement
  const Database = require('better-sqlite3');
  const { drizzle } = require('drizzle-orm/better-sqlite3');
  const schema = require('../../shared/sqlite-schema');
  
  const sqlite = new Database('./dev.sqlite');
  db = drizzle(sqlite, { schema });
  
  console.log('Using SQLite database for development');
} else {
  // Configuration PostgreSQL pour la production
  const { neon } = require('@neondatabase/serverless');
  const { drizzle } = require('drizzle-orm/neon-http');
  const schema = require('../../shared/schema');
  
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
  
  console.log('Using PostgreSQL database for production');
}

export { db };

// Export schema based on database type
if (process.env.DATABASE_URL?.startsWith('file:')) {
  export * from '../../shared/sqlite-schema';
} else {
  export * from '../../shared/schema';
}