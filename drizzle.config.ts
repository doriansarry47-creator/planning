import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Détecter le type de base de données
const isSqlite = process.env.DATABASE_URL?.startsWith("file:");

export default defineConfig({
  out: "./migrations",
  schema: isSqlite ? "./shared/schema-sqlite.ts" : "./shared/schema.ts",
  dialect: isSqlite ? "sqlite" : "postgresql",
  dbCredentials: isSqlite ? 
    { url: process.env.DATABASE_URL } :
    { url: process.env.DATABASE_URL },
});
