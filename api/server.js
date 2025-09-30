// Vercel serverless function entry point
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the built server
const serverPath = join(__dirname, '..', 'dist', 'index.js');

export default async function handler(req, res) {
  try {
    const { default: app } = await import(serverPath);
    return app(req, res);
  } catch (error) {
    console.error('Server import error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
