import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ 
    message: 'Vercel API functions are working correctly!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    runtime: 'nodejs20.x'
  });
}