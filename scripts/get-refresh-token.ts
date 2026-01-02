/**
 * Script pour obtenir un nouveau refresh token Google OAuth 2.0
 * 
 * Usage:
 * 1. npm run get-refresh-token
 * 2. Ouvrir l'URL affichée dans un navigateur
 * 3. Se connecter avec le compte Google cible (doriansarry47@gmail.com)
 * 4. Copier le code d'autorisation
 * 5. Coller le code dans le terminal
 * 6. Copier le refresh_token affiché
 * 7. Mettre à jour GOOGLE_REFRESH_TOKEN dans .env et Vercel
 */

import 'dotenv/config';
import { google } from 'googleapis';
import * as readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function main() {
  console.log('🔐 Obtention d\'un nouveau Refresh Token Google OAuth 2.0\n');
  console.log('════════════════════════════════════════════════════════════\n');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Variables manquantes: GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET');
    process.exit(1);
  }

  // Créer le client OAuth2
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost' // Redirect URI (doit être configuré dans Google Console)
  );

  // Générer l'URL d'autorisation
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Important pour obtenir un refresh token
    prompt: 'consent',      // Forcer le consentement pour obtenir un nouveau refresh token
    scope: SCOPES,
  });

  console.log('📋 Étapes à suivre:\n');
  console.log('1️⃣  Ouvrez cette URL dans votre navigateur:\n');
  console.log(`    ${authUrl}\n`);
  console.log('2️⃣  Connectez-vous avec le compte Google Calendar cible');
  console.log('    (doriansarry47@gmail.com)\n');
  console.log('3️⃣  Autorisez l\'application\n');
  console.log('4️⃣  Vous serez redirigé vers une page d\'erreur, c\'est normal !');
  console.log('    Copiez le CODE depuis l\'URL (après "code=").\n');
  console.log('    Exemple: http://localhost/?code=VOTRE_CODE_ICI&scope=...\n');
  console.log('════════════════════════════════════════════════════════════\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('📝 Collez le code d\'autorisation ici: ', async (code) => {
    try {
      console.log('\n⏳ Échange du code contre un refresh token...\n');

      // Échanger le code contre des tokens
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.refresh_token) {
        console.error('❌ Aucun refresh token reçu.');
        console.error('⚠️  Cela peut arriver si vous avez déjà autorisé l\'application.');
        console.error('💡 Solution: Révoquez l\'accès dans Google Account Settings et réessayez.\n');
        console.error('    → https://myaccount.google.com/permissions\n');
        process.exit(1);
      }

      console.log('✅ Tokens reçus avec succès !\n');
      console.log('════════════════════════════════════════════════════════════\n');
      console.log('📋 VOTRE NOUVEAU REFRESH TOKEN:\n');
      console.log(`    ${tokens.refresh_token}\n`);
      console.log('════════════════════════════════════════════════════════════\n');
      console.log('📝 Prochaines étapes:\n');
      console.log('1️⃣  Copiez le refresh token ci-dessus\n');
      console.log('2️⃣  Mettez à jour .env:\n');
      console.log(`    GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
      console.log('3️⃣  Mettez à jour sur Vercel:\n');
      console.log(`    vercel env add GOOGLE_REFRESH_TOKEN\n`);
      console.log('4️⃣  Testez avec: npm run test:oauth2\n');

      rl.close();
    } catch (error: any) {
      console.error('\n❌ Erreur lors de l\'échange du code:', error.message);
      rl.close();
      process.exit(1);
    }
  });
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
