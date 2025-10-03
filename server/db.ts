// Charger les variables d'environnement si pas déjà fait
import dotenv from "dotenv";
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Forcer l'utilisation de PostgreSQL uniquement (compatible Vercel)
let db: any;

try {
  // Utiliser Neon PostgreSQL pour toutes les environnements
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
  console.log("PostgreSQL database connection initialized");
} catch (error) {
  console.error("Database connection error:", error);
  throw new Error(`Failed to initialize database: ${error instanceof Error ? error.message : String(error)}`);
}

export { db };
export type Database = typeof db;