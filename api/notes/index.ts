import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { verifyToken } from '../_lib/auth';
import { sendSuccess, sendError, handleApiError } from '../_lib/response';

// Schéma de validation pour une note
const noteSchema = z.object({
  patientId: z.string().min(1, "L'ID du patient est requis"),
  content: z.string().min(1, "Le contenu de la note est requis"),
  isPrivate: z.boolean().default(true),
  sessionDate: z.string().optional(),
});

// Mock data pour les notes (à remplacer par une vraie base de données)
let notes: Array<{
  id: string;
  patientId: string;
  content: string;
  isPrivate: boolean;
  sessionDate?: string;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: '1',
    patientId: 'patient-1',
    content: 'Première séance très positive. La patiente montre une bonne réceptivité aux exercices de conscience corporelle.',
    isPrivate: true,
    sessionDate: '2024-10-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    patientId: 'patient-1',
    content: 'Progression notable dans la gestion du stress. Exercices de respiration bien intégrés.',
    isPrivate: false, // Visible par le patient
    sessionDate: '2024-10-17',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return sendError(res, 'Token d\'authentification invalide', 401);
    }

    switch (req.method) {
      case 'GET':
        return await getNotes(req, res, authResult.payload!);
      case 'POST':
        return await createNote(req, res, authResult.payload!);
      case 'PUT':
        return await updateNote(req, res, authResult.payload!);
      case 'DELETE':
        return await deleteNote(req, res, authResult.payload!);
      default:
        return sendError(res, 'Méthode non autorisée', 405);
    }
  } catch (error) {
    return handleApiError(res, error);
  }
}

// Récupérer les notes
async function getNotes(req: VercelRequest, res: VercelResponse, user: any) {
  const { patientId } = req.query;
  
  if (user.userType === 'patient') {
    // Les patients ne voient que leurs propres notes non privées
    const patientNotes = notes.filter(note => 
      note.patientId === user.userId && !note.isPrivate
    );
    
    return sendSuccess(res, {
      notes: patientNotes,
      total: patientNotes.length
    }, 'Notes du patient récupérées avec succès');
    
  } else if (user.userType === 'admin') {
    let filteredNotes = notes;
    
    // Filtrer par patient si spécifié
    if (patientId) {
      filteredNotes = notes.filter(note => note.patientId === patientId);
    }
    
    // Les admins voient toutes les notes
    return sendSuccess(res, {
      notes: filteredNotes,
      total: filteredNotes.length
    }, 'Notes récupérées avec succès');
  }

  return sendError(res, 'Accès non autorisé', 403);
}

// Créer une nouvelle note (admin seulement)
async function createNote(req: VercelRequest, res: VercelResponse, user: any) {
  if (user.userType !== 'admin') {
    return sendError(res, 'Seuls les thérapeutes peuvent créer des notes', 403);
  }
  
  const validationResult = noteSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return sendError(res, 'Données invalides: ' + validationResult.error.issues[0].message, 400);
  }
  
  const noteData = validationResult.data;
  
  const newNote = {
    id: generateId(),
    ...noteData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  notes.push(newNote);
  
  return sendSuccess(res, newNote, 'Note créée avec succès', 201);
}

// Mettre à jour une note (admin seulement)
async function updateNote(req: VercelRequest, res: VercelResponse, user: any) {
  if (user.userType !== 'admin') {
    return sendError(res, 'Seuls les thérapeutes peuvent modifier les notes', 403);
  }
  
  const { noteId } = req.query;
  const updateData = req.body;
  
  if (!noteId) {
    return sendError(res, 'ID de la note requis', 400);
  }
  
  const noteIndex = notes.findIndex(note => note.id === noteId);
  if (noteIndex === -1) {
    return sendError(res, 'Note non trouvée', 404);
  }
  
  notes[noteIndex] = {
    ...notes[noteIndex],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };
  
  return sendSuccess(res, notes[noteIndex], 'Note mise à jour avec succès');
}

// Supprimer une note (admin seulement)
async function deleteNote(req: VercelRequest, res: VercelResponse, user: any) {
  if (user.userType !== 'admin') {
    return sendError(res, 'Seuls les thérapeutes peuvent supprimer les notes', 403);
  }
  
  const { noteId } = req.query;
  
  if (!noteId) {
    return sendError(res, 'ID de la note requis', 400);
  }
  
  const noteIndex = notes.findIndex(note => note.id === noteId);
  if (noteIndex === -1) {
    return sendError(res, 'Note non trouvée', 404);
  }
  
  const deletedNote = notes.splice(noteIndex, 1)[0];
  
  return sendSuccess(res, deletedNote, 'Note supprimée avec succès');
}

// Fonction utilitaire
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}