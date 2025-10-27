import { Context, Next } from 'hono';
import { verifyToken, extractToken } from './auth';

// Middleware d'authentification
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const token = extractToken(authHeader);

  if (!token) {
    return c.json({ error: 'Token manquant' }, 401);
  }

  const jwtSecret = c.env?.JWT_SECRET || 'dev-secret-key-change-in-production';
  const decoded = verifyToken(token, jwtSecret);

  if (!decoded) {
    return c.json({ error: 'Token invalide ou expiré' }, 401);
  }

  // Ajouter les infos de l'utilisateur au contexte
  c.set('user', decoded);
  await next();
}

// Middleware pour vérifier le type d'utilisateur (admin ou patient)
export function requireUserType(type: 'admin' | 'patient') {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user || user.type !== type) {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    await next();
  };
}
