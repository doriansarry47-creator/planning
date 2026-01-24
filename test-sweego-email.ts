/**
 * Test Script pour l'intégration Sweego Email
 * Ce script teste l'envoi d'emails de confirmation de rendez-vous
 * 
 * Usage: 
 * npx tsx test-sweego-email.ts
 */

import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '.env') });

// Configuration Sweego
const SWEEGO_API_URL = 'https://api.sweego.io';
const SWEEGO_API_KEY = process.env.SWEEGO_API_KEY || '5282eb71-fc1d-4423-ab78-29b4e7e96052';
const APP_URL = process.env.APP_URL || 'https://webapp-frtjapec0-ikips-projects.vercel.app';

console.log('\n🧪 ===== TEST SWEEGO EMAIL SERVICE =====\n');
console.log('📋 Configuration:');
console.log(`   - API URL: ${SWEEGO_API_URL}/send`);
console.log(`   - API Key: ${SWEEGO_API_KEY.substring(0, 10)}...`);
console.log(`   - APP URL: ${APP_URL}\n`);

/**
 * Template d'email de test
 */
function getTestEmailHTML(): string {
  const dateFormatted = new Date('2026-02-15T14:00:00Z').toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const cancelUrl = `${APP_URL}/appointments/cancel/test-hash-123`;

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
        <p class="greeting">Bonjour Jean Dupont,</p>
        <p class="intro">
          Nous avons le plaisir de vous confirmer votre prochain rendez-vous professionnel avec <strong>Dr. Marie Martin</strong>. 
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
              <div class="detail-value"><strong>14:00</strong> → <strong>15:00</strong></div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">⏱️</div>
            <div class="detail-content">
              <div class="detail-label">Durée</div>
              <div class="detail-value"><strong>60 minutes</strong></div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">📍</div>
            <div class="detail-content">
              <div class="detail-label">Adresse</div>
              <div class="detail-value">20 rue des Jacobins, 24000 Périgueux</div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">📝</div>
            <div class="detail-content">
              <div class="detail-label">Objet de la consultation</div>
              <div class="detail-value">Consultation générale de suivi</div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">💰</div>
            <div class="detail-content">
              <div class="detail-label">Tarif de la consultation</div>
              <div class="detail-value"><span class="price-tag">75.00 EUR</span></div>
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
        <p class="footer-brand">© 2026 Dr. Marie Martin — Services Professionnels</p>
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
 * Test d'envoi d'email via Sweego
 */
async function testSweegoEmail(testEmail: string = 'doriansarry@yahoo.fr') {
  console.log(`📧 Test d'envoi d'email à: ${testEmail}`);
  console.log('⏳ Envoi en cours...\n');

  try {
    // Format Sweego API selon la documentation officielle
    const payload = {
      channel: 'email',
      provider: 'sweego',
      recipients: [
        {
          email: testEmail,
          name: 'Jean Dupont'
        }
      ],
      from: {
        email: 'doriansarry@yahoo.fr',
        name: 'Dr. Marie Martin'
      },
      subject: 'Test - Confirmation de votre rendez-vous professionnel - 15 février 2026',
      'message-html': getTestEmailHTML(),
      'message-txt': `
CONFIRMATION DE RENDEZ-VOUS PROFESSIONNEL

Bonjour Jean Dupont,

Nous vous confirmons votre rendez-vous avec Dr. Marie Martin.

DÉTAILS DU RENDEZ-VOUS :
- Date : samedi 15 février 2026
- Horaire : 14:00 - 15:00
- Durée : 60 minutes
- Lieu : 20 rue des Jacobins, 24000 Périgueux
- Objet : Consultation générale de suivi
- Tarif : 75.00 EUR

IMPORTANT :
En cas d'empêchement, merci de nous prévenir au moins 24h à l'avance.

CONTACT :
Adresse : 20 rue des Jacobins, 24000 Périgueux
Téléphone : 06.45.15.63.68
Email : doriansarry@yahoo.fr

Cordialement,
L'équipe de Dr. Marie Martin
      `,
      'reply-to': {
        email: 'doriansarry@yahoo.fr',
        name: 'Dr. Marie Martin'
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
      console.error('❌ ÉCHEC DE L\'ENVOI');
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Détails:`, JSON.stringify(result, null, 2));
      return false;
    }

    console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS!');
    console.log(`   Message ID: ${result.id || result.message_id || 'N/A'}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Destinataire: ${testEmail}`);
    console.log(`\n📬 Vérifiez votre boîte mail (${testEmail})`);
    console.log(`   - Vérifiez aussi le dossier SPAM/Indésirables`);
    console.log(`   - Le template inclut :`);
    console.log(`     ✓ Date et horaire du rendez-vous`);
    console.log(`     ✓ Durée de la consultation`);
    console.log(`     ✓ Adresse complète`);
    console.log(`     ✓ Tarif de la consultation`);
    console.log(`     ✓ Bouton d'annulation`);
    console.log(`     ✓ Informations de contact`);
    
    return true;
  } catch (error) {
    console.error('❌ ERREUR INATTENDUE:', error);
    return false;
  }
}

/**
 * Point d'entrée principal
 */
async function main() {
  // Récupérer l'email de test depuis les arguments
  const testEmail = process.argv[2] || 'doriansarry@yahoo.fr';

  console.log('🎯 Objectif du test:');
  console.log('   - Vérifier la connexion à l\'API Sweego');
  console.log('   - Tester l\'envoi d\'un email de confirmation');
  console.log('   - Valider le template HTML professionnel\n');

  // Exécuter le test
  const success = await testSweegoEmail(testEmail);

  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('✅ TEST RÉUSSI - Service email opérationnel');
    console.log('='.repeat(50) + '\n');
    process.exit(0);
  } else {
    console.log('❌ TEST ÉCHOUÉ - Vérifiez la configuration');
    console.log('='.repeat(50) + '\n');
    process.exit(1);
  }
}

// Exécuter le script
main();
