import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Générer un token JWT
export function generateToken(payload: { id: string; email: string; type: 'admin' | 'patient' }, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// Vérifier un token JWT
export function verifyToken(token: string, secret: string): any {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

// Hasher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Comparer un mot de passe avec son hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Extraire le token du header Authorization
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
