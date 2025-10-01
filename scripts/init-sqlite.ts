import dotenv from "dotenv";
dotenv.config();

import { db } from "../server/db";
import * as schema from "../shared/schema-sqlite";
import bcrypt from "bcryptjs";

async function initializeDatabase() {
  console.log("🚀 Initialisation de la base de données SQLite...");

  try {
    // Créer un administrateur de test
    const adminHashedPassword = await bcrypt.hash("admin123", 12);
    const adminId = "admin-" + Date.now().toString(36);
    
    await db.insert(schema.users).values({
      id: adminId,
      username: "admin",
      email: "admin@medical.fr",
      password: adminHashedPassword,
      fullName: "Administrateur Médical",
      role: "admin",
    }).onConflictDoNothing();

    // Créer un patient de test
    const patientHashedPassword = await bcrypt.hash("patient123", 12);
    const patientId = "patient-" + Date.now().toString(36);

    await db.insert(schema.patients).values({
      id: patientId,
      email: "patient@test.fr",
      password: patientHashedPassword,
      firstName: "Jean",
      lastName: "Dupont",
      phoneNumber: "0123456789",
      dateOfBirth: "1985-05-15",
      address: "123 Rue de la Santé, 75014 Paris",
    }).onConflictDoNothing();

    // Créer un praticien de test
    const practitionerId = "practitioner-" + Date.now().toString(36);
    await db.insert(schema.practitioners).values({
      id: practitionerId,
      firstName: "Dorian",
      lastName: "Sarry",
      specialization: "Thérapie sensori-motrice",
      email: "dorian.sarry@therapy.fr",
      phoneNumber: "0145678901",
      licenseNumber: "PSY123456",
      biography: "Spécialiste en thérapie sensori-motrice et traitement du psycho-traumatisme. Approche moderne et bienveillante pour votre bien-être émotionnel.",
      consultationDuration: 45,
    }).onConflictDoNothing();

    // Créer des créneaux horaires de base
    const timeSlots = [
      { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" }, // Lundi matin
      { dayOfWeek: 1, startTime: "14:00", endTime: "18:00" }, // Lundi après-midi
      { dayOfWeek: 2, startTime: "09:00", endTime: "12:00" }, // Mardi matin
      { dayOfWeek: 2, startTime: "14:00", endTime: "18:00" }, // Mardi après-midi
      { dayOfWeek: 3, startTime: "09:00", endTime: "12:00" }, // Mercredi matin
      { dayOfWeek: 4, startTime: "09:00", endTime: "12:00" }, // Jeudi matin
      { dayOfWeek: 4, startTime: "14:00", endTime: "18:00" }, // Jeudi après-midi
      { dayOfWeek: 5, startTime: "09:00", endTime: "12:00" }, // Vendredi matin
    ];

    for (const slot of timeSlots) {
      const slotId = "slot-" + Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 9);
      await db.insert(schema.timeSlots).values({
        id: slotId,
        practitionerId,
        ...slot,
      }).onConflictDoNothing();
    }

    // Créer un rendez-vous d'exemple pour demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointmentDate = tomorrow.toISOString().split('T')[0]; // Format YYYY-MM-DD

    const appointmentId = "appointment-" + Date.now().toString(36);
    await db.insert(schema.appointments).values({
      id: appointmentId,
      patientId,
      practitionerId,
      appointmentDate,
      startTime: "10:00",
      endTime: "10:45",
      reason: "Première consultation - Évaluation initiale",
      status: "scheduled",
    }).onConflictDoNothing();

    console.log("✅ Base de données initialisée avec succès !");
    console.log("📋 Comptes créés :");
    console.log("   👨‍💼 Admin: admin@medical.fr / admin123");
    console.log("   👤 Patient: patient@test.fr / patient123");
    console.log("   👨‍⚕️ Praticien: Dorian Sarry (Thérapie sensori-motrice)");
    console.log("   📅 Rendez-vous d'exemple créé pour demain à 10h00");
    
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation :", error);
    process.exit(1);
  }
}

// Lancer l'initialisation si ce script est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase().then(() => {
    console.log("🎉 Initialisation terminée");
    process.exit(0);
  });
}