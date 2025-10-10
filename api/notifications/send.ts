import { VercelRequest, VercelResponse } from '@vercel/node';
import { sendSMS, formatPhoneNumber, createAppointmentConfirmationSMS, createAppointmentReminderSMS } from '../_lib/sms';
import { sendEmail } from '../_lib/email';
import { authenticateToken } from '../_lib/auth';
import { errorResponse, successResponse } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Vérifier l'authentification (admin ou système)
    const user = authenticateToken(req);
    
    const { type, data } = req.body;

    switch (type) {
      case 'appointment_confirmation':
        return await handleAppointmentConfirmation(res, data);
      
      case 'appointment_reminder':
        return await handleAppointmentReminder(res, data);
      
      default:
        return errorResponse(res, 'Invalid notification type');
    }
  } catch (error) {
    console.error('Notification error:', error);
    return errorResponse(res, 'Failed to send notification');
  }
}

async function handleAppointmentConfirmation(res: VercelResponse, data: any) {
  const { firstName, phone, email, date, time } = data;
  
  const results = {
    sms: false,
    email: false
  };

  // Envoyer SMS si téléphone fourni
  if (phone) {
    try {
      const formattedPhone = formatPhoneNumber(phone);
      const message = createAppointmentConfirmationSMS(firstName, date, time);
      results.sms = await sendSMS({
        to: formattedPhone,
        message
      });
    } catch (error) {
      console.error('SMS error:', error);
    }
  }

  // Envoyer email si adresse fournie
  if (email) {
    try {
      const emailContent = `
        <h2>Confirmation de rendez-vous</h2>
        <p>Bonjour ${firstName},</p>
        <p>Votre rendez-vous avec <strong>Dorian Sarry</strong> (Thérapie Sensorimotrice) est confirmé :</p>
        <ul>
          <li><strong>Date :</strong> ${date}</li>
          <li><strong>Heure :</strong> ${time}</li>
          <li><strong>Lieu :</strong> 20 rue des Jacobins, 24000 Périgueux</li>
        </ul>
        <p>En cas de questions ou d'empêchement, n'hésitez pas à me contacter :</p>
        <ul>
          <li><strong>Téléphone :</strong> 06.45.15.63.68</li>
          <li><strong>Email :</strong> doriansarry@yahoo.fr</li>
        </ul>
        <p>À très bientôt,<br>Dorian Sarry</p>
      `;
      
      results.email = await sendEmail({
        to: email,
        subject: 'Confirmation de votre rendez-vous - Dorian Sarry',
        html: emailContent
      });
    } catch (error) {
      console.error('Email error:', error);
    }
  }

  return successResponse(res, {
    message: 'Notifications sent',
    results
  });
}

async function handleAppointmentReminder(res: VercelResponse, data: any) {
  const { firstName, phone, email, date, time } = data;
  
  const results = {
    sms: false,
    email: false
  };

  // Envoyer SMS de rappel si téléphone fourni
  if (phone) {
    try {
      const formattedPhone = formatPhoneNumber(phone);
      const message = createAppointmentReminderSMS(firstName, date, time);
      results.sms = await sendSMS({
        to: formattedPhone,
        message
      });
    } catch (error) {
      console.error('SMS reminder error:', error);
    }
  }

  // Envoyer email de rappel si adresse fournie
  if (email) {
    try {
      const emailContent = `
        <h2>Rappel de rendez-vous</h2>
        <p>Bonjour ${firstName},</p>
        <p>Je vous rappelle votre rendez-vous de demain avec <strong>Dorian Sarry</strong> (Thérapie Sensorimotrice) :</p>
        <ul>
          <li><strong>Date :</strong> ${date}</li>
          <li><strong>Heure :</strong> ${time}</li>
          <li><strong>Lieu :</strong> 20 rue des Jacobins, 24000 Périgueux</li>
        </ul>
        <p>En cas d'empêchement de dernière minute, merci de me prévenir au plus vite :</p>
        <ul>
          <li><strong>Téléphone :</strong> 06.45.15.63.68</li>
          <li><strong>Email :</strong> doriansarry@yahoo.fr</li>
        </ul>
        <p>À demain,<br>Dorian Sarry</p>
      `;
      
      results.email = await sendEmail({
        to: email,
        subject: 'Rappel de rendez-vous - Demain chez Dorian Sarry',
        html: emailContent
      });
    } catch (error) {
      console.error('Email reminder error:', error);
    }
  }

  return successResponse(res, {
    message: 'Reminder notifications sent',
    results
  });
}