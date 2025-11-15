import { Resend } from 'resend';
import { ENV } from '../_core/env';

// Initialisation du client Resend avec le token
const resend = new Resend(ENV.resendApiKey || 're_9tQBWc3R_FW1eBULbk2igSshem5z9wpq8');

export interface AppointmentEmailData {
  patientName: string;
  patientEmail: string;
  practitionerName: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason: string;
  location?: string;
  appointmentHash: string;
}

/**
 * Template d'email de confirmation de rendez-vous
 */
function getConfirmationEmailHTML(data: AppointmentEmailData): string {
  const dateFormatted = new Date(data.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // URL de base pour l'annulation (à adapter selon votre environnement)
  const baseUrl = ENV.appUrl || 'http://localhost:5173';
  const cancelUrl = `${baseUrl}/appointments/cancel/${data.appointmentHash}`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de rendez-vous</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f7fa;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      color: #64748b;
      margin: 5px 0 0 0;
      font-size: 16px;
    }
    .info-box {
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .info-row {
      display: flex;
      margin: 12px 0;
      align-items: flex-start;
    }
    .info-label {
      font-weight: 600;
      color: #1e40af;
      min-width: 140px;
      display: inline-block;
    }
    .info-value {
      color: #334155;
      flex: 1;
    }
    .important-note {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 25px 0;
      border-radius: 6px;
    }
    .important-note p {
      margin: 0;
      color: #92400e;
      font-size: 14px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #dc2626;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #b91c1c;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 14px;
    }
    .contact-info {
      background-color: #f8fafc;
      padding: 20px;
      border-radius: 6px;
      margin-top: 25px;
    }
    .contact-info h3 {
      color: #1e40af;
      margin-top: 0;
      font-size: 18px;
    }
    .contact-item {
      margin: 8px 0;
      color: #475569;
    }
    .emoji {
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Rendez-vous confirmé</h1>
      <p>Votre rendez-vous a été enregistré avec succès</p>
    </div>

    <p>Bonjour <strong>${data.patientName}</strong>,</p>
    
    <p>Nous vous confirmons votre rendez-vous avec <strong>${data.practitionerName}</strong>, praticien certifié en Thérapie Sensori-Motrice.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">📅 Date :</span>
        <span class="info-value">${dateFormatted}</span>
      </div>
      <div class="info-row">
        <span class="info-label">🕐 Heure :</span>
        <span class="info-value">${data.startTime} - ${data.endTime}</span>
      </div>
      <div class="info-row">
        <span class="info-label">👨‍⚕️ Praticien :</span>
        <span class="info-value">${data.practitionerName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">💬 Motif :</span>
        <span class="info-value">${data.reason}</span>
      </div>
      ${data.location ? `
      <div class="info-row">
        <span class="info-label">📍 Lieu :</span>
        <span class="info-value">${data.location}</span>
      </div>
      ` : ''}
    </div>

    <div class="important-note">
      <p><strong>⚠️ Important :</strong> Si vous ne pouvez pas vous présenter à ce rendez-vous, merci de nous prévenir au moins 24h à l'avance.</p>
    </div>

    <div class="contact-info">
      <h3>Informations de contact</h3>
      <div class="contact-item">
        <span class="emoji">📍</span> 20 rue des Jacobins, 24000 Périgueux
      </div>
      <div class="contact-item">
        <span class="emoji">📞</span> <a href="tel:+33645156368" style="color: #2563eb; text-decoration: none;">06.45.15.63.68</a>
      </div>
      <div class="contact-item">
        <span class="emoji">✉️</span> <a href="mailto:doriansarry@yahoo.fr" style="color: #2563eb; text-decoration: none;">doriansarry@yahoo.fr</a>
      </div>
    </div>

    <div class="button-container">
      <a href="${cancelUrl}" class="button">Annuler le rendez-vous</a>
    </div>

    <div class="footer">
      <p>© 2025 Dorian Sarry - Thérapie Sensori-Motrice</p>
      <p style="margin-top: 10px;">
        <em>Cet email a été envoyé automatiquement suite à votre réservation de rendez-vous.</em>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template d'email de confirmation de rendez-vous (version texte)
 */
function getConfirmationEmailText(data: AppointmentEmailData): string {
  const dateFormatted = new Date(data.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const baseUrl = ENV.appUrl || 'http://localhost:5173';
  const cancelUrl = `${baseUrl}/appointments/cancel/${data.appointmentHash}`;

  return `
Confirmation de rendez-vous

Bonjour ${data.patientName},

Nous vous confirmons votre rendez-vous avec ${data.practitionerName}, praticien certifié en Thérapie Sensori-Motrice.

DÉTAILS DU RENDEZ-VOUS
----------------------
Date : ${dateFormatted}
Heure : ${data.startTime} - ${data.endTime}
Praticien : ${data.practitionerName}
Motif : ${data.reason}
${data.location ? `Lieu : ${data.location}` : ''}

IMPORTANT
---------
Si vous ne pouvez pas vous présenter à ce rendez-vous, merci de nous prévenir au moins 24h à l'avance.

INFORMATIONS DE CONTACT
------------------------
Adresse : 20 rue des Jacobins, 24000 Périgueux
Téléphone : 06.45.15.63.68
Email : doriansarry@yahoo.fr

Pour annuler votre rendez-vous, cliquez sur ce lien :
${cancelUrl}

---
© 2025 Dorian Sarry - Thérapie Sensori-Motrice
Cet email a été envoyé automatiquement suite à votre réservation de rendez-vous.
  `;
}

/**
 * Envoie un email de confirmation de rendez-vous
 */
export async function sendAppointmentConfirmationEmail(
  data: AppointmentEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Vérifier que le service est configuré
    if (!ENV.resendApiKey && resend.apiKey === 're_9tQBWc3R_FW1eBULbk2igSshem5z9wpq8') {
      console.log('[Email] Utilisation du token Resend par défaut');
    }

    const { data: result, error } = await resend.emails.send({
      from: 'Dorian Sarry - Thérapie <onboarding@resend.dev>', // À personnaliser avec votre domaine
      to: [data.patientEmail],
      subject: `Confirmation de rendez-vous - ${new Date(data.date).toLocaleDateString('fr-FR')}`,
      html: getConfirmationEmailHTML(data),
      text: getConfirmationEmailText(data),
      replyTo: 'doriansarry@yahoo.fr',
    });

    if (error) {
      console.error('[Email] Erreur lors de l\'envoi:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Email de confirmation envoyé avec succès:', result?.id);
    return { success: true, messageId: result?.id };

  } catch (error) {
    console.error('[Email] Erreur inattendue lors de l\'envoi:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
}

/**
 * Envoie un email de notification au praticien
 */
export async function sendAppointmentNotificationToPractitioner(
  data: AppointmentEmailData,
  practitionerEmail: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const dateFormatted = new Date(data.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const { data: result, error } = await resend.emails.send({
      from: 'Planning Rendez-vous <onboarding@resend.dev>',
      to: [practitionerEmail],
      subject: `Nouveau rendez-vous - ${data.patientName} le ${dateFormatted}`,
      html: `
        <h2>Nouveau rendez-vous</h2>
        <p>Un nouveau rendez-vous a été réservé :</p>
        <ul>
          <li><strong>Patient :</strong> ${data.patientName} (${data.patientEmail})</li>
          <li><strong>Date :</strong> ${dateFormatted}</li>
          <li><strong>Heure :</strong> ${data.startTime} - ${data.endTime}</li>
          <li><strong>Motif :</strong> ${data.reason}</li>
          ${data.location ? `<li><strong>Lieu :</strong> ${data.location}</li>` : ''}
        </ul>
      `,
      replyTo: data.patientEmail,
    });

    if (error) {
      console.error('[Email] Erreur lors de l\'envoi au praticien:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Email de notification envoyé au praticien:', result?.id);
    return { success: true, messageId: result?.id };

  } catch (error) {
    console.error('[Email] Erreur inattendue lors de l\'envoi au praticien:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
}
