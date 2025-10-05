import type { VercelResponse } from '@vercel/node';

export function sendSuccess(
  res: VercelResponse,
  data: any,
  message?: string,
  status: number = 200
) {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
}

export function sendError(
  res: VercelResponse,
  message: string,
  status: number = 400,
  error?: any
) {
  console.error('API Error:', { message, status, error });
  
  return res.status(status).json({
    success: false,
    error: message,
    message,
    ...(process.env.NODE_ENV === 'development' && error && { details: error }),
  });
}

export function handleApiError(res: VercelResponse, error: any) {
  if (error.message === 'Token d\'authentification requis') {
    return sendError(res, error.message, 401);
  }
  
  if (error.message === 'Token invalide') {
    return sendError(res, error.message, 401);
  }
  
  if (error.message === 'Accès administrateur requis' || error.message === 'Accès patient requis') {
    return sendError(res, error.message, 403);
  }
  
  if (error.code === '23505') { // Unique constraint violation
    return sendError(res, 'Cette adresse email est déjà utilisée', 409);
  }
  
  console.error('Unhandled API error:', error);
  return sendError(res, 'Erreur interne du serveur', 500, error);
}

export function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

export function handleCors(res: VercelResponse) {
  setCorsHeaders(res);
  return res.status(200).end();
}