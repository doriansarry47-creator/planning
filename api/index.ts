import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { getDb } from '../src/db';
import { 
  admins, 
  patients, 
  appointments, 
  availabilitySlots, 
  notes, 
  insertAdminSchema, 
  insertPatientSchema, 
  loginSchema, 
  insertAppointmentSchema, 
  insertAvailabilitySlotSchema 
} from '../src/db/schema';
import { generateToken, hashPassword, comparePassword } from '../src/lib/auth';
import { authMiddleware, requireUserType } from '../src/lib/middleware';
import { eq, and, gte, desc } from 'drizzle-orm';

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('/api/*', cors());

// Root route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application de Gestion de Rendez-vous Médicaux</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { 
          color: #667eea; 
          margin-bottom: 10px;
          font-size: 28px;
        }
        p { 
          color: #666; 
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .buttons {
          display: flex;
          gap: 15px;
          flex-direction: column;
        }
        button {
          padding: 15px 30px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-primary {
          background: #667eea;
          color: white;
        }
        .btn-primary:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
          background: #764ba2;
          color: white;
        }
        .btn-secondary:hover {
          background: #653a8d;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(118, 75, 162, 0.4);
        }
        .status {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 600;
        }
        .api-info {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 10px;
          margin-top: 20px;
          font-size: 14px;
          color: #666;
        }
        .api-info code {
          background: #fff;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          color: #667eea;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="status">✅ Application Déployée avec Succès</div>
        <h1>🏥 Gestion de Rendez-vous</h1>
        <p>Bienvenue sur l'application de gestion de rendez-vous médicaux. Connectez-vous pour accéder à votre espace.</p>
        
        <div class="buttons">
          <button class="btn-primary" onclick="alert('Interface patient en cours de développement. Utilisez l\\'API: POST /api/auth/login')">
            👤 Espace Patient
          </button>
          <button class="btn-secondary" onclick="alert('Interface admin en cours de développement. Utilisez l\\'API: POST /api/auth/login')">
            👨‍⚕️ Espace Administrateur
          </button>
        </div>

        <div class="api-info">
          <strong>📡 API REST Disponible</strong><br>
          <code>POST /api/auth/login</code><br>
          <code>POST /api/auth/register</code><br>
          <code>GET /api/patient/appointments</code><br>
          <code>GET /api/admin/statistics</code>
        </div>
      </div>
    </body>
    </html>
  `);
});

// ==================== PUBLIC ROUTES ====================

// Obtenir les créneaux de disponibilité
app.get('/api/availability-slots', async (c) => {
  const db = getDb(process.env.DATABASE_URL!);
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
    const db = getDb(process.env.DATABASE_URL!);
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
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Données invalides', details: error }, 400);
    }
    console.error('Erreur d\'enregistrement:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Connexion (patient ou admin)
app.post('/api/auth/login', async (c) => {
  const db = getDb(process.env.DATABASE_URL!);
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

  const token = await generateToken({ id: user.id, userType }, process.env.JWT_SECRET!);

  return c.json({ token, userType });
});

// ==================== ADMIN ROUTES ====================

// Obtenir les statistiques globales
app.get('/api/admin/statistics', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(process.env.DATABASE_URL!);

  const allPatients = await db.select().from(patients);
  const allAppointments = await db.select().from(appointments);
  const upcomingAppointments = await db.select().from(appointments).where(gte(appointments.date, new Date()));

  return c.json({
    totalPatients: allPatients.length,
    totalAppointments: allAppointments.length,
    upcomingAppointments: upcomingAppointments.length,
  });
});

// Obtenir tous les patients
app.get('/api/admin/patients', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(process.env.DATABASE_URL!);
  const allPatients = await db.select({ id: patients.id, name: patients.name, email: patients.email }).from(patients);
  return c.json(allPatients);
});

// Obtenir les détails d'un patient
app.get('/api/admin/patients/:id', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(process.env.DATABASE_URL!);
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
  const db = getDb(process.env.DATABASE_URL!);
  const allAppointments = await db.select().from(appointments).orderBy(desc(appointments.date));
  return c.json(allAppointments);
});

// Mettre à jour un rendez-vous (statut, notes)
app.patch('/api/admin/appointments/:id', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(process.env.DATABASE_URL!);
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
  const db = getDb(process.env.DATABASE_URL!);
  const body = await c.req.json();
  const validatedData = insertAvailabilitySlotSchema.parse(body);

  const [newSlot] = await db.insert(availabilitySlots).values(validatedData).returning();

  return c.json(newSlot, 201);
});

// Créer un administrateur
app.post('/api/admin/create', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(process.env.DATABASE_URL!);
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
    return c.json({ error: 'Impossible de créer l\'administrateur. L\'email existe peut-être déjà.' }, 409);
  }
});

// ==================== PATIENT ROUTES ====================

// Obtenir le profil du patient
app.get('/api/patient/profile', authMiddleware, requireUserType('patient'), async (c) => {
  const user = c.get('user');
  const db = getDb(process.env.DATABASE_URL!);

  const [patient] = await db.select().from(patients).where(eq(patients.id, user.id)).limit(1);
  if (!patient) {
    return c.json({ error: 'Patient non trouvé' }, 404);
  }

  const { password, therapistNotes, ...patientData } = patient;
  return c.json(patientData);
});

// Obtenir les rendez-vous du patient
app.get('/api/patient/appointments', authMiddleware, requireUserType('patient'), async (c) => {
  const user = c.get('user');
  const db = getDb(process.env.DATABASE_URL!);

  const patientAppointments = await db
    .select()
    .from(appointments)
    .where(eq(appointments.patientId, user.id))
    .orderBy(desc(appointments.date));

  return c.json(patientAppointments);
});

// Créer un rendez-vous
app.post('/api/patient/appointments', authMiddleware, requireUserType('patient'), async (c: any) => {
  try {
    const user = c.get('user');
    const db = getDb(process.env.DATABASE_URL!);
    const body = await c.req.json();
    const validatedData = insertAppointmentSchema.parse(body);

    if (validatedData.patientId !== user.id) {
      return c.json({ error: 'Vous ne pouvez créer un rendez-vous que pour vous-même' }, 403);
    }

    const [slot] = await db
      .select()
      .from(availabilitySlots)
      .where(and(eq(availabilitySlots.id, validatedData.slotId), eq(availabilitySlots.isBooked, false)));

    if (!slot) {
      return c.json({ error: 'Créneau non disponible ou inexistant' }, 409);
    }

    await db.update(availabilitySlots).set({ isBooked: true }).where(eq(availabilitySlots.id, validatedData.slotId));

    const [newAppointment] = await db
      .insert(appointments)
      .values({
        patientId: validatedData.patientId,
        slotId: validatedData.slotId,
        date: slot.startTime,
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

export default handle(app);
