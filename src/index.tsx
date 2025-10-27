import { Hono } from 'hono';
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
app.use('/static/*', serveStatic({ root: './public' }));

// ==================== AUTH ROUTES ====================

// Inscription patient
app.post('/api/auth/patient/register', async (c) => {
  try {
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const validatedData = insertPatientSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existingPatient = await db.select().from(patients).where(eq(patients.email, validatedData.email)).limit(1);
    if (existingPatient.length > 0) {
      return c.json({ error: 'Cet email est déjà utilisé' }, 400);
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(validatedData.password);

    // Créer le patient
    const [newPatient] = await db.insert(patients).values({
      ...validatedData,
      password: hashedPassword,
    }).returning();

    // Générer le token
    const jwtSecret = c.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    const token = generateToken({ id: newPatient.id, email: newPatient.email, type: 'patient' }, jwtSecret);

    return c.json({
      token,
      user: {
        id: newPatient.id,
        email: newPatient.email,
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        type: 'patient',
      },
    }, 201);
  } catch (error: any) {
    console.error('Error registering patient:', error);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    return c.json({ error: 'Erreur lors de l\'inscription' }, 500);
  }
});

// Connexion patient
app.post('/api/auth/patient/login', async (c) => {
  try {
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const validatedData = loginSchema.parse(body);

    // Trouver le patient
    const [patient] = await db.select().from(patients).where(eq(patients.email, validatedData.email)).limit(1);
    if (!patient) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Vérifier le mot de passe
    const isValid = await comparePassword(validatedData.password, patient.password);
    if (!isValid) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Générer le token
    const jwtSecret = c.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    const token = generateToken({ id: patient.id, email: patient.email, type: 'patient' }, jwtSecret);

    return c.json({
      token,
      user: {
        id: patient.id,
        email: patient.email,
        firstName: patient.firstName,
        lastName: patient.lastName,
        type: 'patient',
      },
    });
  } catch (error: any) {
    console.error('Error logging in patient:', error);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    return c.json({ error: 'Erreur lors de la connexion' }, 500);
  }
});

// Connexion admin
app.post('/api/auth/admin/login', async (c) => {
  try {
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const validatedData = loginSchema.parse(body);

    // Trouver l'admin
    const [admin] = await db.select().from(admins).where(eq(admins.email, validatedData.email)).limit(1);
    if (!admin) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Vérifier si le compte est actif
    if (!admin.isActive) {
      return c.json({ error: 'Compte désactivé' }, 403);
    }

    // Vérifier si le compte est verrouillé
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      return c.json({ error: 'Compte temporairement verrouillé' }, 403);
    }

    // Vérifier le mot de passe
    const isValid = await comparePassword(validatedData.password, admin.password);
    if (!isValid) {
      // Incrémenter les tentatives de connexion
      await db.update(admins).set({ loginAttempts: admin.loginAttempts + 1 }).where(eq(admins.id, admin.id));
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Réinitialiser les tentatives et mettre à jour lastLogin
    await db.update(admins).set({ loginAttempts: 0, lastLogin: new Date() }).where(eq(admins.id, admin.id));

    // Générer le token
    const jwtSecret = c.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    const token = generateToken({ id: admin.id, email: admin.email, type: 'admin' }, jwtSecret);

    return c.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        type: 'admin',
      },
    });
  } catch (error: any) {
    console.error('Error logging in admin:', error);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    return c.json({ error: 'Erreur lors de la connexion' }, 500);
  }
});

// Vérifier le token
app.get('/api/auth/me', authMiddleware, async (c) => {
  const user = c.get('user');
  const db = getDb(c.env.DATABASE_URL);

  if (user.type === 'patient') {
    const [patient] = await db.select().from(patients).where(eq(patients.id, user.id)).limit(1);
    if (!patient) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }
    return c.json({
      user: {
        id: patient.id,
        email: patient.email,
        firstName: patient.firstName,
        lastName: patient.lastName,
        type: 'patient',
      },
    });
  } else if (user.type === 'admin') {
    const [admin] = await db.select().from(admins).where(eq(admins.id, user.id)).limit(1);
    if (!admin) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }
    return c.json({
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        type: 'admin',
      },
    });
  }

  return c.json({ error: 'Type d\'utilisateur invalide' }, 400);
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
app.post('/api/patient/appointments', authMiddleware, requireUserType('patient'), async (c) => {
  try {
    const user = c.get('user');
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const validatedData = insertAppointmentSchema.parse(body);

    // Vérifier que le patient crée un RDV pour lui-même
    if (validatedData.patientId !== user.id) {
      return c.json({ error: 'Vous ne pouvez créer un rendez-vous que pour vous-même' }, 403);
    }

    // Créer le rendez-vous
    const [newAppointment] = await db.insert(appointments).values({
      ...validatedData,
      date: new Date(validatedData.date),
    }).returning();

    return c.json(newAppointment, 201);
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    return c.json({ error: 'Erreur lors de la création du rendez-vous' }, 500);
  }
});

