import { drizzle } from "drizzle-orm/mysql2";
import { users, specialties } from "../drizzle/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

/**
 * Script de seed pour créer le compte administrateur initial
 * et les données de base de l'application
 */

async function seedAdmin() {
  console.log("🌱 Démarrage du seed de la base de données...");

  // Vérifier la présence de DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL non définie dans les variables d'environnement");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  try {
    // 1. Créer le compte administrateur
    console.log("👤 Création du compte administrateur...");
    
    const adminEmail = "doriansarry@yahoo.fr";
    const adminPassword = "admin123";
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("ℹ️  Le compte administrateur existe déjà");
      
      // Mettre à jour le mot de passe si nécessaire
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await db
        .update(users)
        .set({
          password: hashedPassword,
          role: "admin",
          isActive: true,
          loginMethod: "local",
          lastSignedIn: new Date(),
        })
        .where(eq(users.email, adminEmail));
      
      console.log("✅ Compte administrateur mis à jour");
    } else {
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Créer le compte admin
      await db.insert(users).values({
        openId: null,
        name: "Administrateur",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        loginMethod: "local",
        isActive: true,
        lastSignedIn: new Date(),
      });
      
      console.log("✅ Compte administrateur créé avec succès");
    }

    // 2. Créer des spécialités médicales par défaut
    console.log("🏥 Création des spécialités médicales...");
    
    const defaultSpecialties = [
      {
        name: "Thérapie Sensori-Motrice",
        description: "Approche thérapeutique basée sur les sensations corporelles et le mouvement",
        isActive: true,
      },
      {
        name: "Psychothérapie",
        description: "Traitement des troubles mentaux et émotionnels par des méthodes psychologiques",
        isActive: true,
      },
      {
        name: "Psychologie Clinique",
        description: "Évaluation et traitement des troubles psychologiques et comportementaux",
        isActive: true,
      },
      {
        name: "Thérapie Cognitive et Comportementale (TCC)",
        description: "Approche thérapeutique visant à modifier les pensées et comportements dysfonctionnels",
        isActive: true,
      },
      {
        name: "Thérapie Familiale",
        description: "Approche thérapeutique centrée sur les dynamiques familiales",
        isActive: true,
      },
    ];

    for (const specialty of defaultSpecialties) {
      // Vérifier si la spécialité existe déjà
      const existing = await db
        .select()
        .from(specialties)
        .where(eq(specialties.name, specialty.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(specialties).values(specialty);
        console.log(`   ✓ Spécialité créée: ${specialty.name}`);
      } else {
        console.log(`   ℹ️  Spécialité existe déjà: ${specialty.name}`);
      }
    }

    console.log("\n✅ Seed terminé avec succès!");
    console.log("\n📋 Informations de connexion admin:");
    console.log("   Email: doriansarry@yahoo.fr");
    console.log("   Mot de passe: admin123");
    console.log("\n⚠️  N'oubliez pas de changer le mot de passe après la première connexion!\n");

  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    throw error;
  }
}

// Exécuter le seed
seedAdmin()
  .then(() => {
    console.log("✨ Seed complété");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
