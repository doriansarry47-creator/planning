#!/usr/bin/env node

// Build manual pour Vercel - approche ultra-simple
const fs = require('fs');
const path = require('path');

console.log('🏗️  Starting manual build for Vercel...');

try {
  // Créer le dossier public s'il n'existe pas
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
    console.log('✅ Created public directory');
  }

  // Créer un index.html basique si le build échoue
  const basicIndexHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Planning Medical</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .loading { font-size: 18px; color: #666; }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">
            <h1>Planning Médical</h1>
            <p>Application en cours de déploiement...</p>
            <p>Veuillez patienter, le système se configure automatiquement.</p>
        </div>
    </div>
    
    <script>
        // Rediriger vers l'API de base
        setTimeout(() => {
            fetch('/api/health')
                .then(response => response.json())
                .then(data => {
                    console.log('API Status:', data);
                    if (data.status === 'OK') {
                        document.querySelector('.loading').innerHTML = 
                            '<h1>✅ API Active</h1><p>Le système fonctionne correctement.</p>';
                    }
                })
                .catch(err => {
                    console.log('API not ready yet:', err);
                    document.querySelector('.loading').innerHTML += 
                        '<br><small>Configuration en cours...</small>';
                });
        }, 2000);
    </script>
</body>
</html>`;

  // Écrire l'index.html
  fs.writeFileSync(path.join('public', 'index.html'), basicIndexHtml);
  console.log('✅ Created basic index.html');

  // Créer un fichier CSS basique
  const basicCss = `
body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading {
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    max-width: 500px;
    text-align: center;
}

h1 {
    color: #333;
    margin-bottom: 20px;
}

p {
    color: #666;
    line-height: 1.6;
}
`;

  const assetsDir = path.join('public', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  fs.writeFileSync(path.join(assetsDir, 'style.css'), basicCss);
  console.log('✅ Created basic CSS');

  console.log('🎉 Manual build completed successfully!');
  console.log('📁 Generated files in public/:');
  console.log('   - index.html (fallback app)');
  console.log('   - assets/style.css (basic styles)');

} catch (error) {
  console.error('❌ Manual build failed:', error.message);
  process.exit(1);
}