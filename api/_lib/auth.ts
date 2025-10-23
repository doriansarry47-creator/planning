import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { VercelRequest } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || 'medplan-jwt-secret-key-2024-production';

export interface JwtPayload {
  userId: string;
  email: string;
  userType: 'admin' | 'patient';
  role?: string;
  permissions?: string[];
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

// Overload signatures for authenticateToken function
export function authenticateToken(token: string): { success: boolean; payload?: JwtPayload };
export function authenticateToken(req: VercelRequest): { success: boolean; payload?: JwtPayload };

// Implementation for both overloads
export function authenticateToken(input: string | VercelRequest): { success: boolean; payload?: JwtPayload } {
  try {
    if (typeof input === 'string') {
      // Handle token string
      const decoded = verifyToken(input);
      return { success: true, payload: decoded };
    } else {
      // Handle VercelRequest
      const payload = requireAuth(input);
      return { success: true, payload };
    }
  } catch (error) {
    return { success: false };
  }
}

// Vérifier les permissions d'un utilisateur
export function hasPermission(payload: JwtPayload, requiredPermission: string): boolean {
  if (!payload.permissions) return false;
  return payload.permissions.includes(requiredPermission) || payload.permissions.includes('all');
}

// Vérifier le rôle d'un utilisateur
export function hasRole(payload: JwtPayload, requiredRole: string): boolean {
  if (!payload.role) return false;
  const roleHierarchy: Record<string, number> = {
    'super_admin': 3,
    'admin': 2,
    'moderator': 1,
  };
  return (roleHierarchy[payload.role] || 0) >= (roleHierarchy[requiredRole] || 0);
}

// Middleware pour vérifier les permissions
export function requirePermission(req: VercelRequest, permission: string): JwtPayload {
  const payload = requireAuth(req);
  if (!hasPermission(payload, permission)) {
    throw new Error(`Permission requise: ${permission}`);
  }
  return payload;
}