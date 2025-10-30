'''import { Hono, Handler } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { getDb } from './db';
import { admins, patients, appointments, availabilitySlots, notes, insertAdminSchema, insertPatientSchema, loginSchema, insertAppointmentSchema, insertAvailabilitySlotSchema } from './db/schema';
import { generateToken, hashPassword, comparePassword } from './lib/auth';
import { authMiddleware, requireUserType } from './lib/middleware';
import { eq, and, gte, desc } from 'drizzle-orm';

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('/api/*', cors());

// Serve static files
app.get('/*', serveStatic({ root: './' }));

// ==================== PUBLIC ROUTES ====================

// Obtenir les créneaux de disponibilité
app.get('/api/availability-slots', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const now = new Date();

  const availableSlots = await db
    .select()
    .from(availabilitySlots)
    .where(and(eq(availabilitySlots.isBooked, false), gte(availabilitySlots.startTime, now)))
    .orderBy(availabilitySlots.startTime);

  return c.json(availableSlots);
});

// ==================== AUTH ROUTES ====================

// Enregistrement d'un nouveau patient
app.post('/api/auth/register', async (c) => {
  try {
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const validatedData = insertPatientSchema.parse(body);

    const hashedPassword = await hashPassword(validatedData.password);

    const [newPatient] = await db
      .insert(patients)
      .values({ ...validatedData, password: hashedPassword })
      .returning();

    const { password, ...patientData } = newPatient;
    return c.json(patientData, 201);
  } catch (error) {
    // Gérer les erreurs de validation Zod
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Données invalides', details: error }, 400);
    }
    console.error('Erreur d\'enregistrement:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Connexion (patient ou admin)
app.post('/api/auth/login', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const { email, password, userType } = loginSchema.parse(body);

  let user;
  if (userType === 'patient') {
    [user] = await db.select().from(patients).where(eq(patients.email, email)).limit(1);
  } else if (userType === 'admin') {
    [user] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  } else {
    return c.json({ error: 'Type d\'utilisateur invalide' }, 400);
  }

  if (!user) {
    return c.json({ error: 'Identifiants invalides' }, 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return c.json({ error: 'Identifiants invalides' }, 401);
  }

  const token = await generateToken({ id: user.id, userType }, c.env.JWT_SECRET);

  return c.json({ token, userType });
});

// ==================== ADMIN ROUTES ====================

// Obtenir les statistiques globales
app.get('/api/admin/statistics', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  const totalPatients = await db.select({ count: eq(patients, patients.id) }).from(patients);
  const totalAppointments = await db.select({ count: eq(appointments, appointments.id) }).from(appointments);
  const upcomingAppointments = await db.select().from(appointments).where(gte(appointments.date, new Date()));

  return c.json({
    totalPatients: totalPatients[0]?.count || 0,
    totalAppointments: totalAppointments[0]?.count || 0,
    upcomingAppointments: upcomingAppointments.length,
  });
});

// Obtenir tous les patients
app.get('/api/admin/patients', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const allPatients = await db.select({ id: patients.id, name: patients.name, email: patients.email }).from(patients);
  return c.json(allPatients);
});

// Obtenir les détails d'un patient
app.get('/api/admin/patients/:id', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const patientId = parseInt(c.req.param('id'));

  const [patient] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
  if (!patient) {
    return c.json({ error: 'Patient non trouvé' }, 404);
  }

  const patientAppointments = await db.select().from(appointments).where(eq(appointments.patientId, patientId));
  const patientNotes = await db.select().from(notes).where(eq(notes.patientId, patientId));

  return c.json({ ...patient, appointments: patientAppointments, notes: patientNotes });
});

// Obtenir tous les rendez-vous
app.get('/api/admin/appointments', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const allAppointments = await db.select().from(appointments).orderBy(desc(appointments.date));
  return c.json(allAppointments);
});

// Mettre à jour un rendez-vous (statut, notes)
app.patch('/api/admin/appointments/:id', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const appointmentId = parseInt(c.req.param('id'));
  const { status, notes } = await c.req.json();

  const [updatedAppointment] = await db
    .update(appointments)
    .set({ status, notes, updatedAt: new Date() })
    .where(eq(appointments.id, appointmentId))
    .returning();

  if (!updatedAppointment) {
    return c.json({ error: 'Rendez-vous non trouvé' }, 404);
  }

  return c.json(updatedAppointment);
});

// Créer un créneau de disponibilité
app.post('/api/admin/availability-slots', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const validatedData = insertAvailabilitySlotSchema.parse(body);

  const [newSlot] = await db.insert(availabilitySlots).values(validatedData).returning();

  return c.json(newSlot, 201);
});


// Créer un administrateur (route protégée, potentiellement à usage unique ou interne)
app.post('/api/admin/create', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const validatedData = insertAdminSchema.parse(body);

  const hashedPassword = await hashPassword(validatedData.password);

  try {
    const [newAdmin] = await db
      .insert(admins)
      .values({ ...validatedData, password: hashedPassword })
      .returning();

    const { password, ...adminData } = newAdmin;
    return c.json(adminData, 201);
  } catch (error) {
    // Gérer les erreurs de contrainte unique (ex: email déjà existant)
    return c.json({ error: 'Impossible de créer l\'administrateur. L\'email existe peut-être déjà.' }, 409);
  }
});

// ==================== PATIENT ROUTES ====================

// Obtenir le profil du patient
app.get('/api/patient/profile', authMiddleware, requireUserType('patient'), async (c) => {
  const user = c.get('user');
  const db = getDb(c.env.DATABASE_URL);

  const [patient] = await db.select().from(patients).where(eq(patients.id, user.id)).limit(1);
  if (!patient) {
    return c.json({ error: 'Patient non trouvé' }, 404);
  }

  // Ne pas renvoyer le mot de passe et les notes du thérapeute
  const { password, therapistNotes, ...patientData } = patient;
  return c.json(patientData);
});

// Obtenir les rendez-vous du patient
app.get('/api/patient/appointments', authMiddleware, requireUserType('patient'), async (c) => {
  const user = c.get('user');
  const db = getDb(c.env.DATABASE_URL);

  const patientAppointments = await db
    .select()
    .from(appointments)
    .where(eq(appointments.patientId, user.id))
    .orderBy(desc(appointments.date));

  return c.json(patientAppointments);
});

// Créer un rendez-vous
app.post('/api/patient/appointments', authMiddleware, requireUserType('patient'), (async (c: any) => {
  try {
    const user = c.get('user');
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const validatedData = insertAppointmentSchema.parse(body);

    // Vérifier que le patient crée un RDV pour lui-même
    if (validatedData.patientId !== user.id) {
      return c.json({ error: 'Vous ne pouvez créer un rendez-vous que pour vous-même' }, 403);
    }

    // Vérifier que le créneau est disponible
    const [slot] = await db
      .select()
      .from(availabilitySlots)
      .where(and(eq(availabilitySlots.id, validatedData.slotId), eq(availabilitySlots.isBooked, false)));

    if (!slot) {
      return c.json({ error: 'Créneau non disponible ou inexistant' }, 409);
    }

    // Mettre à jour le créneau pour le marquer comme réservé
    await db.update(availabilitySlots).set({ isBooked: true }).where(eq(availabilitySlots.id, validatedData.slotId));

    // Créer le rendez-vous
    const [newAppointment] = await db
      .insert(appointments)
      .values({
        patientId: validatedData.patientId,
        slotId: validatedData.slotId,
        date: slot.startTime, // Utiliser l'heure de début du créneau
        status: 'confirmed',
      })
      .returning();

    return c.json(newAppointment, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Données invalides', details: error }, 400);
    }
    console.error('Erreur lors de la création du rendez-vous:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

export default app;
'''
