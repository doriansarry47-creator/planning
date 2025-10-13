import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { db, admins } from './_lib/db';
import { eq } from 'drizzle-orm';
import { sendSuccess, sendError } from './_lib/response';

/**
 * Route API temporaire pour créer le compte administrateur
 * ⚠️ IMPORTANT: Cette route doit être supprimée ou sécurisée après utilisation
 * 
 * Pour l'utiliser:
 * GET /api/setup-admin
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return sendError(res, 'Méthode non autorisée', 405);
  }

  try {
    console.log('🔧 Début de la configuration du compte administrateur...');

    const adminEmail = 'doriansarry@yahoo.fr';
    const adminPassword = 'Admin123';
    const adminName = 'Dorian Sarry';

    // Vérifier si l'admin existe déjà
    const existingAdmins = await db
      .select()
      .from(admins)
      .where(eq(admins.email, adminEmail))
      .limit(1);

    if (existingAdmins.length > 0) {
      console.log('⚠️ Un administrateur avec cet email existe déjà.');
      console.log('🔄 Mise à jour du mot de passe...');

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      // Mettre à jour le mot de passe
      const updatedAdmins = await db
        .update(admins)
        .set({ 
          password: hashedPassword,
          name: adminName,
          updatedAt: new Date()
        })
        .where(eq(admins.email, adminEmail))
        .returning();

      console.log('✅ Mot de passe mis à jour avec succès!');

      return sendSuccess(res, {
        message: 'Compte administrateur mis à jour avec succès',
        admin: {
          id: updatedAdmins[0].id,
          email: updatedAdmins[0].email,
          name: updatedAdmins[0].name,
        },
        credentials: {
          email: adminEmail,
          password: '****** (voir documentation)',
        }
      }, 'Compte administrateur mis à jour');
    } else {
      // Créer le nouveau compte admin
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const newAdmins = await db.insert(admins).values({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
      }).returning();

      console.log('✅ Compte administrateur créé avec succès!');

      return sendSuccess(res, {
        message: 'Compte administrateur créé avec succès',
        admin: {
          id: newAdmins[0].id,
          email: newAdmins[0].email,
          name: newAdmins[0].name,
        },
        credentials: {
          email: adminEmail,
          password: '****** (voir documentation)',
        },
        instructions: {
          loginUrl: '/login',
          documentation: 'Consultez ADMIN_SETUP.md pour les instructions complètes',
          security: '⚠️ Changez le mot de passe après la première connexion',
          cleanup: '⚠️ Supprimez cette route API (/api/setup-admin.ts) après utilisation'
        }
      }, 'Compte administrateur créé', 201);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la configuration du compte admin:', error);
    return sendError(res, `Erreur lors de la configuration: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 500);
  }
}
