/**
 * Système de notifications automatisées (Email & SMS)
 * Gestion des rappels, confirmations et modifications de rendez-vous
 */

import { Resend } from 'resend';

// Configuration Resend pour les emails
const resend = new Resend(process.env.RESEND_API_KEY || 're_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd');

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

interface SMSMessage {
  to: string;
  message: string;
}

interface AppointmentData {
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  practitionerName: string;
  date: string;
  startTime: string;
  endTime: string;
  service: string;
  location?: string;
  cancellationUrl?: string;
}

/**
 * Envoyer un email via Resend
 */
export async function sendEmail(data: EmailTemplate): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: 'Cabinet Médical <noreply@apaddicto.com>',
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error: any) {
    console.error('Erreur envoi email:', error);
    return {
      success: false,
      error: error.message || 'Erreur inconnue',
    };
  }
}

/**
 * Envoyer un SMS (via API SMS - à implémenter selon le provider choisi)
 * Pour l'instant, simulation
 */
export async function sendSMS(data: SMSMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // TODO: Intégrer un provider SMS (Twilio, OVH, etc.)
    console.log('SMS envoyé à:', data.to);
    console.log('Message:', data.message);
    
    // Simulation réussie
    return {
      success: true,
      messageId: `sms_${Date.now()}`,
    };
  } catch (error: any) {
    console.error('Erreur envoi SMS:', error);
    return {
      success: false,
      error: error.message || 'Erreur inconnue',
    };
  }
}

/**
 * Email de confirmation de rendez-vous
 */
export async function sendAppointmentConfirmation(appointment: AppointmentData): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5; }
        .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #6b7280; }
        .value { color: #111827; }
        .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Confirmation de Rendez-vous</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${appointment.patientName}</strong>,</p>
          <p>Votre rendez-vous a été confirmé avec succès !</p>
          
          <div class="appointment-details">
            <div class="detail-row">
              <span class="label">📅 Date :</span>
              <span class="value">${new Date(appointment.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="label">⏰ Horaire :</span>
              <span class="value">${appointment.startTime} - ${appointment.endTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">👨‍⚕️ Praticien :</span>
              <span class="value">${appointment.practitionerName}</span>
            </div>
            <div class="detail-row">
              <span class="label">🏥 Service :</span>
              <span class="value">${appointment.service}</span>
            </div>
            ${appointment.location ? `
            <div class="detail-row">
              <span class="label">📍 Lieu :</span>
              <span class="value">${appointment.location}</span>
            </div>` : ''}
          </div>

          <p><strong>⚠️ Important :</strong></p>
          <ul>
            <li>Merci d'arriver 10 minutes avant l'heure du rendez-vous</li>
            <li>Pensez à apporter vos documents médicaux si nécessaire</li>
            <li>En cas d'empêchement, merci de nous prévenir au moins 24h à l'avance</li>
          </ul>

          ${appointment.cancellationUrl ? `
          <center>
            <a href="${appointment.cancellationUrl}" class="button">🚫 Annuler le rendez-vous</a>
          </center>
          ` : ''}

          <p>Nous vous remercions de votre confiance.</p>
          <p>Cordialement,<br>L'équipe du Cabinet</p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          <p>Pour toute question, contactez-nous au 06.45.15.63.68</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailResult = await sendEmail({
    to: appointment.patientEmail,
    subject: `✅ Confirmation de votre rendez-vous le ${new Date(appointment.date).toLocaleDateString('fr-FR')}`,
    html,
  });

  // SMS de confirmation (optionnel)
  if (appointment.patientPhone) {
    const smsMessage = `✅ Rendez-vous confirmé le ${new Date(appointment.date).toLocaleDateString('fr-FR')} à ${appointment.startTime} avec ${appointment.practitionerName}. À bientôt !`;
    await sendSMS({
      to: appointment.patientPhone,
      message: smsMessage,
    });
  }

  console.log('Confirmation envoyée:', emailResult);
}

/**
 * Rappel 24h avant le rendez-vous
 */
export async function sendAppointmentReminder24h(appointment: AppointmentData): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Rappel de Rendez-vous</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${appointment.patientName}</strong>,</p>
          <p>⏰ <strong>Votre rendez-vous est dans 24 heures !</strong></p>
          
          <div class="appointment-details">
            <p><strong>📅 Demain, ${new Date(appointment.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></p>
            <p><strong>⏰ ${appointment.startTime} - ${appointment.endTime}</strong></p>
            <p>👨‍⚕️ ${appointment.practitionerName}</p>
          </div>

          <p>Nous vous attendons avec plaisir. Pensez à arriver 10 minutes en avance.</p>
          
          ${appointment.cancellationUrl ? `
          <p>En cas d'empêchement, vous pouvez <a href="${appointment.cancellationUrl}">annuler votre rendez-vous ici</a>.</p>
          ` : ''}

          <p>À très bientôt !</p>
        </div>
        <div class="footer">
          <p>Cabinet Médical - 06.45.15.63.68</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: appointment.patientEmail,
    subject: `🔔 Rappel : Rendez-vous demain à ${appointment.startTime}`,
    html,
  });

  // SMS rappel
  if (appointment.patientPhone) {
    const smsMessage = `🔔 Rappel : RDV demain ${appointment.startTime} avec ${appointment.practitionerName}. À très bientôt !`;
    await sendSMS({
      to: appointment.patientPhone,
      message: smsMessage,
    });
  }
}

