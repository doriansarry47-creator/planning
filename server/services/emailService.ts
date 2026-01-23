import { ENV } from '../_core/env';

// Configuration Sweego API
const SWEEGO_API_URL = 'https://api.sweego.io';
// Key ID: 1146d268-1c56-47ba-8dad-843db0bdaa7e
const SWEEGO_API_KEY = ENV.sweegoApiKey || '5282eb71-fc1d-4423-ab78-29b4e7e96052';

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
 * Design professionnel optimisé pour Sweego
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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a202c;
      background-color: #f0f4f8;
      padding: 0;
      margin: 0;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 35px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 18px;
      color: #2d3748;
    }
    .intro {
      margin-bottom: 30px;
      color: #4a5568;
      font-size: 16px;
      line-height: 1.7;
    }
    .details-card {
      background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
      border-radius: 12px;
      padding: 28px;
      margin-bottom: 30px;
      border: 2px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .detail-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 18px;
      padding-bottom: 18px;
      border-bottom: 1px solid #e2e8f0;
    }
    .detail-row:last-child {
      margin-bottom: 0;
      border-bottom: none;
      padding-bottom: 0;
    }
    .detail-icon {
      font-size: 24px;
      margin-right: 15px;
      flex-shrink: 0;
    }
    .detail-content {
      flex: 1;
    }
    .detail-label {
      font-weight: 700;
      color: #718096;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 5px;
    }
    .detail-value {
      color: #2d3748;
      font-weight: 500;
      font-size: 16px;
    }
    .detail-value strong {
      color: #1a202c;
      font-weight: 700;
    }
    .price-tag {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 8px 18px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    .important-notice {
      background: linear-gradient(to right, #fff5f5 0%, #fffaf0 100%);
      border-left: 5px solid #f6ad55;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      font-size: 14px;
      color: #744210;
    }
    .important-notice strong {
      color: #c05621;
      font-size: 15px;
    }
    .action-section {
      text-align: center;
      margin-top: 40px;
      padding-top: 35px;
      border-top: 2px solid #edf2f7;
    }
    .action-text {
      color: #718096;
      font-size: 15px;
      margin-bottom: 25px;
      line-height: 1.6;
    }
    .button-cancel {
      display: inline-block;
      background-color: #ffffff;
      color: #e53e3e;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      border: 2px solid #fc8181;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(229, 62, 62, 0.15);
    }
    .button-cancel:hover {
      background-color: #fff5f5;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(229, 62, 62, 0.25);
    }
    .footer {
      padding: 35px 30px;
      text-align: center;
      font-size: 13px;
      color: #a0aec0;
      background: linear-gradient(to bottom, #f7fafc 0%, #edf2f7 100%);
      border-top: 1px solid #e2e8f0;
    }
    .footer-brand {
      font-size: 15px;
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 15px;
    }
    .contact-info {
      margin-top: 20px;
      color: #718096;
      font-style: normal;
      line-height: 1.8;
    }
    .contact-info a {
      color: #667eea;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .wrapper { padding: 20px 10px; }
      .content { padding: 30px 25px; }
      .header { padding: 30px 20px; }
      .header h1 { font-size: 22px; }
      .details-card { padding: 20px; }
      .detail-row { flex-direction: column; }
      .detail-icon { margin-bottom: 8px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="header-icon">📅</div>
        <h1>CONFIRMATION DE RENDEZ-VOUS</h1>
      </div>
      
      <div class="content">
        <p class="greeting">Bonjour ${data.patientName},</p>
        <p class="intro">
          Nous avons le plaisir de vous confirmer votre prochain rendez-vous professionnel avec <strong>${data.practitionerName}</strong>. 
          Tous les détails de votre rendez-vous sont ci-dessous.
        </p>
        
        <div class="details-card">
          <div class="detail-row">
            <div class="detail-icon">📆</div>
            <div class="detail-content">
              <div class="detail-label">Date du rendez-vous</div>
              <div class="detail-value"><strong>${dateFormatted}</strong></div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">🕐</div>
            <div class="detail-content">
              <div class="detail-label">Horaire</div>
              <div class="detail-value"><strong>${data.startTime}</strong> → <strong>${data.endTime}</strong></div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">⏱️</div>
            <div class="detail-content">
              <div class="detail-label">Durée</div>
              <div class="detail-value"><strong>${data.durationMinutes} minutes</strong></div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">📍</div>
            <div class="detail-content">
              <div class="detail-label">Adresse</div>
              <div class="detail-value">${data.location || '20 rue des Jacobins, 24000 Périgueux'}</div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">📝</div>
            <div class="detail-content">
              <div class="detail-label">Objet de la consultation</div>
              <div class="detail-value">${data.reason}</div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">💰</div>
            <div class="detail-content">
              <div class="detail-label">Tarif de la consultation</div>
              <div class="detail-value"><span class="price-tag">${data.price.toFixed(2)} ${data.currency}</span></div>
            </div>
          </div>
        </div>

        <div class="important-notice">
          <strong>⚠️ Note importante :</strong><br>
          En cas d'empêchement, nous vous remercions de bien vouloir nous en informer au moins <strong>24 heures à l'avance</strong> afin de libérer ce créneau pour un autre client. Cette courtoisie nous permet de mieux organiser nos services.
        </div>

        <div class="action-section">
          <p class="action-text">
            Vous avez besoin d'annuler ou de modifier votre rendez-vous ?<br>
            Utilisez le bouton ci-dessous :
          </p>
          <a href="${cancelUrl}" class="button-cancel">🗑️ Annuler le rendez-vous</a>
        </div>
      </div>
      
      <div class="footer">
        <p class="footer-brand">© 2026 ${data.practitionerName} — Services Professionnels</p>
        <div class="contact-info">
          📍 20 rue des Jacobins, 24000 Périgueux<br>
          📞 <strong>06.45.15.63.68</strong><br>
          ✉️ <a href="mailto:doriansarry@yahoo.fr">doriansarry@yahoo.fr</a>
        </div>
        <p style="margin-top: 20px; font-size: 11px; color: #cbd5e0;">
          Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.<br>
          Pour toute question, contactez-nous via les coordonnées ci-dessus.
        </p>
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
 * Envoie un email de confirmation de rendez-vous via Sweego
 */
export async function sendAppointmentConfirmationEmail(
  data: AppointmentEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Utiliser un email générique pour l'envoi, qui sera configuré dans le dashboard Sweego
    // L'utilisateur devra configurer son domaine vérifié dans Sweego
    const fromEmail = 'noreply@sweego.io'; // Email par défaut Sweego pour les tests
    const dateFormatted = new Date(data.date).toLocaleDateString('fr-FR');
    
<<<<<<< HEAD
    // Format Sweego API selon la documentation officielle
=======
    // Format Sweego API - https://api.sweego.io/send
>>>>>>> 5325321 (feat: Mise à jour Sweego avec nouvelles clés API et guide de configuration)
    const payload = {
      channel: 'email',
      provider: 'sweego',
      recipients: [
        {
          email: data.patientEmail,
          name: data.patientName
        }
      ],
      from: {
        email: fromEmail,
        name: data.practitionerName
      },
      subject: `Confirmation de votre rendez-vous - ${dateFormatted}`,
      'message-html': getConfirmationEmailHTML(data),
      'message-txt': getConfirmationEmailText(data),
      'reply-to': {
        email: 'doriansarry@yahoo.fr',
        name: data.practitionerName
      }
    };

    const response = await fetch(`${SWEEGO_API_URL}/send`, {
      method: 'POST',
      headers: {
        'Api-Key': SWEEGO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Email Sweego] Erreur lors de l\'envoi:', result);
      return { 
        success: false, 
        error: result.detail || result.message || result.error_msg || `HTTP ${response.status}: ${response.statusText}` 
      };
    }

<<<<<<< HEAD
    console.log('[Email Sweego] Email de confirmation envoyé avec succès:', result.id || result);
    return { success: true, messageId: result.id || result.message_id };
=======
    console.log('[Email Sweego] Email de confirmation envoyé avec succès:', result);
    return { success: true, messageId: result.message_id || result.id };
>>>>>>> 5325321 (feat: Mise à jour Sweego avec nouvelles clés API et guide de configuration)

  } catch (error) {
    console.error('[Email Sweego] Erreur inattendue lors de l\'envoi:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
}

/**
 * Envoie un email de notification au praticien via Sweego
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

<<<<<<< HEAD
    const htmlContent = `
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
    `;

    // Format Sweego API selon la documentation officielle
=======
    // Format Sweego API - https://api.sweego.io/send
>>>>>>> 5325321 (feat: Mise à jour Sweego avec nouvelles clés API et guide de configuration)
    const payload = {
      channel: 'email',
      provider: 'sweego',
      recipients: [
        {
          email: practitionerEmail,
          name: data.practitionerName
        }
      ],
      from: {
        email: 'noreply@sweego.io', // Email par défaut Sweego
        name: 'Notification Système'
      },
      subject: `Nouveau rendez-vous : ${data.patientName} le ${dateFormatted}`,
<<<<<<< HEAD
      'message-html': htmlContent,
=======
      'message-html': `
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
>>>>>>> 5325321 (feat: Mise à jour Sweego avec nouvelles clés API et guide de configuration)
      'reply-to': {
        email: data.patientEmail,
        name: data.patientName
      }
    };

    const response = await fetch(`${SWEEGO_API_URL}/send`, {
      method: 'POST',
      headers: {
        'Api-Key': SWEEGO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Email Sweego] Erreur lors de l\'envoi au praticien:', result);
      return { 
        success: false, 
        error: result.detail || result.message || result.error_msg || `HTTP ${response.status}: ${response.statusText}` 
      };
    }

<<<<<<< HEAD
    console.log('[Email Sweego] Notification envoyée au praticien avec succès:', result.id || result);
    return { success: true, messageId: result.id || result.message_id };
=======
    console.log('[Email Sweego] Notification envoyée au praticien avec succès:', result);
    return { success: true, messageId: result.message_id || result.id };
>>>>>>> 5325321 (feat: Mise à jour Sweego avec nouvelles clés API et guide de configuration)

  } catch (error) {
    console.error('[Email Sweego] Erreur inattendue lors de l\'envoi au praticien:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
}
