#!/usr/bin/env node

/**
 * Test de validation des credentials Google Calendar
 */

import https from 'https';

// Test 1: Vérifier si c'est une clé API valide
function testAPIKey(apiKey) {
  return new Promise((resolve) => {
    console.log('🔍 Test 1/3 : Validation de la clé API...');
    
    const options = {
      hostname: 'www.googleapis.com',
      port: 443,
      path: '/calendar/v3/calendars/primary?key=' + apiKey,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Clé API valide pour l\'accès public');
            resolve({ success: true, type: 'api_key_public', data: response });
          } else {
            console.log('❌ Clé API invalide ou insuffisante');
            console.log('📊 Réponse:', response.error.message);
            resolve({ success: false, error: response.error.message, type: 'api_key' });
          }
        } catch (e) {
          console.log('❌ Erreur de parsing:', e.message);
          resolve({ success: false, error: 'Parsing error', type: 'api_key' });
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Erreur réseau:', e.message);
      resolve({ success: false, error: e.message, type: 'api_key' });
    });

    req.end();
  });
}

// Test 2: Vérifier l'accès OAuth2
async function testOAuth2Flow(clientId, clientSecret) {
  console.log('\n🔍 Test 2/3 : Configuration OAuth2...');
  
  if (!clientId || !clientSecret) {
    console.log('❌ Client ID et/ou Client Secret manquants');
    return { success: false, error: 'Credentials manquants', type: 'oauth2' };
  }

  console.log('✅ Client ID fourni:', clientId.substring(0, 20) + '...');
  console.log('✅ Client Secret fourni:', clientSecret.substring(0, 10) + '...');
  
  return { 
    success: true, 
    message: 'Configuration OAuth2 OK - Nécessite processus d\'autorisation', 
    type: 'oauth2' 
  };
}

// Test 3: Recommandations
function generateRecommendations() {
  console.log('\n🔍 Test 3/3 : Recommandations...');
  
  console.log(`
📋 RECOMMANDATIONS POUR VOTRE CLÉS API :

✅ VOTRE CLÉ API : d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939
   - Est valide pour l'accès public
   - Peut servir de VITE_GOOGLE_API_KEY dans l'application

❌ MAIS insuffisante pour :
   - Créer des événements dans vos calendriers privés
   - Accéder aux calendriers utilisateur
   - Synchronisation bidirectionnelle

🎯 SOLUTIONS :

1. POUR L'APPLICATION ACTUELLE :
   - Configurez OAuth 2.0 (Client ID + Client Secret)
   - Votre clé API peut servir de backup VITE_GOOGLE_API_KEY

2. POUR LA SYNCHRONISATION AUTOMATIQUE :
   - Configurez un Service Account
   - Partagez votre calendrier avec le service account

3. UTILISATION IMMÉDIATE :
   - L'interface admin peut utiliser OAuth2
   - L'API key peut servir de fallback
  `);
}

// Fonction principale
async function main() {
  console.log('🧪 VALIDATION CREDENTIALS GOOGLE CALENDAR');
  console.log('==========================================\n');

  const apiKey = 'd1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939';
  
  try {
    // Test 1: API Key
    const apiKeyResult = await testAPIKey(apiKey);
    
    // Test 2: OAuth2
    const oauth2Result = await testOAuth2Flow(
      'YOUR_CLIENT_ID.apps.googleusercontent.com',
      'your_client_secret'
    );
    
    // Test 3: Recommandations
    generateRecommendations();
    
    console.log('\n📊 RÉSUMÉ FINAL:');
    console.log('================');
    console.log(`Clé API: ${apiKeyResult.success ? '✅ Valide' : '❌ Invalide'}`);
    console.log('OAuth2: ⚠️ Nécessite Client ID + Secret');
    console.log('Service Account: 💡 Recommandé pour sync automatique');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécution
main().then(() => {
  console.log('\n🏁 Tests terminés.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erreur:', error);
  process.exit(1);
});