import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';
import { sendSuccess, sendError, handleApiError } from '../_lib/response';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  userType: z.enum(['admin', 'patient']),
});

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return sendError(res, 'Méthode non autorisée', 405);
  }

  try {
    const validationResult = forgotPasswordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(res, 'Email et type d\'utilisateur requis', 400);
    }

    const { email, userType } = validationResult.data;

    // Vérifier si l'utilisateur existe
    let userExists = false;
    if (userType === 'admin') {
      const adminResults = await sql`SELECT id FROM admins WHERE email = ${email} LIMIT 1`;
      userExists = adminResults.length > 0;
    } else {
      const patientResults = await sql`SELECT id FROM patients WHERE email = ${email} LIMIT 1`;
      userExists = patientResults.length > 0;
    }

    if (!userExists) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe
      return sendSuccess(res, null, 'Si cet email existe, vous recevrez un lien de réinitialisation.');
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Sauvegarder le token dans la base de données
    await sql`
      INSERT INTO password_resets (email, token, user_type, expires_at)
      VALUES (${email}, ${resetToken}, ${userType}, ${expiresAt})
    `;

    // Configurer Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mail.yahoo.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'doriansarry@yahoo.fr',
        pass: process.env.SMTP_PASS || '', // À configurer avec un mot de passe d'application
      },
    });

    // Construire l'URL de réinitialisation
    const frontendUrl = process.env.FRONTEND_URL || process.env.VITE_FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&type=${userType}`;

    // Contenu de l'email
    const mailOptions = {
      from: {
        name: process.env.SMTP_FROM_NAME || 'Dorian Sarry — Thérapie Sensorimotrice',
        address: process.env.SMTP_FROM_EMAIL || 'doriansarry@yahoo.fr',
      },
      to: email,
      subject: 'Réinitialisation de votre mot de passe — Dorian Sarry Thérapie Sensorimotrice',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Réinitialisation de mot de passe</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 24px;">Réinitialisation de votre mot de passe</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Dorian Sarry — Thérapie Sensorimotrice</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">Bonjour,</p>
            
            <p style="margin: 0 0 20px 0;">
              Vous avez demandé à réinitialiser votre mot de passe pour votre espace thérapeutique.
            </p>
            
            <p style="margin: 0 0 25px 0;">
              Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            
            <p style="margin: 25px 0 15px 0; font-size: 14px; color: #666;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
            </p>
            <p style="margin: 0 0 20px 0; font-size: 12px; word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 25px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #dc2626; font-weight: bold;">
                ⚠️ Important :
              </p>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #666;">
                <li>Ce lien expire dans 30 minutes pour votre sécurité</li>
                <li>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message</li>
                <li>Ne partagez jamais ce lien avec quiconque</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #10b981;">
              Dorian Sarry — Thérapie Sensorimotrice
            </p>
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">
              📍 20 rue des Jacobins, 24000 Périgueux
            </p>
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">
              📞 06.45.15.63.68
            </p>
            <p style="margin: 0; font-size: 14px; color: #666;">
              📧 doriansarry@yahoo.fr
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </body>
        </html>
      `,
      text: `
Réinitialisation de votre mot de passe — Dorian Sarry Thérapie Sensorimotrice

Bonjour,

Vous avez demandé à réinitialiser votre mot de passe pour votre espace thérapeutique.
Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :

${resetUrl}

Ce lien expire dans 30 minutes pour votre sécurité.
Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.

Bien à vous,
Dorian Sarry — Thérapie Sensorimotrice
20 rue des Jacobins, 24000 Périgueux
06.45.15.63.68
doriansarry@yahoo.fr
      `.trim(),
    };

    // Envoyer l'email
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      return sendError(res, 'Erreur lors de l\'envoi de l\'email', 500);
    }

    return sendSuccess(res, null, 'Si cet email existe, vous recevrez un lien de réinitialisation.');

  } catch (error) {
    console.error('Erreur forgot-password:', error);
    return handleApiError(res, error);
  }
}