// ==================== ADMIN ROUTES ====================

// Obtenir tous les patients (admin)
app.get('/api/admin/patients', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  const allPatients = await db.select().from(patients).orderBy(desc(patients.createdAt));

  // Ne pas renvoyer les mots de passe
  const patientsWithoutPassword = allPatients.map(({ password, ...patient }) => patient);

  return c.json(patientsWithoutPassword);
});

// Obtenir un patient par ID (admin)
app.get('/api/admin/patients/:id', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const patientId = c.req.param('id');

  const [patient] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
  if (!patient) {
    return c.json({ error: 'Patient non trouvé' }, 404);
  }

  // Obtenir les rendez-vous et notes du patient
  const patientAppointments = await db.select().from(appointments).where(eq(appointments.patientId, patientId)).orderBy(desc(appointments.date));
  const patientNotes = await db.select().from(notes).where(eq(notes.patientId, patientId)).orderBy(desc(notes.createdAt));

  const { password, ...patientData } = patient;

  return c.json({
    ...patientData,
    appointments: patientAppointments,
    notes: patientNotes,
  });
});

// Obtenir tous les rendez-vous (admin)
app.get('/api/admin/appointments', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  const allAppointments = await db
    .select()
    .from(appointments)
    .orderBy(desc(appointments.date));

  return c.json(allAppointments);
});

// Mettre à jour un rendez-vous (admin)
app.patch('/api/admin/appointments/:id', authMiddleware, requireUserType('admin'), async (c) => {
  try {
    const db = getDb(c.env.DATABASE_URL);
    const appointmentId = c.req.param('id');
    const body = await c.req.json();

    const [updatedAppointment] = await db
      .update(appointments)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(appointments.id, appointmentId))
      .returning();

    if (!updatedAppointment) {
      return c.json({ error: 'Rendez-vous non trouvé' }, 404);
    }

    return c.json(updatedAppointment);
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return c.json({ error: 'Erreur lors de la mise à jour du rendez-vous' }, 500);
  }
});

// Créer des créneaux de disponibilité (admin)
app.post('/api/admin/availability-slots', authMiddleware, requireUserType('admin'), async (c) => {
  try {
    const db = getDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const validatedData = insertAvailabilitySlotSchema.parse(body);

    const [newSlot] = await db.insert(availabilitySlots).values(validatedData).returning();

    return c.json(newSlot, 201);
  } catch (error: any) {
    console.error('Error creating availability slot:', error);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    return c.json({ error: 'Erreur lors de la création du créneau' }, 500);
  }
});

// Obtenir les créneaux de disponibilité
app.get('/api/availability-slots', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const dateParam = c.req.query('date');

  let query = db.select().from(availabilitySlots).where(eq(availabilitySlots.isAvailable, true));

  if (dateParam) {
    query = query.where(gte(availabilitySlots.date, dateParam));
  }

  const slots = await query.orderBy(availabilitySlots.date, availabilitySlots.startTime);

  return c.json(slots);
});

// Obtenir les statistiques (admin)
app.get('/api/admin/statistics', authMiddleware, requireUserType('admin'), async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  const totalPatients = await db.select().from(patients);
  const totalAppointments = await db.select().from(appointments);
  const pendingAppointments = await db.select().from(appointments).where(eq(appointments.status, 'pending'));
  const confirmedAppointments = await db.select().from(appointments).where(eq(appointments.status, 'confirmed'));

  return c.json({
    totalPatients: totalPatients.length,
    totalAppointments: totalAppointments.length,
    pendingAppointments: pendingAppointments.length,
    confirmedAppointments: confirmedAppointments.length,
  });
});

// ==================== PAGE HTML PRINCIPALE ====================

