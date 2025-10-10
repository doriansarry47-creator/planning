import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Configuration par défaut (à adapter selon votre fournisseur d'email)
const createTransport = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true pour port 465, false pour autres ports
    auth: {
      user: process.env.SMTP_USER || 'doriansarry@yahoo.fr',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  };

  return nodemailer.createTransporter(config);
};

// Template d'email de confirmation de rendez-vous
export const generateAppointmentConfirmationEmail = (
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  sessionType: string,
  appointmentId: string
) => {
  return {
    subject: `Confirmation de votre rendez-vous - Thérapie Sensorimotrice`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #0d9488 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .card { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .details { display: flex; justify-content: space-between; margin: 15px 0; }
          .label { font-weight: bold; color: #0d9488; }
          .value { color: #374151; }
          .footer { background: #374151; color: white; padding: 20px; text-align: center; font-size: 14px; }
          .button { 
            display: inline-block; 
            background: #0d9488; 
            color: white; 
            padding: 12px 25px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 15px 0;
          }
          .highlight { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌿 Confirmation de Rendez-vous</h1>
          <p>Dorian Sarry - Thérapie Sensorimotrice</p>
        </div>
        
        <div class="content">
          <div class="card">
            <h2>Bonjour ${patientName},</h2>
            <p>Votre rendez-vous a été <strong>confirmé</strong> avec succès !</p>
            
            <div class="highlight">
              <h3>📅 Détails de votre rendez-vous :</h3>
              <div class="details">
                <span class="label">Date :</span>
                <span class="value">${appointmentDate}</span>
              </div>
              <div class="details">
                <span class="label">Heure :</span>
                <span class="value">${appointmentTime}</span>
              </div>
              <div class="details">
                <span class="label">Type de consultation :</span>
                <span class="value">${sessionType === 'cabinet' ? 'En cabinet (présentiel)' : 'En visioconférence'}</span>
              </div>
              <div class="details">
                <span class="label">Praticien :</span>
                <span class="value">Dorian Sarry</span>
              </div>
              <div class="details">
                <span class="label">N° de rendez-vous :</span>
                <span class="value">${appointmentId}</span>
              </div>
            </div>

            ${sessionType === 'cabinet' ? `
              <div class="card">
                <h3>🏢 Adresse du cabinet :</h3>
                <p>
                  Dorian Sarry<br>
                  20 rue des Jacobins<br>
                  24000 Périgueux<br>
                  📞 06.45.15.63.68
                </p>
              </div>
            ` : `
              <div class="card">
                <h3>💻 Consultation en visioconférence :</h3>
                <p>Le lien de connexion vous sera envoyé 24h avant votre rendez-vous.</p>
                <p>Assurez-vous d'avoir une connexion internet stable et un environnement calme.</p>
              </div>
            `}

            <div class="card">
              <h3>ℹ️ Informations importantes :</h3>
              <ul>
                <li><strong>Préparation :</strong> Prévoyez d'arriver 5 minutes avant l'heure prévue</li>
                <li><strong>Durée :</strong> La séance durera environ 60 minutes</li>
                <li><strong>Annulation :</strong> Merci de prévenir au moins 24h à l'avance en cas d'empêchement</li>
                <li><strong>Paiement :</strong> Le règlement s'effectue à la fin de la séance (espèces, chèque, carte)</li>
              </ul>
            </div>

            <div class="card">
              <h3>📱 Gestion de votre rendez-vous :</h3>
              <p>Vous pouvez consulter, modifier ou annuler votre rendez-vous depuis votre espace patient :</p>
              <a href="${process.env.VITE_FRONTEND_URL}/patient/dashboard" class="button">
                Accéder à mon espace patient
              </a>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Dorian Sarry</strong> - Praticien en Thérapie Sensorimotrice</p>
          <p>📧 doriansarry@yahoo.fr | 📞 06.45.15.63.68</p>
          <p style="font-size: 12px; opacity: 0.8; margin-top: 15px;">
            Ce message vous a été envoyé automatiquement. Merci de ne pas y répondre directement.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
      Confirmation de rendez-vous - Thérapie Sensorimotrice
      
      Bonjour ${patientName},
      
      Votre rendez-vous a été confirmé avec succès !
      
      Détails :
      - Date : ${appointmentDate}
      - Heure : ${appointmentTime}
      - Type : ${sessionType === 'cabinet' ? 'En cabinet' : 'En visioconférence'}
      - Praticien : Dorian Sarry
      - N° : ${appointmentId}
      
      ${sessionType === 'cabinet' ? 
        'Adresse du cabinet : 20 rue des Jacobins, 24000 Périgueux' : 
        'Le lien de visioconférence vous sera envoyé 24h avant le rendez-vous.'
      }
      
      Cordialement,
      Dorian Sarry - Thérapie Sensorimotrice
    `
  };
};

// Template d'email de rappel
export const generateAppointmentReminderEmail = (
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  sessionType: string
) => {
  return {
    subject: `Rappel : Votre rendez-vous demain - Thérapie Sensorimotrice`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #0d9488 0%, #059669 100%); color: white; padding: 25px; text-align: center; }
          .content { padding: 25px; background: #f9fafb; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .reminder { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #374151; color: white; padding: 15px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⏰ Rappel de Rendez-vous</h1>
          <p>Dorian Sarry - Thérapie Sensorimotrice</p>
        </div>
        
        <div class="content">
          <div class="card">
            <h2>Bonjour ${patientName},</h2>
            
            <div class="reminder">
              <h3>📅 Votre rendez-vous est demain !</h3>
              <p><strong>Date :</strong> ${appointmentDate}</p>
              <p><strong>Heure :</strong> ${appointmentTime}</p>
              <p><strong>Type :</strong> ${sessionType === 'cabinet' ? 'En cabinet' : 'En visioconférence'}</p>
            </div>

            ${sessionType === 'visio' ? `
              <div class="card">
                <h3>💻 Lien de visioconférence :</h3>
                <p><a href="[LIEN_VISIO]" style="color: #0d9488; font-weight: bold;">[LIEN_VISIO]</a></p>
                <p><small>Assurez-vous d'avoir une connexion internet stable et un environnement calme.</small></p>
              </div>
            ` : ''}

            <p>J'ai hâte de vous voir demain !</p>
            <p>Si vous avez un empêchement, merci de me prévenir dès que possible.</p>
          </div>
        </div>

        <div class="footer">
          <p><strong>Dorian Sarry</strong> - Thérapie Sensorimotrice</p>
          <p>📧 doriansarry@yahoo.fr | 📞 06.45.15.63.68</p>
        </div>
      </body>
      </html>
    `
  };
};

// Template d'email d'annulation
export const generateAppointmentCancellationEmail = (
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  reason?: string
) => {
  return {
    subject: `Annulation de votre rendez-vous - Thérapie Sensorimotrice`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #ef4444; color: white; padding: 25px; text-align: center; }
          .content { padding: 25px; background: #f9fafb; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .footer { background: #374151; color: white; padding: 15px; text-align: center; font-size: 14px; }
          .button { 
            display: inline-block; 
            background: #0d9488; 
            color: white; 
            padding: 12px 25px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>❌ Annulation de Rendez-vous</h1>
          <p>Dorian Sarry - Thérapie Sensorimotrice</p>
        </div>
        
        <div class="content">
          <div class="card">
            <h2>Bonjour ${patientName},</h2>
            <p>Votre rendez-vous du <strong>${appointmentDate} à ${appointmentTime}</strong> a été annulé.</p>
            
            ${reason ? `<p><strong>Motif :</strong> ${reason}</p>` : ''}
            
            <p>Nous vous invitons à reprendre rendez-vous dès que possible :</p>
            <a href="${process.env.VITE_FRONTEND_URL}/patient/dashboard" class="button">
              Prendre un nouveau rendez-vous
            </a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Dorian Sarry</strong> - Thérapie Sensorimotrice</p>
          <p>📧 doriansarry@yahoo.fr | 📞 06.45.15.63.68</p>
        </div>
      </body>
      </html>
    `
  };
};

// Fonction pour envoyer un email
export const sendEmail = async (emailData: EmailData) => {
  try {
    const transporter = createTransport();
    
    const mailOptions = {
      from: `"Dorian Sarry - Thérapie Sensorimotrice" <${process.env.SMTP_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Impossible d\'envoyer l\'email');
  }
};

// Fonction d'envoi de confirmation de rendez-vous
export const sendAppointmentConfirmation = async (
  patientEmail: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  sessionType: string,
  appointmentId: string
) => {
  const emailTemplate = generateAppointmentConfirmationEmail(
    patientName,
    appointmentDate,
    appointmentTime,
    sessionType,
    appointmentId
  );

  return sendEmail({
    to: patientEmail,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text
  });
};

// Fonction d'envoi de rappel
export const sendAppointmentReminder = async (
  patientEmail: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  sessionType: string
) => {
  const emailTemplate = generateAppointmentReminderEmail(
    patientName,
    appointmentDate,
    appointmentTime,
    sessionType
  );

  return sendEmail({
    to: patientEmail,
    subject: emailTemplate.subject,
    html: emailTemplate.html
  });
};

// Fonction d'envoi d'annulation
export const sendAppointmentCancellation = async (
  patientEmail: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  reason?: string
) => {
  const emailTemplate = generateAppointmentCancellationEmail(
    patientName,
    appointmentDate,
    appointmentTime,
    reason
  );

  return sendEmail({
    to: patientEmail,
    subject: emailTemplate.subject,
    html: emailTemplate.html
  });
};