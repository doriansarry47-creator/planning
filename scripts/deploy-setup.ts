import { db } from "../server/db.js";
import { users } from "../shared/schema.js";
import { hashPassword } from "../server/auth.js";
import { eq } from "drizzle-orm";

async function setupForDeployment() {
  console.log("🚀 Configuration pour le déploiement...");

  try {
    // Vérifier la connexion à la base de données
    console.log("🔗 Test de connexion à la base de données...");
    
    const adminEmail = "doriansarry47@gmail.com";
    const adminPassword = "admin123";
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log("⚠️  L'administrateur existe déjà");
      
      // Mettre à jour le mot de passe
      const hashedPassword = await hashPassword(adminPassword);
      await db.update(users)
        .set({ 
          password: hashedPassword,
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.email, adminEmail));
      
      console.log("✅ Compte administrateur mis à jour");
    } else {
      // Créer l'administrateur
      const hashedPassword = await hashPassword(adminPassword);
      
      const newAdmin = await db.insert(users).values({
        username: "doriansarry47",
        email: adminEmail,
        password: hashedPassword,
        fullName: "Dorian Sarry",
        role: "admin",
        isActive: true
      }).returning();
      
      console.log("✅ Administrateur créé avec succès");
    }

    console.log("\n🎯 Déploiement prêt!");
    console.log("📋 Informations de connexion:");
    console.log("👤 Email: doriansarry47@gmail.com");
    console.log("🔑 Mot de passe: admin123");
    console.log("🌐 Endpoint de connexion: /api/auth/login/admin");
    
    // Test des endpoints principaux
    console.log("\n📡 Endpoints API disponibles:");
    console.log("  POST /api/auth/register/patient");
    console.log("  POST /api/auth/register/admin");  
    console.log("  POST /api/auth/login/patient");
    console.log("  POST /api/auth/login/admin");
    console.log("  GET  /api/auth/verify");
    console.log("  GET  /api/health");
    console.log("  GET  /api/practitioners");
    console.log("  GET  /api/appointments");
    console.log("  GET  /api/patients");

    return {
      success: true,
      admin: {
        email: adminEmail,
        password: adminPassword
      }
    };
    
  } catch (error) {
    console.error("❌ Erreur lors de la configuration:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Exporter pour utilisation dans d'autres scripts
export { setupForDeployment };

// Exécuter si appelé directement
if (import.meta.url.includes(process.argv[1])) {
  setupForDeployment()
    .then((result) => {
      if (result.success) {
        console.log("\n🎉 Configuration terminée avec succès!");
        process.exit(0);
      } else {
        console.error("\n❌ Configuration échouée:", result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Erreur fatale:", error);
      process.exit(1);
    });
}