// Page d'accueil avec application React
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestion de Rendez-vous - Thérapie Sensorimotrice</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <style>
          .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .card-hover {
            transition: all 0.3s ease;
          }
          .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="gradient-bg text-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold">
                        <i class="fas fa-heartbeat mr-2"></i>
                        Thérapie Sensorimotrice
                    </h1>
                    <div id="nav-buttons" class="space-x-4">
                        <!-- Buttons will be injected by JavaScript -->
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div id="app" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Content will be injected by JavaScript -->
        </div>

        <script>
          const API_URL = '/api';
          let currentUser = null;
          let authToken = localStorage.getItem('authToken');

          // Configuration axios
          if (authToken) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + authToken;
          }

          // Vérifier l'authentification au chargement
          async function checkAuth() {
            if (!authToken) {
              showLandingPage();
              return;
            }

            try {
              const response = await axios.get(API_URL + '/auth/me');
              currentUser = response.data.user;
              updateNavigation();
              if (currentUser.type === 'patient') {
                showPatientDashboard();
              } else if (currentUser.type === 'admin') {
                showAdminDashboard();
              }
            } catch (error) {
              console.error('Auth check failed:', error);
              logout();
            }
          }

          // Mettre à jour la navigation
          function updateNavigation() {
            const navButtons = document.getElementById('nav-buttons');
            if (currentUser) {
              navButtons.innerHTML = \`
                <span class="text-white mr-4">Bienvenue, \${currentUser.firstName || currentUser.name}!</span>
                <button onclick="logout()" class="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                  <i class="fas fa-sign-out-alt mr-2"></i>Déconnexion
                </button>
              \`;
            } else {
              navButtons.innerHTML = \`
                <button onclick="showLoginPage('patient')" class="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                  <i class="fas fa-user mr-2"></i>Connexion Patient
                </button>
                <button onclick="showLoginPage('admin')" class="bg-purple-800 text-white px-4 py-2 rounded-lg hover:bg-purple-900 transition">
                  <i class="fas fa-user-shield mr-2"></i>Connexion Admin
                </button>
              \`;
            }
          }

          // Déconnexion
          function logout() {
            localStorage.removeItem('authToken');
            authToken = null;
            currentUser = null;
            delete axios.defaults.headers.common['Authorization'];
            showLandingPage();
          }

          // Page d'accueil
          function showLandingPage() {
            updateNavigation();
            const app = document.getElementById('app');
            app.innerHTML = \`
              <div class="text-center py-16">
                <h2 class="text-5xl font-bold text-gray-800 mb-6">Bienvenue à la Thérapie Sensorimotrice</h2>
                <p class="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                  Gérez vos rendez-vous thérapeutiques en toute simplicité. Espace sécurisé pour patients et praticiens.
                </p>
                
                <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
                  <div class="card-hover bg-white p-8 rounded-xl shadow-lg">
                    <i class="fas fa-user-circle text-6xl text-purple-600 mb-4"></i>
                    <h3 class="text-2xl font-bold text-gray-800 mb-4">Espace Patient</h3>
                    <p class="text-gray-600 mb-6">Prenez rendez-vous, consultez votre historique et gérez vos séances</p>
                    <button onclick="showRegisterPage()" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition w-full mb-3">
                      <i class="fas fa-user-plus mr-2"></i>S'inscrire
                    </button>
                    <button onclick="showLoginPage('patient')" class="bg-purple-100 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-200 transition w-full">
                      <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                    </button>
                  </div>
                  
                  <div class="card-hover bg-white p-8 rounded-xl shadow-lg">
                    <i class="fas fa-user-md text-6xl text-purple-600 mb-4"></i>
                    <h3 class="text-2xl font-bold text-gray-800 mb-4">Espace Admin</h3>
                    <p class="text-gray-600 mb-6">Gérez les patients, les rendez-vous et les disponibilités</p>
                    <button onclick="showLoginPage('admin')" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition w-full">
                      <i class="fas fa-sign-in-alt mr-2"></i>Connexion Administrateur
                    </button>
                  </div>
                </div>
              </div>
            \`;
          }

          // Page de connexion
          function showLoginPage(type) {
            const app = document.getElementById('app');
            const title = type === 'patient' ? 'Connexion Patient' : 'Connexion Administrateur';
            const icon = type === 'patient' ? 'fa-user' : 'fa-user-shield';
            
            app.innerHTML = \`
              <div class="max-w-md mx-auto">
                <div class="bg-white p-8 rounded-xl shadow-lg">
                  <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">
                    <i class="fas \${icon} mr-2"></i>\${title}
                  </h2>
                  
                  <form id="loginForm" class="space-y-4">
                    <div>
                      <label class="block text-gray-700 mb-2">Email</label>
                      <input type="email" name="email" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    </div>
                    
                    <div>
                      <label class="block text-gray-700 mb-2">Mot de passe</label>
                      <input type="password" name="password" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    </div>
                    
                    <div id="loginError" class="text-red-600 text-sm hidden"></div>
                    
                    <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition">
                      <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                    </button>
                  </form>
                  
                  <div class="mt-4 text-center">
                    <button onclick="showLandingPage()" class="text-purple-600 hover:underline">
                      <i class="fas fa-arrow-left mr-2"></i>Retour à l'accueil
                    </button>
                    \${type === 'patient' ? '<br><button onclick="showRegisterPage()" class="text-purple-600 hover:underline mt-2">Créer un compte patient</button>' : ''}
                  </div>
                </div>
              </div>
            \`;

            document.getElementById('loginForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                email: formData.get('email'),
                password: formData.get('password')
              };

              try {
                const response = await axios.post(\`\${API_URL}/auth/\${type}/login\`, data);
                authToken = response.data.token;
                currentUser = response.data.user;
                localStorage.setItem('authToken', authToken);
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + authToken;
                
                if (type === 'patient') {
                  showPatientDashboard();
                } else {
                  showAdminDashboard();
                }
              } catch (error) {
                const errorDiv = document.getElementById('loginError');
                errorDiv.textContent = error.response?.data?.error || 'Erreur de connexion';
                errorDiv.classList.remove('hidden');
              }
            });
          }

          // Page d'inscription patient
          function showRegisterPage() {
            const app = document.getElementById('app');
            
            app.innerHTML = \`
              <div class="max-w-2xl mx-auto">
                <div class="bg-white p-8 rounded-xl shadow-lg">
                  <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">
                    <i class="fas fa-user-plus mr-2"></i>Inscription Patient
                  </h2>
                  
                  <form id="registerForm" class="space-y-4">
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-gray-700 mb-2">Prénom *</label>
                        <input type="text" name="firstName" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                      </div>
                      <div>
                        <label class="block text-gray-700 mb-2">Nom *</label>
                        <input type="text" name="lastName" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-gray-700 mb-2">Email *</label>
                      <input type="email" name="email" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    </div>
                    
                    <div>
                      <label class="block text-gray-700 mb-2">Mot de passe * (min. 8 caractères)</label>
                      <input type="password" name="password" required minlength="8" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    </div>
                    
                    <div>
                      <label class="block text-gray-700 mb-2">Téléphone</label>
                      <input type="tel" name="phone" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    </div>
                    
                    <div>
                      <label class="block text-gray-700 mb-2">Motif de consultation * (détaillez votre besoin)</label>
                      <textarea name="consultationReason" required minlength="10" rows="3" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"></textarea>
                    </div>
                    
                    <div>
                      <label class="block text-gray-700 mb-2">Type de consultation préféré *</label>
                      <select name="preferredSessionType" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <option value="">Choisissez...</option>
                        <option value="cabinet">En cabinet</option>
                        <option value="visio">En visioconférence</option>
                      </select>
                    </div>
                    
                    <div class="flex items-center">
                      <input type="checkbox" name="isReferredByProfessional" id="isReferred" class="mr-2">
                      <label for="isReferred" class="text-gray-700">Êtes-vous référé par un professionnel de santé ?</label>
                    </div>
                    
                    <div id="referralFields" class="hidden space-y-4">
                      <div>
                        <label class="block text-gray-700 mb-2">Nom du professionnel référent</label>
                        <input type="text" name="referringProfessional" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-gray-700 mb-2">Depuis quand ressentez-vous ce besoin ?</label>
                      <input type="text" name="symptomsStartDate" placeholder="Ex: 6 mois, 1 an..." class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    </div>
                    
                    <div id="registerError" class="text-red-600 text-sm hidden"></div>
                    
                    <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition">
                      <i class="fas fa-user-plus mr-2"></i>Créer mon compte
                    </button>
                  </form>
                  
                  <div class="mt-4 text-center">
                    <button onclick="showLandingPage()" class="text-purple-600 hover:underline">
                      <i class="fas fa-arrow-left mr-2"></i>Retour à l'accueil
                    </button>
                    <br>
                    <button onclick="showLoginPage('patient')" class="text-purple-600 hover:underline mt-2">
                      Déjà inscrit ? Se connecter
                    </button>
                  </div>
                </div>
              </div>
            \`;

            // Afficher/masquer les champs de référence
            document.getElementById('isReferred').addEventListener('change', (e) => {
              const referralFields = document.getElementById('referralFields');
              if (e.target.checked) {
                referralFields.classList.remove('hidden');
              } else {
                referralFields.classList.add('hidden');
              }
            });

            document.getElementById('registerForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                phone: formData.get('phone') || undefined,
                consultationReason: formData.get('consultationReason'),
                preferredSessionType: formData.get('preferredSessionType'),
                isReferredByProfessional: formData.get('isReferredByProfessional') === 'on',
                referringProfessional: formData.get('referringProfessional') || undefined,
                symptomsStartDate: formData.get('symptomsStartDate') || undefined,
              };

              try {
                const response = await axios.post(\`\${API_URL}/auth/patient/register\`, data);
                authToken = response.data.token;
                currentUser = response.data.user;
                localStorage.setItem('authToken', authToken);
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + authToken;
                showPatientDashboard();
              } catch (error) {
                const errorDiv = document.getElementById('registerError');
                errorDiv.textContent = error.response?.data?.error || 'Erreur lors de l\'inscription';
                errorDiv.classList.remove('hidden');
              }
            });
          }

          // Tableau de bord patient
          async function showPatientDashboard() {
            updateNavigation();
            const app = document.getElementById('app');
            
            app.innerHTML = \`
              <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">
                  <i class="fas fa-home mr-2"></i>Tableau de bord Patient
                </h2>
              </div>

              <div class="grid md:grid-cols-2 gap-6 mb-8">
                <div class="card-hover bg-white p-6 rounded-xl shadow-lg">
                  <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-calendar-plus mr-2 text-purple-600"></i>Prendre rendez-vous
                  </h3>
                  <p class="text-gray-600 mb-4">Réservez un créneau pour votre prochaine séance</p>
                  <button onclick="showBookingPage()" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                    Voir les disponibilités
                  </button>
                </div>

                <div class="card-hover bg-white p-6 rounded-xl shadow-lg">
                  <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-user-circle mr-2 text-purple-600"></i>Mon profil
                  </h3>
                  <p class="text-gray-600 mb-4">Consultez et modifiez vos informations personnelles</p>
                  <button onclick="showPatientProfile()" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                    Voir mon profil
                  </button>
                </div>
              </div>

              <div class="bg-white p-6 rounded-xl shadow-lg">
                <h3 class="text-2xl font-bold text-gray-800 mb-4">
                  <i class="fas fa-calendar-check mr-2 text-purple-600"></i>Mes rendez-vous
                </h3>
                <div id="patientAppointments">
                  <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
                  </div>
                </div>
              </div>
            \`;

            // Charger les rendez-vous
            try {
              const response = await axios.get(\`\${API_URL}/patient/appointments\`);
              const appointments = response.data;
              const container = document.getElementById('patientAppointments');

              if (appointments.length === 0) {
                container.innerHTML = '<p class="text-gray-600 text-center py-4">Aucun rendez-vous pour le moment</p>';
              } else {
                container.innerHTML = appointments.map(apt => \`
                  <div class="border-b py-4 last:border-b-0">
                    <div class="flex justify-between items-center">
                      <div>
                        <p class="font-semibold text-gray-800">
                          <i class="fas fa-calendar mr-2"></i>\${new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p class="text-gray-600 mt-1">
                          <i class="fas fa-\${apt.type === 'cabinet' ? 'hospital-alt' : 'video'} mr-2"></i>
                          \${apt.type === 'cabinet' ? 'En cabinet' : 'En visioconférence'}
                        </p>
                        <p class="text-gray-600 mt-1"><i class="fas fa-notes-medical mr-2"></i>\${apt.reason}</p>
                      </div>
                      <div>
                        <span class="px-4 py-2 rounded-full text-sm font-semibold
                          \${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'}">
                          \${apt.status === 'confirmed' ? 'Confirmé' : 
                            apt.status === 'pending' ? 'En attente' : 
                            apt.status === 'cancelled' ? 'Annulé' : 
                            'Terminé'}
                        </span>
                      </div>
                    </div>
                  </div>
                \`).join('');
              }
            } catch (error) {
              console.error('Error loading appointments:', error);
              document.getElementById('patientAppointments').innerHTML = '<p class="text-red-600 text-center py-4">Erreur lors du chargement des rendez-vous</p>';
            }
          }

          // Page de réservation
          async function showBookingPage() {
            const app = document.getElementById('app');
            app.innerHTML = \`
              <div class="max-w-4xl mx-auto">
                <h2 class="text-3xl font-bold text-gray-800 mb-6">
                  <i class="fas fa-calendar-plus mr-2"></i>Prendre rendez-vous
                </h2>
                
                <div class="bg-white p-8 rounded-xl shadow-lg">
                  <form id="bookingForm" class="space-y-4">
                    <div>
                      <label class="block text-gray-700 mb-2">Date et heure *</label>
                      <input type="datetime-local" name="date" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    </div>
                    
                    <div>
                      <label class="block text-gray-700 mb-2">Type de consultation *</label>
                      <select name="type" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <option value="cabinet">En cabinet</option>
                        <option value="visio">En visioconférence</option>
                      </select>
                    </div>
                    
                    <div>
                      <label class="block text-gray-700 mb-2">Motif de consultation *</label>
                      <textarea name="reason" required minlength="10" rows="4" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"></textarea>
                    </div>
                    
                    <div id="bookingError" class="text-red-600 text-sm hidden"></div>
                    <div id="bookingSuccess" class="text-green-600 text-sm hidden"></div>
                    
                    <div class="flex space-x-4">
                      <button type="submit" class="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition">
                        <i class="fas fa-check mr-2"></i>Confirmer le rendez-vous
                      </button>
                      <button type="button" onclick="showPatientDashboard()" class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition">
                        <i class="fas fa-times mr-2"></i>Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            \`;

            document.getElementById('bookingForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                patientId: currentUser.id,
                date: formData.get('date'),
                type: formData.get('type'),
                reason: formData.get('reason'),
                duration: 60,
                status: 'pending'
              };

              try {
                await axios.post(\`\${API_URL}/patient/appointments\`, data);
                const successDiv = document.getElementById('bookingSuccess');
                successDiv.textContent = 'Rendez-vous créé avec succès! Redirection...';
                successDiv.classList.remove('hidden');
                setTimeout(() => showPatientDashboard(), 2000);
              } catch (error) {
                const errorDiv = document.getElementById('bookingError');
                errorDiv.textContent = error.response?.data?.error || 'Erreur lors de la création du rendez-vous';
                errorDiv.classList.remove('hidden');
              }
            });
          }

          // Profil patient
          async function showPatientProfile() {
            const app = document.getElementById('app');
            app.innerHTML = \`
              <div class="max-w-2xl mx-auto">
                <h2 class="text-3xl font-bold text-gray-800 mb-6">
                  <i class="fas fa-user-circle mr-2"></i>Mon profil
                </h2>
                
                <div class="bg-white p-8 rounded-xl shadow-lg">
                  <div id="profileContent">
                    <div class="text-center py-8">
                      <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
                    </div>
                  </div>
                  
                  <button onclick="showPatientDashboard()" class="mt-6 w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition">
                    <i class="fas fa-arrow-left mr-2"></i>Retour au tableau de bord
                  </button>
                </div>
              </div>
            \`;

            try {
              const response = await axios.get(\`\${API_URL}/patient/profile\`);
              const patient = response.data;
              
              document.getElementById('profileContent').innerHTML = \`
                <div class="space-y-4">
                  <div>
                    <label class="block text-gray-700 font-semibold mb-1">Nom complet</label>
                    <p class="text-gray-800">\${patient.firstName} \${patient.lastName}</p>
                  </div>
                  
                  <div>
                    <label class="block text-gray-700 font-semibold mb-1">Email</label>
                    <p class="text-gray-800">\${patient.email}</p>
                  </div>
                  
                  \${patient.phone ? \`
                    <div>
                      <label class="block text-gray-700 font-semibold mb-1">Téléphone</label>
                      <p class="text-gray-800">\${patient.phone}</p>
                    </div>
                  \` : ''}
                  
                  <div>
                    <label class="block text-gray-700 font-semibold mb-1">Type de consultation préféré</label>
                    <p class="text-gray-800">\${patient.preferredSessionType === 'cabinet' ? 'En cabinet' : 'En visioconférence'}</p>
                  </div>
                  
                  <div>
                    <label class="block text-gray-700 font-semibold mb-1">Motif de consultation</label>
                    <p class="text-gray-800">\${patient.consultationReason}</p>
                  </div>
                  
                  <div>
                    <label class="block text-gray-700 font-semibold mb-1">Date d'inscription</label>
                    <p class="text-gray-800">\${new Date(patient.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              \`;
            } catch (error) {
              console.error('Error loading profile:', error);
              document.getElementById('profileContent').innerHTML = '<p class="text-red-600 text-center py-4">Erreur lors du chargement du profil</p>';
            }
          }

          // Tableau de bord admin
          async function showAdminDashboard() {
            updateNavigation();
            const app = document.getElementById('app');
            
            app.innerHTML = \`
              <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">
                  <i class="fas fa-chart-line mr-2"></i>Tableau de bord Administrateur
                </h2>
              </div>

              <div id="adminStats" class="grid md:grid-cols-4 gap-6 mb-8">
                <div class="text-center py-8 col-span-4">
                  <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-6 mb-8">
                <div class="card-hover bg-white p-6 rounded-xl shadow-lg">
                  <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-users mr-2 text-purple-600"></i>Gestion des patients
                  </h3>
                  <button onclick="showPatientsManagement()" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                    Voir tous les patients
                  </button>
                </div>

                <div class="card-hover bg-white p-6 rounded-xl shadow-lg">
                  <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-calendar-alt mr-2 text-purple-600"></i>Gestion des créneaux
                  </h3>
                  <button onclick="showSlotsManagement()" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                    Gérer les disponibilités
                  </button>
                </div>
              </div>

              <div class="bg-white p-6 rounded-xl shadow-lg">
                <h3 class="text-2xl font-bold text-gray-800 mb-4">
                  <i class="fas fa-calendar-check mr-2 text-purple-600"></i>Rendez-vous récents
                </h3>
                <div id="adminAppointments">
                  <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
                  </div>
                </div>
              </div>
            \`;

            // Charger les statistiques
            try {
              const statsResponse = await axios.get(\`\${API_URL}/admin/statistics\`);
              const stats = statsResponse.data;
              
              document.getElementById('adminStats').innerHTML = \`
                <div class="bg-white p-6 rounded-xl shadow-lg text-center card-hover">
                  <i class="fas fa-users text-4xl text-purple-600 mb-2"></i>
                  <p class="text-3xl font-bold text-gray-800">\${stats.totalPatients}</p>
                  <p class="text-gray-600">Patients</p>
                </div>
                
                <div class="bg-white p-6 rounded-xl shadow-lg text-center card-hover">
                  <i class="fas fa-calendar text-4xl text-blue-600 mb-2"></i>
                  <p class="text-3xl font-bold text-gray-800">\${stats.totalAppointments}</p>
                  <p class="text-gray-600">Rendez-vous total</p>
                </div>
                
                <div class="bg-white p-6 rounded-xl shadow-lg text-center card-hover">
                  <i class="fas fa-clock text-4xl text-yellow-600 mb-2"></i>
                  <p class="text-3xl font-bold text-gray-800">\${stats.pendingAppointments}</p>
                  <p class="text-gray-600">En attente</p>
                </div>
                
                <div class="bg-white p-6 rounded-xl shadow-lg text-center card-hover">
                  <i class="fas fa-check-circle text-4xl text-green-600 mb-2"></i>
                  <p class="text-3xl font-bold text-gray-800">\${stats.confirmedAppointments}</p>
                  <p class="text-gray-600">Confirmés</p>
                </div>
              \`;
            } catch (error) {
              console.error('Error loading statistics:', error);
            }

            // Charger les rendez-vous
            try {
              const appointmentsResponse = await axios.get(\`\${API_URL}/admin/appointments\`);
              const appointments = appointmentsResponse.data;
              const container = document.getElementById('adminAppointments');

              if (appointments.length === 0) {
                container.innerHTML = '<p class="text-gray-600 text-center py-4">Aucun rendez-vous</p>';
              } else {
                container.innerHTML = appointments.slice(0, 10).map(apt => \`
                  <div class="border-b py-4 last:border-b-0">
                    <div class="flex justify-between items-center">
                      <div>
                        <p class="font-semibold text-gray-800">
                          <i class="fas fa-calendar mr-2"></i>\${new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p class="text-gray-600 mt-1">
                          <i class="fas fa-user mr-2"></i>Patient ID: \${apt.patientId}
                        </p>
                        <p class="text-gray-600 mt-1">
                          <i class="fas fa-\${apt.type === 'cabinet' ? 'hospital-alt' : 'video'} mr-2"></i>
                          \${apt.type === 'cabinet' ? 'En cabinet' : 'En visioconférence'}
                        </p>
                        <p class="text-gray-600 mt-1"><i class="fas fa-notes-medical mr-2"></i>\${apt.reason}</p>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="px-4 py-2 rounded-full text-sm font-semibold
                          \${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'}">
                          \${apt.status === 'confirmed' ? 'Confirmé' : 
                            apt.status === 'pending' ? 'En attente' : 
                            apt.status === 'cancelled' ? 'Annulé' : 
                            'Terminé'}
                        </span>
                        \${apt.status === 'pending' ? \`
                          <button onclick="updateAppointmentStatus('\${apt.id}', 'confirmed')" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm">
                            <i class="fas fa-check mr-1"></i>Confirmer
                          </button>
                        \` : ''}
                      </div>
                    </div>
                  </div>
                \`).join('');
              }
            } catch (error) {
              console.error('Error loading appointments:', error);
              document.getElementById('adminAppointments').innerHTML = '<p class="text-red-600 text-center py-4">Erreur lors du chargement des rendez-vous</p>';
            }
          }

          // Mettre à jour le statut d'un rendez-vous
          async function updateAppointmentStatus(appointmentId, status) {
            try {
              await axios.patch(\`\${API_URL}/admin/appointments/\${appointmentId}\`, { status });
              showAdminDashboard(); // Rafraîchir
            } catch (error) {
              console.error('Error updating appointment:', error);
              alert('Erreur lors de la mise à jour du rendez-vous');
            }
          }

          // Gestion des patients (admin)
          async function showPatientsManagement() {
            const app = document.getElementById('app');
            app.innerHTML = \`
              <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">
                  <i class="fas fa-users mr-2"></i>Gestion des patients
                </h2>
                <button onclick="showAdminDashboard()" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                  <i class="fas fa-arrow-left mr-2"></i>Retour au tableau de bord
                </button>
              </div>

              <div class="bg-white p-6 rounded-xl shadow-lg">
                <div id="patientsList">
                  <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
                  </div>
                </div>
              </div>
            \`;

            try {
              const response = await axios.get(\`\${API_URL}/admin/patients\`);
              const patients = response.data;
              const container = document.getElementById('patientsList');

              if (patients.length === 0) {
                container.innerHTML = '<p class="text-gray-600 text-center py-4">Aucun patient</p>';
              } else {
                container.innerHTML = \`
                  <div class="overflow-x-auto">
                    <table class="w-full">
                      <thead>
                        <tr class="border-b">
                          <th class="text-left py-3 px-4">Nom</th>
                          <th class="text-left py-3 px-4">Email</th>
                          <th class="text-left py-3 px-4">Téléphone</th>
                          <th class="text-left py-3 px-4">Type préféré</th>
                          <th class="text-left py-3 px-4">Date d'inscription</th>
                        </tr>
                      </thead>
                      <tbody>
                        \${patients.map(patient => \`
                          <tr class="border-b hover:bg-gray-50">
                            <td class="py-3 px-4">\${patient.firstName} \${patient.lastName}</td>
                            <td class="py-3 px-4">\${patient.email}</td>
                            <td class="py-3 px-4">\${patient.phone || '-'}</td>
                            <td class="py-3 px-4">\${patient.preferredSessionType === 'cabinet' ? 'En cabinet' : 'En visio'}</td>
                            <td class="py-3 px-4">\${new Date(patient.createdAt).toLocaleDateString('fr-FR')}</td>
                          </tr>
                        \`).join('')}
                      </tbody>
                    </table>
                  </div>
                \`;
              }
            } catch (error) {
              console.error('Error loading patients:', error);
              document.getElementById('patientsList').innerHTML = '<p class="text-red-600 text-center py-4">Erreur lors du chargement des patients</p>';
            }
          }

          // Gestion des créneaux (admin)
          function showSlotsManagement() {
            const app = document.getElementById('app');
            app.innerHTML = \`
              <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">
                  <i class="fas fa-calendar-alt mr-2"></i>Gestion des créneaux
                </h2>
                <button onclick="showAdminDashboard()" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                  <i class="fas fa-arrow-left mr-2"></i>Retour au tableau de bord
                </button>
              </div>

              <div class="bg-white p-6 rounded-xl shadow-lg">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Créer un nouveau créneau</h3>
                <form id="slotForm" class="space-y-4">
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-gray-700 mb-2">Date</label>
                      <input type="date" name="date" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    </div>
                    <div>
                      <label class="block text-gray-700 mb-2">Durée (minutes)</label>
                      <input type="number" name="duration" value="60" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    </div>
                  </div>
                  
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-gray-700 mb-2">Heure de début</label>
                      <input type="time" name="startTime" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    </div>
                    <div>
                      <label class="block text-gray-700 mb-2">Heure de fin</label>
                      <input type="time" name="endTime" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-gray-700 mb-2">Notes (optionnel)</label>
                    <textarea name="notes" rows="2" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"></textarea>
                  </div>
                  
                  <div id="slotError" class="text-red-600 text-sm hidden"></div>
                  <div id="slotSuccess" class="text-green-600 text-sm hidden"></div>
                  
                  <button type="submit" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
                    <i class="fas fa-plus mr-2"></i>Créer le créneau
                  </button>
                </form>
              </div>
            \`;

            document.getElementById('slotForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                date: formData.get('date'),
                startTime: formData.get('startTime'),
                endTime: formData.get('endTime'),
                duration: parseInt(formData.get('duration')),
                notes: formData.get('notes') || undefined,
              };

              try {
                await axios.post(\`\${API_URL}/admin/availability-slots\`, data);
                const successDiv = document.getElementById('slotSuccess');
                successDiv.textContent = 'Créneau créé avec succès!';
                successDiv.classList.remove('hidden');
                e.target.reset();
                setTimeout(() => successDiv.classList.add('hidden'), 3000);
              } catch (error) {
                const errorDiv = document.getElementById('slotError');
                errorDiv.textContent = error.response?.data?.error || 'Erreur lors de la création du créneau';
                errorDiv.classList.remove('hidden');
              }
            });
          }

          // Initialiser l'application
          checkAuth();
        </script>
    </body>
    </html>
  `);
});

// Fallback pour toutes les autres routes (SPA)
app.get('*', (c) => {
  return c.redirect('/');
});

export default app;
