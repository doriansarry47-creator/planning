import { handle } from 'hono/vercel';
import app from '../dist/_worker.js';

export const config = {
  runtime: 'edge',
};

export default handle(app);
