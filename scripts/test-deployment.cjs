#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Testing Vercel deployment configuration...\n');

// Test 1: Check if vercel.json exists and is valid
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('✅ vercel.json is valid JSON');
  
  if (vercelConfig.functions && vercelConfig.functions['api/**/*.ts']) {
    const runtime = vercelConfig.functions['api/**/*.ts'].runtime;
    console.log(`✅ API functions runtime: ${runtime}`);
  }
} catch (error) {
  console.error('❌ vercel.json error:', error.message);
  process.exit(1);
}

// Test 2: Check Node.js version compatibility
try {
  const nodeVersion = fs.readFileSync('.node-version', 'utf8').trim();
  console.log(`✅ Node.js version specified: ${nodeVersion}`);
} catch (error) {
  console.log('ℹ️  .node-version not found (optional)');
}

// Test 3: Run build command
try {
  console.log('🔨 Running build command...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build successful');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Test 4: Check API files
const apiDir = path.join(__dirname, '..', 'api');
if (fs.existsSync(apiDir)) {
  const tsFiles = execSync('find api -name "*.ts"', { encoding: 'utf8' }).trim().split('\n').filter(f => f);
  console.log(`✅ Found ${tsFiles.length} TypeScript API files`);
  tsFiles.forEach(file => console.log(`   - ${file}`));
} else {
  console.log('❌ API directory not found');
  process.exit(1);
}

console.log('\n🎉 All deployment tests passed!');
console.log('✅ Ready for Vercel deployment');