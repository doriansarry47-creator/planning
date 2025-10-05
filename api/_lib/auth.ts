import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { VercelRequest } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || 'medplan-jwt-secret-key-2024-production';

export interface JwtPayload {
  userId: string;
  email: string;
  userType: 'admin' | 'patient';
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Token invalide');
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function extractTokenFromRequest(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function requireAuth(req: VercelRequest): JwtPayload {
  const token = extractTokenFromRequest(req);
  if (!token) {
    throw new Error('Token d\'authentification requis');
  }
  return verifyToken(token);
}

export function requireAdminAuth(req: VercelRequest): JwtPayload {
  const payload = requireAuth(req);
  if (payload.userType !== 'admin') {
    throw new Error('Accès administrateur requis');
  }
  return payload;
}

export function requirePatientAuth(req: VercelRequest): JwtPayload {
  const payload = requireAuth(req);
  if (payload.userType !== 'patient') {
    throw new Error('Accès patient requis');
  }
  return payload;
}