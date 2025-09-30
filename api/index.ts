import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // API health check
  if (req.url === '/api' || req.url === '/api/') {
    res.status(200).json({ 
      message: "API Médicale - Gestion des rendez-vous",
      version: "1.0.0",
      status: "OK",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "/api/health",
        auth: "/api/auth",
        practitioners: "/api/practitioners",
        timeslots: "/api/timeslots", 
        appointments: "/api/appointments",
        patients: "/api/patients"
      }
    });
    return;
  }

  // Health check endpoint
  if (req.url === '/api/health') {
    res.status(200).json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "production"
    });
    return;
  }

  // For now, return a simple response for all other endpoints
  // This will be expanded with actual API functionality
  res.status(200).json({
    message: `API endpoint ${req.url} received ${req.method} request`,
    timestamp: new Date().toISOString(),
    todo: "Implement actual API functionality"
  });
}