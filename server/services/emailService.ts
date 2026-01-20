import { Resend } from 'resend';
import { ENV } from '../_core/env';

// Initialisation du client Resend avec le token fourni par l'utilisateur
const resend = new Resend(ENV.resendApiKey || 're_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd');

export interface AppointmentEmailData {
  patientName: string;
  patientEmail: string;
  practitionerName: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason: string;
  location?: string;
  durationMinutes: number;
  price: number;
  currency: string;
  appointmentHash: string;
}

/**
 * Template d'email de confirmation de rendez-vous professionnel
 */
function getConfirmationEmailHTML(data: AppointmentEmailData): string {
  const dateFormatted = new Date(data.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const baseUrl = ENV.appUrl || 'http://localhost:5173';
  const cancelUrl = `${baseUrl}/appointments/cancel/${data.appointmentHash}`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de votre rendez-vous professionnel</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1a202c;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background-color: #f7fafc;
    }
    .wrapper {
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background-color: #2d3748;
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #2d3748;
    }
    .intro {
      margin-bottom: 32px;
      color: #4a5568;
    }
    .details-card {
      background-color: #f8fafc;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      border: 1px solid #edf2f7;
    }
    .detail-row {
      display: flex;
      margin-bottom: 16px;
      border-bottom: 1px solid #edf2f7;
      padding-bottom: 12px;
    }
    .detail-row:last-child {
      margin-bottom: 0;
      border-bottom: none;
      padding-bottom: 0;
    }
    .detail-label {
      font-weight: 600;
      color: #718096;
      width: 120px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .detail-value {
      color: #2d3748;
      font-weight: 500;
      flex: 1;
    }
    .price-tag {
      display: inline-block;
      background-color: #ebf8ff;
      color: #2b6cb0;
      padding: 4px 12px;
      border-radius: 9999px;
      font-weight: 700;
    }
    .action-section {
      text-align: center;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #edf2f7;
    }
    .button {
      display: inline-block;
      background-color: #4a5568;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      transition: background-color 0.2s;
    }
    .button-cancel {
      background-color: #ffffff;
      color: #e53e3e;
      border: 1px solid #feb2b2;
      margin-top: 15px;
    }
    .footer {
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #a0aec0;
      background-color: #f7fafc;
    }
    .contact-info {
      margin-top: 20px;
      color: #718096;
      font-style: normal;
    }
    .important-notice {
      font-size: 12px;
      color: #718096;
      margin-top: 20px;
      padding: 15px;
      background-color: #fffaf0;
      border-left: 4px solid #f6ad55;
      border-radius: 4px;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>CONFIRMATION DE RENDEZ-VOUS</h1>
      </div>
      
      <div class="content">
        <p class="greeting">Bonjour ${data.patientName},</p>
        <p class="intro">Nous avons le plaisir de vous confirmer votre prochain rendez-vous professionnel avec <strong>${data.practitionerName}</strong>.</p>
        
        <div class="details-card">
          <div class="detail-row">
            <div class="detail-label">Date</div>
            <div class="detail-value">${dateFormatted}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Horaire</div>
            <div class="detail-value">${data.startTime} — ${data.endTime}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Durée</div>
            <div class="detail-value">${data.durationMinutes} minutes</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Lieu</div>
            <div class="detail-value">${data.location || '20 rue des Jacobins, 24000 Périgueux'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Objet</div>
            <div class="detail-value">${data.reason}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Tarif</div>
            <div class="detail-value"><span class="price-tag">${data.price.toFixed(2)} ${data.currency}</span></div>
          </div>
        </div>

        <div class="important-notice">
          <strong>Note importante :</strong> En cas d'empêchement, nous vous remercions de bien vouloir nous en informer au moins 24 heures à l'avance afin de libérer ce créneau pour un autre client.
        </div>

        <div class="action-section">
          <p style="color: #718096; font-size: 14px; margin-bottom: 20px;">Vous pouvez gérer votre rendez-vous via le lien ci-dessous :</p>
          <a href="${cancelUrl}" class="button button-cancel">Annuler le rendez-vous</a>
        </div>
      </div>
      
      <div class="footer">
        <p>© 2026 ${data.practitionerName} — Services Professionnels</p>
        <div class="contact-info">
          20 rue des Jacobins, 24000 Périgueux<br>
          Tél : 06.45.15.63.68 | Email : doriansarry@yahoo.fr
        </div>
      </div>
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
CONFIRMATION DE RENDEZ-VOUS PROFESSIONNEL

Bonjour ${data.patientName},

Nous vous confirmons votre rendez-vous avec ${data.practitionerName}.

DÉTAILS DU RENDEZ-VOUS :
- Date : ${dateFormatted}
- Horaire : ${data.startTime} - ${data.endTime}
- Durée : ${data.durationMinutes} minutes
- Lieu : ${data.location || '20 rue des Jacobins, 24000 Périgueux'}
- Objet : ${data.reason}
- Tarif : ${data.price.toFixed(2)} ${data.currency}

IMPORTANT :
En cas d'empêchement, merci de nous prévenir au moins 24h à l'avance.

ANNULATION :
Pour annuler votre rendez-vous, veuillez suivre ce lien :
${cancelUrl}

CONTACT :
Adresse : 20 rue des Jacobins, 24000 Périgueux
Téléphone : 06.45.15.63.68
Email : doriansarry@yahoo.fr

Cordialement,
L'équipe de ${data.practitionerName}
  `;
}

/**
 * Envoie un email de confirmation de rendez-vous
 */
export async function sendAppointmentConfirmationEmail(
  data: AppointmentEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { data: result, error } = await resend.emails.send({
      from: 'Confirmation RDV <onboarding@resend.dev>',
      to: [data.patientEmail],
      subject: `Confirmation de votre rendez-vous - ${new Date(data.date).toLocaleDateString('fr-FR')}`,
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
      from: 'Notification Système <onboarding@resend.dev>',
      to: [practitionerEmail],
      subject: `Nouveau rendez-vous : ${data.patientName} le ${dateFormatted}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px;">
          <h2 style="color: #2d3748; border-bottom: 2px solid #edf2f7; padding-bottom: 10px;">Nouveau rendez-vous confirmé</h2>
          <p>Un nouveau rendez-vous a été enregistré dans votre agenda :</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #edf2f7;">
            <p><strong>Client :</strong> ${data.patientName} (<a href="mailto:${data.patientEmail}">${data.patientEmail}</a>)</p>
            <p><strong>Date :</strong> ${dateFormatted}</p>
            <p><strong>Horaire :</strong> ${data.startTime} - ${data.endTime} (${data.durationMinutes} min)</p>
            <p><strong>Objet :</strong> ${data.reason}</p>
            <p><strong>Tarif :</strong> ${data.price.toFixed(2)} ${data.currency}</p>
          </div>
          <p style="font-size: 12px; color: #a0aec0; margin-top: 20px;">Ceci est une notification automatique du système de réservation.</p>
        </div>
      `,
      replyTo: data.patientEmail,
    });

    if (error) {
      console.error('[Email] Erreur lors de l\'envoi au praticien:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: result?.id };

  } catch (error) {
    console.error('[Email] Erreur inattendue lors de l\'envoi au praticien:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
}
