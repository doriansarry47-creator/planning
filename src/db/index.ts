import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Fonction pour obtenir la connexion DB avec la DATABASE_URL
export function getDb(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export type DB = ReturnType<typeof getDb>;
