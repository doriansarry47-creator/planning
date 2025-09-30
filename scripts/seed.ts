import { db } from "../server/db";
import { users, patients, practitioners, timeSlots } from "../shared/schema-sqlite";
import { hashPassword } from "../server/auth";

async function seed() {
  console.log("🌱 Début de l'initialisation de la base de données...");

  try {
    // Créer un administrateur par défaut
    console.log("👤 Création de l'administrateur par défaut...");
    const adminPassword = await hashPassword("admin123");
    
    await db.insert(users).values({
      username: "admin",
      email: "admin@medical.fr",
      password: adminPassword,
      fullName: "Administrateur Principal",
      role: "admin",
    });

    console.log("✅ Administrateur créé: admin@medical.fr / admin123");

    // Créer des praticiens de test
    console.log("👨‍⚕️ Création des praticiens...");
    const practitionersData = [
      {
        firstName: "Dr. Marie",
        lastName: "Dupont",
        specialization: "Médecine générale",
        email: "marie.dupont@medical.fr",
        phoneNumber: "01 23 45 67 89",
        licenseNumber: "123456789",
        biography: "Médecin généraliste avec 15 ans d'expérience",
        consultationDuration: 30,
      },
      {
        firstName: "Dr. Jean",
        lastName: "Martin", 
        specialization: "Cardiologie",
        email: "jean.martin@medical.fr",
        phoneNumber: "01 23 45 67 90",
        licenseNumber: "987654321",
        biography: "Cardiologue spécialisé en prévention cardiovasculaire",
        consultationDuration: 45,
      },
      {
        firstName: "Dr. Sophie",
        lastName: "Bernard",
        specialization: "Dermatologie",
        email: "sophie.bernard@medical.fr",
        phoneNumber: "01 23 45 67 91",
        licenseNumber: "456789123",
        biography: "Dermatologue experte en dermatologie esthétique",
        consultationDuration: 30,
      }
    ];

    const createdPractitioners = await db.insert(practitioners).values(practitionersData).returning();
    console.log(`✅ ${createdPractitioners.length} praticiens créés`);

    // Créer des créneaux horaires pour chaque praticien
    console.log("⏰ Création des créneaux horaires...");
    const timeSlotsData = [];
    
    for (const practitioner of createdPractitioners) {
      // Créneaux du lundi au vendredi, 9h-17h
      for (let day = 1; day <= 5; day++) {
        // Matin: 9h00 - 12h00
        timeSlotsData.push({
          practitionerId: practitioner.id,
          dayOfWeek: day,
          startTime: "09:00:00",
          endTime: "12:00:00",
        });
        
        // Après-midi: 14h00 - 17h00
        timeSlotsData.push({
          practitionerId: practitioner.id,
          dayOfWeek: day,
          startTime: "14:00:00",
          endTime: "17:00:00",
        });
      }
    }

    await db.insert(timeSlots).values(timeSlotsData);
    console.log(`✅ ${timeSlotsData.length} créneaux horaires créés`);

    // Créer un patient de test
    console.log("🧑‍🤝‍🧑 Création d'un patient de test...");
    const patientPassword = await hashPassword("patient123");
    
    await db.insert(patients).values({
      email: "patient@test.fr",
      password: patientPassword,
      firstName: "Pierre",
      lastName: "Durand",
      phoneNumber: "06 12 34 56 78",
      dateOfBirth: "1985-05-15",
      address: "123 Rue de la Santé, 75001 Paris",
      emergencyContact: "Marie Durand",
      emergencyPhone: "06 87 65 43 21",
    });

    console.log("✅ Patient de test créé: patient@test.fr / patient123");

    console.log("\n🎉 Initialisation de la base de données terminée avec succès!");
    console.log("\n📋 Comptes de test créés:");
    console.log("👤 Admin: admin@medical.fr / admin123");
    console.log("🧑‍🤝‍🧑 Patient: patient@test.fr / patient123");
    
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    process.exit(1);
  }
}

// Exécuter le script seulement si appelé directement
if (import.meta.url.includes(process.argv[1])) {
  seed().then(() => process.exit(0));
}

export default seed;