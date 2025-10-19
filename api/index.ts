import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import all route handlers
import authLogin from './_routes/auth/login.js';
import authRegister from './_routes/auth/register.js';
import authVerify from './_routes/auth/verify.js';
import appointments from './_routes/appointments/index.js';
import practitioners from './_routes/practitioners/index.js';
import patients from './_routes/patients/index.js';
import availabilitySlots from './_routes/availability-slots/index.js';
import notes from './_routes/notes/index.js';
import notificationsSend from './_routes/notifications/send.js';
import health from './_routes/health.js';
import initDb from './_routes/init-db.js';

/**
 * Main API router - Routes all API requests to appropriate handlers
 * This reduces the number of serverless functions for Vercel Hobby plan (12 max)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract the API path from the URL
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    // Route to appropriate handler based on path
    if (pathname.startsWith('/api/auth/login')) {
      return await authLogin(req, res);
    } else if (pathname.startsWith('/api/auth/register')) {
      return await authRegister(req, res);
    } else if (pathname.startsWith('/api/auth/verify')) {
      return await authVerify(req, res);
    } else if (pathname.startsWith('/api/appointments')) {
      return await appointments(req, res);
    } else if (pathname.startsWith('/api/practitioners')) {
      return await practitioners(req, res);
    } else if (pathname.startsWith('/api/patients')) {
      return await patients(req, res);
    } else if (pathname.startsWith('/api/availability-slots')) {
      return await availabilitySlots(req, res);
    } else if (pathname.startsWith('/api/notes')) {
      return await notes(req, res);
    } else if (pathname.startsWith('/api/notifications/send')) {
      return await notificationsSend(req, res);
    } else if (pathname.startsWith('/api/health')) {
      return await health(req, res);
    } else if (pathname.startsWith('/api/init-db')) {
      return await initDb(req, res);
    } else {
      return res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `The requested API endpoint ${pathname} does not exist`,
      });
    }
  } catch (error) {
    console.error('API Router Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
