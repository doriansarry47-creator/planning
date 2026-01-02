#!/usr/bin/env node

/**
 * Script pour obtenir le Refresh Token Google Calendar
 * 
 * Usage:
 * 1. Configurez CLIENT_ID et CLIENT_SECRET ci-dessous
 * 2. Exécutez: node scripts/get-google-refresh-token.js
 * 3. Ouvrez l'URL affichée dans votre navigateur
 * 4. Autorisez l'application
 * 5. Copiez le code de l'URL de redirection
 * 6. Collez-le dans le terminal
 * 7. Copiez le Refresh Token affiché
 */

const { google } = require('googleapis');
const readline = require('readline');

// ⚠️ Remplacez ces valeurs par vos propres credentials
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/oauth/callback';

// Scopes nécessaires pour Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

// Créer le client OAuth2
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Générer l'URL d'autorisation
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // Nécessaire pour obtenir un refresh token
  scope: SCOPES,
  prompt: 'consent', // Force l'affichage de l'écran de consentement
});

console.log('\n' + '='.repeat(80));
console.log('📅 CONFIGURATION GOOGLE CALENDAR - Obtention du Refresh Token');
console.log('='.repeat(80) + '\n');

console.log('📋 Étapes à suivre:\n');
console.log('1. Ouvrez cette URL dans votre navigateur:\n');
console.log('   ' + authUrl + '\n');
console.log('2. Connectez-vous avec votre compte Google');
console.log('3. Autorisez l\'application à accéder à votre calendrier');
console.log('4. Vous serez redirigé vers une page (qui peut afficher une erreur)');
console.log('5. Copiez le CODE depuis l\'URL de redirection');
console.log('   (l\'URL ressemble à: http://localhost:5173/oauth/callback?code=VOTRE_CODE)');
console.log('6. Collez le code ci-dessous\n');
console.log('='.repeat(80) + '\n');

// Interface pour lire l'entrée utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Entrez le code d\'autorisation: ', async (code) => {
  rl.close();
  
  try {
    console.log('\n⏳ Échange du code contre un token...\n');
    
    // Échanger le code contre des tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      console.error('❌ Erreur: Aucun refresh token obtenu.');
      console.error('   💡 Conseil: Essayez de révoquer l\'accès à l\'application');
      console.error('   dans les paramètres de votre compte Google, puis réessayez.');
      process.exit(1);
    }
    
    console.log('✅ Tokens obtenus avec succès!\n');
    console.log('='.repeat(80));
    console.log('📝 Copiez ces valeurs dans votre fichier .env:');
    console.log('='.repeat(80) + '\n');
    
    console.log('# Google Calendar Configuration');
    console.log(`GOOGLE_CLIENT_ID="${CLIENT_ID}"`);
    console.log(`GOOGLE_CLIENT_SECRET="${CLIENT_SECRET}"`);
    console.log(`GOOGLE_REDIRECT_URI="${REDIRECT_URI}"`);
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    console.log('GOOGLE_CALENDAR_ID="primary"\n');
    
    console.log('='.repeat(80));
    console.log('⚠️  IMPORTANT: Ne partagez JAMAIS ces informations!');
    console.log('='.repeat(80) + '\n');
    
    if (tokens.expiry_date) {
      const expiryDate = new Date(tokens.expiry_date);
      console.log(`ℹ️  Access Token expire le: ${expiryDate.toLocaleString()}`);
      console.log('   (Le Refresh Token permet d\'obtenir de nouveaux Access Tokens)\n');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'obtention des tokens:');
    console.error('   ', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.error('\n💡 Solutions possibles:');
      console.error('   - Vérifiez que le code est correct et complet');
      console.error('   - Le code expire rapidement, essayez d\'en obtenir un nouveau');
      console.error('   - Vérifiez que le REDIRECT_URI correspond à celui configuré dans Google Cloud Console');
    }
    
    process.exit(1);
  }
});

// Gestion de l'interruption (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Processus interrompu par l\'utilisateur');
  rl.close();
  process.exit(0);
});
