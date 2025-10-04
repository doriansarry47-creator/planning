import { build } from 'esbuild';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getAllTsFiles(dir) {
  const files = [];
  
  async function scanDir(currentDir) {
    const items = await readdir(currentDir);
    
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        await scanDir(fullPath);
      } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  await scanDir(dir);
  return files;
}

async function buildVercel() {
  console.log('🔧 Building for Vercel...');
  
  try {
    // Créer le répertoire dist/api s'il n'existe pas
    await mkdir(join(__dirname, 'dist'), { recursive: true });
    await mkdir(join(__dirname, 'dist/api'), { recursive: true });
    
    // Compiler api/index.ts
    console.log('📦 Compiling api/index.ts...');
    await build({
      entryPoints: ['api/index.ts'],
      outfile: 'dist/api/index.js',
      platform: 'node',
      format: 'esm',
      bundle: true,
      external: ['@vercel/node'],
      minify: false,
      sourcemap: true,
      target: 'node18',
      keepNames: true,
      define: {
        'import.meta.url': 'undefined'
      }
    });
    
    // Obtenir tous les fichiers TS du serveur
    const serverFiles = await getAllTsFiles(join(__dirname, 'server'));
    const sharedFiles = await getAllTsFiles(join(__dirname, 'shared'));
    
    // Compiler tous les fichiers serveur et shared
    console.log('📦 Compiling server and shared files...');
    await build({
      entryPoints: [...serverFiles, ...sharedFiles],
      outdir: 'dist',
      platform: 'node',
      format: 'esm',
      bundle: false,
      minify: false,
      sourcemap: true,
      target: 'node18',
      keepNames: true,
    });
    
    console.log('✅ Build completed successfully!');
    console.log('📁 Files generated:');
    console.log('  - dist/api/index.js (Vercel API handler)');
    console.log('  - dist/server/* (Server files compiled)');
    console.log('  - dist/shared/* (Shared files compiled)');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildVercel();