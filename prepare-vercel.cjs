#!/usr/bin/env node

// Script de préparation pour le déploiement Vercel
const fs = require('fs');
const path = require('path');

console.log('🔧 Preparing for Vercel deployment...');

try {
  // Backup current package.json
  console.log('📦 Backing up current package.json...');
  fs.copyFileSync('package.json', 'package.json.backup');

  // Use Vercel-optimized package.json if it exists
  if (fs.existsSync('package.vercel.json')) {
    console.log('📝 Using Vercel-optimized package.json...');
    fs.copyFileSync('package.vercel.json', 'package.json');
  }

  // Ensure vite.config.simple.js is present
  if (fs.existsSync('vite.config.simple.js')) {
    console.log('⚙️  Using simplified Vite config...');
  } else {
    console.log('❌ vite.config.simple.js not found');
  }

  // Clean public directory
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
  } else {
    fs.mkdirSync('public');
  }

  // Create .gitkeep in public
  fs.writeFileSync('public/.gitkeep', '');

  console.log('✅ Vercel preparation completed successfully!');

} catch (error) {
  console.error('❌ Error preparing for Vercel:', error.message);
  process.exit(1);
}