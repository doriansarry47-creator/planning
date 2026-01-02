#!/usr/bin/env node

/**
 * Serveur de test local qui simule le comportement Netlify
 * pour les Single Page Applications (SPA)
 * 
 * Ce serveur :
 * - Sert les fichiers statiques depuis client/dist
 * - Redirige toutes les routes vers index.html (comme Netlify)
 * - Permet de tester le routing côté client localement
 * 
 * Usage: node test-spa-server.js
 * Puis ouvrir: http://localhost:8080
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'client', 'dist');

// Vérifier que le dossier dist existe
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Erreur: Le dossier client/dist n\'existe pas');
  console.error('   Exécutez d\'abord: npm run build');
  process.exit(1);
}

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Servir les fichiers statiques
app.use(express.static(DIST_DIR));

// Route pour simuler la fonction health de Netlify
app.get('/.netlify/functions/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Planning App API (Local Test)',
    environment: 'development'
  });
});

// SPA Routing: Rediriger toutes les autres routes vers index.html
// Cela simule le comportement du fichier _redirects de Netlify
app.get('*', (req, res) => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log(`   → Redirecting to index.html (SPA routing)`);
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Serveur de test SPA démarré !');
  console.log('====================================');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📁 Dossier servi: ${DIST_DIR}`);
  console.log('\n🧪 Routes de test:');
  console.log(`   - http://localhost:${PORT}/`);
  console.log(`   - http://localhost:${PORT}/book-appointment`);
  console.log(`   - http://localhost:${PORT}/appointments`);
  console.log(`   - http://localhost:${PORT}/admin`);
  console.log(`   - http://localhost:${PORT}/.netlify/functions/health`);
  console.log('\n✨ Ce serveur simule le comportement Netlify:');
  console.log('   ✅ Toutes les routes → index.html');
  console.log('   ✅ React Router gère le routing');
  console.log('   ✅ Rechargement de page fonctionne');
  console.log('\n⚠️  Appuyez sur Ctrl+C pour arrêter');
  console.log('====================================\n');
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n\n🛑 Arrêt du serveur...');
  process.exit(0);
});
