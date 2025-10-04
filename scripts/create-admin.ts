import { db } from "../server/db.js";
import { users } from "../shared/schema.js";
import { hashPassword } from "../server/auth.js";
import { eq } from "drizzle-orm";

async function createAdmin() {
  console.log("🔧 Création du compte administrateur...");

  try {
    const adminEmail = "doriansarry47@gmail.com";
    const adminPassword = "admin123";
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log("⚠️  L'administrateur existe déjà avec cet email");
      
      // Mettre à jour le mot de passe
      const hashedPassword = await hashPassword(adminPassword);
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, adminEmail));
      
      console.log("✅ Mot de passe administrateur mis à jour");
    } else {
      // Créer un nouvel administrateur
      const hashedPassword = await hashPassword(adminPassword);
      
      await db.insert(users).values({
        username: "doriansarry47",
        email: adminEmail,
        password: hashedPassword,
        fullName: "Dorian Sarry",
        role: "admin",
      });
      
      console.log("✅ Administrateur créé avec succès");
    }

    console.log("\n📋 Informations de connexion admin:");
    console.log("👤 Email: doriansarry47@gmail.com");
    console.log("🔑 Mot de passe: admin123");
    console.log("🔗 URL de connexion: /auth/login/admin");
    
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'administrateur:", error);
    process.exit(1);
  }
}

// Exécuter le script seulement si appelé directement
if (import.meta.url.includes(process.argv[1])) {
  createAdmin().then(() => {
    console.log("🎉 Script terminé avec succès!");
    process.exit(0);
  });
}

export default createAdmin;