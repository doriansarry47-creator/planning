import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mockDb } from '../_lib/mock-db';
import { sendSMS, formatPhoneNumber, createAppointmentReminderSMS } from '../_lib/sms';
import { sendAppointmentReminder } from '../_lib/email';
import { successResponse, errorResponse } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vérifier que c'est bien un appel cron (sécurité basique)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse(res, 'Unauthorized', 401);
  }

  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Récupérer tous les rendez-vous de demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const tomorrowAppointments = await mockDb.findAppointmentsByDateRange(
      tomorrow.toISOString(),
      dayAfter.toISOString()
    );

    const remindersSent = {
      sms: 0,
      email: 0,
      errors: 0
    };

    // Envoyer un rappel pour chaque rendez-vous
    for (const appointment of tomorrowAppointments) {
      // Ignorer les rendez-vous annulés
      if (appointment.status === 'cancelled') {
        continue;
      }

      try {
        const patient = await mockDb.findPatientById(appointment.patientId);
        if (!patient) {
          console.error(`Patient non trouvé pour le rendez-vous ${appointment.id}`);
          remindersSent.errors++;
          continue;
        }

        const appointmentDate = new Date(appointment.date);
        const dateStr = appointmentDate.toLocaleDateString('fr-FR');
        const timeStr = appointmentDate.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        // Envoyer SMS si numéro disponible
        if (patient.phone) {
          try {
            const formattedPhone = formatPhoneNumber(patient.phone);
            const smsMessage = createAppointmentReminderSMS(
              patient.firstName,
              dateStr,
              timeStr
            );
            
            const smsSuccess = await sendSMS({
              to: formattedPhone,
              message: smsMessage
            });

            if (smsSuccess) {
              remindersSent.sms++;
            } else {
              remindersSent.errors++;
            }
          } catch (smsError) {
            console.error(`Erreur SMS pour le patient ${patient.id}:`, smsError);
            remindersSent.errors++;
          }
        }

        // Envoyer email si adresse disponible
        if (patient.email) {
          try {
            await sendAppointmentReminder(
              patient.email,
              `${patient.firstName} ${patient.lastName}`,
              dateStr,
              timeStr,
              appointment.type
            );
            remindersSent.email++;
          } catch (emailError) {
            console.error(`Erreur email pour le patient ${patient.id}:`, emailError);
            remindersSent.errors++;
          }
        }

        // Marquer le rappel comme envoyé dans la base de données
        await mockDb.updateAppointment(appointment.id, {
          reminderSent: true,
          reminderSentAt: new Date().toISOString()
        });

      } catch (error) {
        console.error(`Erreur lors du traitement du rendez-vous ${appointment.id}:`, error);
        remindersSent.errors++;
      }
    }

    return successResponse(res, {
      message: `Rappels envoyés avec succès`,
      appointmentsProcessed: tomorrowAppointments.length,
      remindersSent,
      date: tomorrow.toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi des rappels:', error);
    return errorResponse(res, 'Erreur lors de l\'envoi des rappels');
  }
}

// Fonction utilitaire pour les tests manuels
export async function sendRemindersForDate(targetDate: Date) {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  return await mockDb.findAppointmentsByDateRange(
    startOfDay.toISOString(),
    endOfDay.toISOString()
  );
}