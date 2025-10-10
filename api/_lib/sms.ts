import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client: twilio.Twilio | null = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export interface SMSData {
  to: string;
  message: string;
}

export async function sendSMS(data: SMSData): Promise<boolean> {
  // Si Twilio n'est pas configuré, on simule l'envoi
  if (!client || !phoneNumber) {
    console.log('SMS would be sent to:', data.to, 'Message:', data.message);
    return true;
  }

  try {
    const message = await client.messages.create({
      body: data.message,
      from: phoneNumber,
      to: data.to,
    });

    console.log('SMS sent successfully:', message.sid);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

export function formatPhoneNumber(phone: string): string {
  // Nettoyer le numéro de téléphone
  let cleaned = phone.replace(/\D/g, '');
  
  // Si le numéro commence par 0, le remplacer par +33
  if (cleaned.startsWith('0')) {
    cleaned = '33' + cleaned.substring(1);
  }
  
  // Ajouter le + si pas présent
  if (!cleaned.startsWith('33')) {
    cleaned = '33' + cleaned;
  }
  
  return '+' + cleaned;
}

export function createAppointmentConfirmationSMS(
  firstName: string,
  date: string,
  time: string
): string {
  return `Bonjour ${firstName}, votre rendez-vous avec Dorian Sarry (Thérapie Sensorimotrice) est confirmé le ${date} à ${time}. Cabinet : 20 rue des Jacobins, 24000 Périgueux.`;
}

export function createAppointmentReminderSMS(
  firstName: string,
  date: string,
  time: string
): string {
  return `Bonjour ${firstName}, rappel : votre rendez-vous avec Dorian Sarry est demain ${date} à ${time}. Cabinet : 20 rue des Jacobins, 24000 Périgueux. En cas d'empêchement : 06.45.15.63.68`;
}