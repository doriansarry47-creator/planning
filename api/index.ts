import { createServer } from 'http';
import app from '../server/index';

// Export as Vercel serverless function
export default (req: any, res: any) => {
  const server = createServer(app);
  server.emit('request', req, res);
};