#!/usr/bin/env node

/**
 * Script de configuration rapide pour Google Calendar
 * Guide l'utilisateur pas à pas pour configurer l'intégration
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
🔗 CONFIGURATION GOOGLE CALENDAR - PLANNING APP
=================================================

Ce script vous guide pour configurer l'intégration Google Calendar.

📋 PRÉREQUIS :
- Un compte Google
- Accès à Google Cloud Console
- L'application de planning qui fonctionne

🚀 COMMENÇONS !

`);

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  try {
    console.log('🎯 ÉTAPE 1/6 : Configuration Google Cloud');
    console.log(`
1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google Calendar
4. Créez des identifiants OAuth 2.0 (type: Application Web)
5. Ajoutez http://localhost:5173/oauth/callback aux URI de redirection
    `);

    const clientId = await askQuestion('📝 Entrez votre Client ID OAuth2 : ');
    
    if (!clientId) {
      console.log('❌ Client ID requis pour continuer');
      return;
    }

    const clientSecret = await askQuestion('🔐 Entrez votre Client Secret : ');

    console.log(`
🎯 ÉTAPE 2/6 : Configuration du fichier .env

Mise à jour du fichier de configuration...
    `);

    // Lire le fichier .env actuel
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Remplacer les placeholders par les vraies valeurs
    envContent = envContent.replace(
      /VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID\.apps\.googleusercontent\.com/,
      `VITE_GOOGLE_CLIENT_ID=${clientId}`
    );
    
    envContent = envContent.replace(
      /GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID\.apps\.googleusercontent\.com/,
      `GOOGLE_CLIENT_ID=${clientId}`
    );

    if (clientSecret && clientSecret !== 'your_google_client_secret_here') {
      envContent = envContent.replace(
        /GOOGLE_CLIENT_SECRET=your_google_client_secret_here/,
        `GOOGLE_CLIENT_SECRET=${clientSecret}`
      );
    }

    // Sauvegarder le fichier
    fs.writeFileSync(envPath, envContent);

    console.log('✅ Fichier .env mis à jour !');

    console.log(`
🎯 ÉTAPE 3/6 : Service Account (Optionnel)

Pour une synchronisation automatique bidirectionnelle, vous pouvez configurer un Service Account.

1. Dans Google Cloud Console > IAM et administration > Comptes de service
2. Créez un nouveau compte de service
3. Téléchargez le fichier JSON des credentials
4. Partagez votre Google Calendar avec l'email du service account

Configurer un Service Account ? (y/N) : `);

    const setupServiceAccount = await askQuestion('');
    if (setupServiceAccount.toLowerCase() === 'y' || setupServiceAccount.toLowerCase() === 'yes') {
      const serviceAccountEmail = await askQuestion('📧 Entrez l\'email du Service Account : ');
      
      if (serviceAccountEmail) {
        envContent = envContent.replace(
          /GOOGLE_SERVICE_ACCOUNT_EMAIL=planning-calendar-service@your-project\.iam\.gserviceaccount\.com/,
          `GOOGLE_SERVICE_ACCOUNT_EMAIL=${serviceAccountEmail}`
        );
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Service Account email configuré !');
      }
    }

    console.log(`
🎯 ÉTAPE 4/6 : Test de la configuration

Pour tester :
1. Lancez l'application : npm run dev
2. Allez sur http://localhost:5173
3. Connectez-vous comme admin
4. Allez dans les paramètres Google Calendar
5. Cliquez sur "Connecter Google Calendar"

Appuyez sur Entrée pour continuer...`);
    
    await askQuestion('');

    console.log(`
🎯 ÉTAPE 5/6 : Vérification du fichier .env

Voici votre configuration actuelle :
    `);

    // Afficher les lignes importantes du .env
    const lines = envContent.split('\n');
    lines.forEach(line => {
      if (line.includes('VITE_GOOGLE_CLIENT_ID') || 
          line.includes('GOOGLE_CLIENT_SECRET') || 
          line.includes('GOOGLE_SERVICE_ACCOUNT_EMAIL')) {
        console.log(line);
      }
    });

    console.log(`
🎯 ÉTAPE 6/6 : Ressources

📚 Documentation :
- https://developers.google.com/calendar/api/quickstart/js
- https://console.cloud.google.com/apis/credentials

🛠️ Outils utiles :
- OAuth 2.0 Playground : https://developers.google.com/oauthplayground/
- Google Cloud Console : https://console.cloud.google.com/

📋 Prochaines étapes :
1. Lancez l'application : npm run dev
2. Testez la connexion dans l'admin
3. Créez un rendez-vous de test
4. Vérifiez la synchronisation avec Google Calendar

✨ Configuration terminée !
    `);

  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error.message);
  } finally {
    rl.close();
  }
}

main();