/**
 * Test de configuration Google Calendar OAuth2
 * Vérifie que toutes les credentials sont bien configurées
 */

import { config } from 'dotenv';
import fetch from 'node-fetch';

config();

console.log('🔍 Test de configuration Google Calendar...\n');

// Vérification des variables d'environnement
const requiredVars = {
    'VITE_GOOGLE_CLIENT_ID': 'Client ID OAuth2 côté client',
    'GOOGLE_CLIENT_SECRET': 'Client Secret OAuth2',
    'VITE_GOOGLE_API_KEY': 'API Key Google (backup)',
};

console.log('📋 Variables d\'environnement:');
for (const [varName, description] of Object.entries(requiredVars)) {
    const value = process.env[varName];
    const status = value && value !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' && value !== 'your_google_client_secret_here' ? '✅' : '❌';
    const displayValue = value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : 'Non configurée';
    console.log(`${status} ${varName}: ${displayValue} (${description})`);
}

console.log('\n🎯 Résumé:');

const clientIdConfigured = process.env.VITE_GOOGLE_CLIENT_ID && 
    !process.env.VITE_GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID');
const clientSecretConfigured = process.env.GOOGLE_CLIENT_SECRET && 
    !process.env.GOOGLE_CLIENT_SECRET.includes('your_google_client_secret');
const apiKeyConfigured = process.env.VITE_GOOGLE_API_KEY && 
    !process.env.VITE_GOOGLE_API_KEY.includes('YOUR_API_KEY');

if (clientIdConfigured && clientSecretConfigured) {
    console.log('✅ Credentials OAuth2 complètes - PRÊT À TESTER !');
    console.log('\n🚀 Prochaines étapes:');
    console.log('1. npm run dev');
    console.log('2. Aller sur http://localhost:5173/admin');
    console.log('3. Paramètres > Google Calendar > Connecter');
} else {
    console.log('❌ Credentials OAuth2 incomplètes');
    if (!clientIdConfigured) console.log('- Client ID manquant ou incorrect');
    if (!clientSecretConfigured) console.log('- Client Secret manquant ou incorrect');
}

if (apiKeyConfigured) {
    console.log('✅ API Key configurée (backup disponible)');
} else {
    console.log('⚠️ API Key non configurée (optionnel)');
}

console.log('\n📝 Configuration OAuth2:');
console.log(`Client ID: ${process.env.VITE_GOOGLE_CLIENT_ID || 'Non configuré'}`);
console.log(`Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Configuré' : '❌ Non configuré'}`);
console.log(`Redirect URI: http://localhost:5173/oauth/callback`);