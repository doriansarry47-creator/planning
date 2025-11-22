#!/usr/bin/env tsx
import "dotenv/config";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  console.log("🔌 Connecting to PostgreSQL database...");
  
  // Parse the connection string to use with pg Client
  const connectionString = process.env.DATABASE_URL;
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Read the SQL script
    const sqlPath = join(__dirname, "init-postgres.sql");
    console.log(`📄 Reading SQL script from: ${sqlPath}`);
    
    const sql = readFileSync(sqlPath, "utf-8");
    
    console.log("🚀 Executing SQL script...");
    await client.query(sql);
    
    console.log("✅ Database initialized successfully!");
    console.log("\n📊 Tables created:");
    console.log("  - users");
    console.log("  - practitioners");
    console.log("  - specialties");
    console.log("  - serviceCategories");
    console.log("  - services");
    console.log("  - practitionerServices");
    console.log("  - workingPlans");
    console.log("  - blockedPeriods");
    console.log("  - availabilitySlots");
    console.log("  - timeOff");
    console.log("  - appointments");
    console.log("  - adminLogs");
    console.log("  - settings");
    console.log("  - webhooks");
    console.log("  - googleCalendarSync");
    console.log("\n🔍 Default settings inserted");
    
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("👋 Database connection closed");
  }
}

initDatabase();
