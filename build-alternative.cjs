#!/usr/bin/env node

// Build script alternatif pour Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting alternative Vercel build...');

try {
  // Vérifier que vite est disponible
  console.log('📦 Checking Vite availability...');
  const viteVersion = execSync('npx vite --version', { encoding: 'utf8' });
  console.log('✅ Vite version:', viteVersion.trim());

  // Nettoyer le dossier public
  console.log('🧹 Cleaning public directory...');
  if (fs.existsSync('public')) {
    const files = fs.readdirSync('public');
    files.forEach(file => {
      if (file !== '.gitkeep') {
        const filePath = path.join('public', file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
    });
  }

  // Construire avec Vite
  console.log('🔨 Building with Vite...');
  execSync('npx vite build --config vite.config.cjs', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Vérifier le résultat
  console.log('✅ Checking build output...');
  const publicFiles = fs.readdirSync('public');
  console.log('📁 Generated files:', publicFiles);

  // Vérifier index.html
  if (fs.existsSync('public/index.html')) {
    console.log('✅ index.html created successfully');
    const indexSize = fs.statSync('public/index.html').size;
    console.log('📏 Index size:', indexSize, 'bytes');
  } else {
    throw new Error('index.html not found in public/');
  }

  console.log('🎉 Alternative build completed successfully!');

} catch (error) {
  console.error('❌ Alternative build failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}