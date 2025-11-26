import { ENV } from '../_core/env';

export interface SMSNotificationData {
  patientName: string;
  patientPhone: string;
  date: Date;
  startTime: string;
  endTime: string;
  practitionerName: string;
}

/**
 * Envoie une notification SMS via Twilio
 * Nécessite TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */
export async function sendAppointmentSMS(
  data: SMSNotificationData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Vérifier que les credentials Twilio sont configurées
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      console.warn('[SMS] Credentials Twilio non configurés - SMS non envoyé');
      return {
        success: false,
        error: 'Service SMS non configuré (Twilio credentials manquants)'
      };
    }

    // Import dynamique de Twilio
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);

    // Formater la date en français
    const dateFormatted = new Date(data.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Construire le message SMS
    const message = `Confirmation rendez-vous - ${dateFormatted} à ${data.startTime} avec ${data.practitionerName}. Merci!`;

    // Normaliser le numéro de téléphone (ajouter +33 si nécessaire)
    let toPhone = data.patientPhone.replace(/\s/g, '');
    if (toPhone.startsWith('06') || toPhone.startsWith('07')) {
      toPhone = '+33' + toPhone.substring(1);
    } else if (!toPhone.startsWith('+')) {
      toPhone = '+' + toPhone;
    }

    console.log(`[SMS] Envoi SMS à ${toPhone}...`);

    const result = await client.messages.create({
      body: message,
      from: fromPhone,
      to: toPhone,
    });

    console.log(`[SMS] SMS envoyé avec succès: ${result.sid}`);
    return { success: true, messageId: result.sid };

  } catch (error) {
    console.error('[SMS] Erreur lors de l\'envoi SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Envoie une notification SMS avec texte personnalisé
 */
export async function sendCustomSMS(
  toPhone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      return {
        success: false,
        error: 'Service SMS non configuré'
      };
    }

    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);

    // Normaliser le numéro de téléphone
    let normalizedPhone = toPhone.replace(/\s/g, '');
    if (normalizedPhone.startsWith('06') || normalizedPhone.startsWith('07')) {
      normalizedPhone = '+33' + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+' + normalizedPhone;
    }

    const result = await client.messages.create({
      body: message,
      from: fromPhone,
      to: normalizedPhone,
    });

    return { success: true, messageId: result.sid };

  } catch (error) {
    console.error('[SMS] Erreur:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
