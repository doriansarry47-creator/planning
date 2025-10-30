import { handle } from 'hono/vercel';
import app from '../dist/_worker.js';

// Utiliser Node.js runtime pour compatibilité crypto/stream
export default handle(app);
