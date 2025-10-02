import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "medical_app_secret_2024";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  type: 'admin' | 'patient';
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, JWT_SECRET) as UserPayload;
};

export const authMiddleware = (requiredRole?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Token d'accès requis" });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);
      
      if (requiredRole && requiredRole.length > 0) {
        if (!requiredRole.includes(decoded.role) && !requiredRole.includes(decoded.type)) {
          return res.status(403).json({ error: "Accès interdit - rôle insuffisant" });
        }
      }

      (req as any).user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Token invalide" });
    }
  };
};