/**
 * Rappel 48h avant le rendez-vous
 */
export async function sendAppointmentReminder48h(appointment: AppointmentData): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Rendez-vous à venir</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${appointment.patientName}</strong>,</p>
          <p>📋 Nous vous rappelons que votre rendez-vous aura lieu <strong>dans 2 jours</strong>.</p>
          
          <p><strong>📅 ${new Date(appointment.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></p>
          <p><strong>⏰ ${appointment.startTime}</strong></p>
          <p>👨‍⚕️ ${appointment.practitionerName}</p>

          <p>Nous vous attendons avec plaisir.</p>
        </div>
        <div class="footer">
          <p>Cabinet Médical - 06.45.15.63.68</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: appointment.patientEmail,
    subject: `📋 Rendez-vous dans 2 jours - ${new Date(appointment.date).toLocaleDateString('fr-FR')}`,
    html,
  });
}

/**
 * Notification de modification de rendez-vous
 */
export async function sendAppointmentModification(appointment: AppointmentData, oldDate: string, oldTime: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .old-details { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 10px 0; text-decoration: line-through; }
        .new-details { background: #d1fae5; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔄 Modification de Rendez-vous</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${appointment.patientName}</strong>,</p>
          <p>⚠️ Votre rendez-vous a été modifié :</p>
          
          <div class="old-details">
            <p><strong>Ancien créneau :</strong></p>
            <p>📅 ${new Date(oldDate).toLocaleDateString('fr-FR')} à ${oldTime}</p>
          </div>

          <div class="new-details">
            <p><strong>✅ Nouveau créneau :</strong></p>
            <p>📅 ${new Date(appointment.date).toLocaleDateString('fr-FR')} à ${appointment.startTime}</p>
            <p>👨‍⚕️ ${appointment.practitionerName}</p>
          </div>

          <p>Si vous ne pouvez pas honorer ce nouveau créneau, merci de nous contacter au plus vite.</p>
        </div>
        <div class="footer">
          <p>Cabinet Médical - 06.45.15.63.68</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: appointment.patientEmail,
    subject: `🔄 Modification de votre rendez-vous`,
    html,
  });

  // SMS modification
  if (appointment.patientPhone) {
    const smsMessage = `🔄 Votre RDV a été modifié : ${new Date(appointment.date).toLocaleDateString('fr-FR')} à ${appointment.startTime}. Appelez-nous si problème : 06.45.15.63.68`;
    await sendSMS({
      to: appointment.patientPhone,
      message: smsMessage,
    });
  }
}

/**
 * Notification d'annulation de rendez-vous
 */
export async function sendAppointmentCancellation(appointment: AppointmentData, reason?: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .reason-box { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444; }
        .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Annulation de Rendez-vous</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${appointment.patientName}</strong>,</p>
          <p>Votre rendez-vous prévu le <strong>${new Date(appointment.date).toLocaleDateString('fr-FR')}</strong> à <strong>${appointment.startTime}</strong> a été annulé.</p>
          
          ${reason ? `
          <div class="reason-box">
            <p><strong>Motif :</strong> ${reason}</p>
          </div>
          ` : ''}

          <p>Pour reprendre un nouveau rendez-vous, n'hésitez pas à nous contacter.</p>

          <center>
            <a href="${process.env.APP_URL}/book" class="button">📅 Reprendre un rendez-vous</a>
          </center>

          <p>Cordialement,<br>L'équipe du Cabinet</p>
        </div>
        <div class="footer">
          <p>Cabinet Médical - 06.45.15.63.68</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: appointment.patientEmail,
    subject: `❌ Annulation de votre rendez-vous`,
    html,
  });

  // SMS annulation
  if (appointment.patientPhone) {
    const smsMessage = `❌ Votre RDV du ${new Date(appointment.date).toLocaleDateString('fr-FR')} à ${appointment.startTime} a été annulé${reason ? `: ${reason}` : ''}. Contactez-nous : 06.45.15.63.68`;
    await sendSMS({
      to: appointment.patientPhone,
      message: smsMessage,
    });
  }
}

/**
 * Planifier les rappels automatiques pour un rendez-vous
 * À intégrer avec un système de cron/scheduler (node-cron, Bull, etc.)
 */
export async function scheduleAppointmentReminders(appointmentId: number, appointment: AppointmentData): Promise<void> {
  const appointmentDate = new Date(appointment.date + 'T' + appointment.startTime);
  const now = new Date();
  
  // Calculer les moments des rappels
  const reminder48h = new Date(appointmentDate.getTime() - (48 * 60 * 60 * 1000));
  const reminder24h = new Date(appointmentDate.getTime() - (24 * 60 * 60 * 1000));

  // TODO: Intégrer avec un système de queue (Bull, BullMQ) ou cron
  console.log('Rappels planifiés pour le rendez-vous', appointmentId);
  console.log('- Rappel 48h:', reminder48h.toISOString());
  console.log('- Rappel 24h:', reminder24h.toISOString());
  
  // Exemple d'implémentation avec node-cron:
  /*
  import cron from 'node-cron';
  
  if (reminder48h > now) {
    cron.schedule(reminder48h, () => {
      sendAppointmentReminder48h(appointment);
    });
  }
  
  if (reminder24h > now) {
    cron.schedule(reminder24h, () => {
      sendAppointmentReminder24h(appointment);
    });
  }
  */
}
