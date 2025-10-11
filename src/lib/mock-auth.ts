// Mock authentication system for demo purposes
// This stores data in localStorage and simulates API calls

export interface MockUser {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  role?: string;
  userType: 'admin' | 'patient';
}

export interface MockPractitioner {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  email: string;
  phoneNumber?: string;
  biography?: string;
  consultationDuration: number;
}

export interface MockAppointment {
  id: string;
  patientId: string;
  practitionerId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}

// Initialize mock data
const initializeMockData = () => {
  const users = localStorage.getItem('mockUsers');
  if (!users) {
    const defaultUsers: MockUser[] = [
      {
        id: 'admin-1',
        email: 'doriansarry47@gmail.com',
        password: 'admin123', // In real app, this would be hashed
        fullName: 'Dorian Sarry',
        username: 'admin',
        role: 'admin',
        userType: 'admin'
      },
      {
        id: 'admin-2',
        email: 'doriansarry@yahoo.fr',
        password: 'admin123',
        fullName: 'Dorian Sarry',
        username: 'admin2',
        role: 'admin',
        userType: 'admin'
      },
      {
        id: 'admin-3',
        email: 'admin@medplan.fr',
        password: 'admin123',
        fullName: 'Admin Medplan',
        username: 'admin3',
        role: 'admin',
        userType: 'admin'
      },
      {
        id: 'patient-1',
        email: 'patient@test.fr',
        password: 'patient123',
        firstName: 'Jean',
        lastName: 'Dupont',
        userType: 'patient'
      }
    ];
    localStorage.setItem('mockUsers', JSON.stringify(defaultUsers));
  }

  const practitioners = localStorage.getItem('mockPractitioners');
  if (!practitioners) {
    const defaultPractitioners: MockPractitioner[] = [
      {
        id: 'practitioner-1',
        firstName: 'Dorian',
        lastName: 'Sarry',
        specialization: 'Thérapie sensori-motrice',
        email: 'doriansarry47@gmail.com',
        phoneNumber: '+33 1 23 45 67 89',
        biography: 'Spécialiste en thérapie sensori-motrice, stabilisation émotionnelle et traitement du psycho-traumatisme. Accompagnement bienveillant et approche moderne pour votre bien-être.',
        consultationDuration: 60
      },
      {
        id: 'practitioner-2',
        firstName: 'Dr. Marie',
        lastName: 'Dubois',
        specialization: 'Psychologie clinique',
        email: 'marie.dubois@therapie.fr',
        phoneNumber: '+33 1 23 45 67 90',
        biography: 'Psychologue clinicienne spécialisée dans les troubles anxieux et la thérapie cognitive-comportementale.',
        consultationDuration: 45
      }
    ];
    localStorage.setItem('mockPractitioners', JSON.stringify(defaultPractitioners));
  }

  const appointments = localStorage.getItem('mockAppointments');
  if (!appointments) {
    localStorage.setItem('mockAppointments', JSON.stringify([]));
  }
};

// Mock API functions
export const mockAuth = {
  // Login function
  login: async (email: string, password: string, userType: 'admin' | 'patient') => {
    initializeMockData();
    
    const users: MockUser[] = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const user = users.find(u => 
      u.email === email && 
      u.password === password && 
      u.userType === userType
    );

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Create a mock token (just base64 encoded user data for demo)
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email, userType }));
    
    // Remove password from returned user data
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token,
    };
  },

  // Register function
  register: async (userData: any, userType: 'admin' | 'patient') => {
    initializeMockData();
    
    const users: MockUser[] = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Cette adresse email est déjà utilisée');
    }

    // Create new user
    const newUser: MockUser = {
      id: `${userType}-${Date.now()}`,
      ...userData,
      userType,
    };

    users.push(newUser);
    localStorage.setItem('mockUsers', JSON.stringify(users));

    // Create a mock token
    const token = btoa(JSON.stringify({ userId: newUser.id, email: newUser.email, userType }));
    
    // Remove password from returned user data
    const { password: _, ...userWithoutPassword } = newUser;
    
    return {
      user: userWithoutPassword,
      token,
    };
  },

  // Verify token function
  verifyToken: (token: string) => {
    try {
      return JSON.parse(atob(token));
    } catch {
      throw new Error('Token invalide');
    }
  }
};

export const mockPractitioners = {
  getAll: async () => {
    initializeMockData();
    return JSON.parse(localStorage.getItem('mockPractitioners') || '[]');
  },

  create: async (practitionerData: Omit<MockPractitioner, 'id'>) => {
    initializeMockData();
    const practitioners: MockPractitioner[] = JSON.parse(localStorage.getItem('mockPractitioners') || '[]');
    
    const newPractitioner: MockPractitioner = {
      id: `practitioner-${Date.now()}`,
      ...practitionerData,
    };

    practitioners.push(newPractitioner);
    localStorage.setItem('mockPractitioners', JSON.stringify(practitioners));
    
    return newPractitioner;
  }
};

export const mockAppointments = {
  getByPatient: async (patientId: string) => {
    initializeMockData();
    const appointments: MockAppointment[] = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
    const practitioners: MockPractitioner[] = JSON.parse(localStorage.getItem('mockPractitioners') || '[]');
    
    return appointments
      .filter(a => a.patientId === patientId)
      .map(appointment => {
        const practitioner = practitioners.find(p => p.id === appointment.practitionerId);
        return {
          ...appointment,
          practitioner: practitioner ? {
            id: practitioner.id,
            firstName: practitioner.firstName,
            lastName: practitioner.lastName,
            specialization: practitioner.specialization,
          } : null
        };
      });
  },

  getAll: async () => {
    initializeMockData();
    const appointments: MockAppointment[] = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
    const users: MockUser[] = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const practitioners: MockPractitioner[] = JSON.parse(localStorage.getItem('mockPractitioners') || '[]');
    
    return appointments.map(appointment => {
      const patient = users.find(u => u.id === appointment.patientId);
      const practitioner = practitioners.find(p => p.id === appointment.practitionerId);
      
      return {
        ...appointment,
        patient: patient ? {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
        } : null,
        practitioner: practitioner ? {
          id: practitioner.id,
          firstName: practitioner.firstName,
          lastName: practitioner.lastName,
          specialization: practitioner.specialization,
        } : null
      };
    });
  },

  create: async (appointmentData: Omit<MockAppointment, 'id' | 'createdAt' | 'endTime'>) => {
    initializeMockData();
    const appointments: MockAppointment[] = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
    const practitioners: MockPractitioner[] = JSON.parse(localStorage.getItem('mockPractitioners') || '[]');
    
    const practitioner = practitioners.find(p => p.id === appointmentData.practitionerId);
    if (!practitioner) {
      throw new Error('Praticien non trouvé');
    }

    // Calculate end time
    const startTime = new Date(`2000-01-01T${appointmentData.startTime}`);
    const endTime = new Date(startTime.getTime() + practitioner.consultationDuration * 60000);
    const endTimeString = endTime.toTimeString().slice(0, 8);
    
    const newAppointment: MockAppointment = {
      id: `appointment-${Date.now()}`,
      ...appointmentData,
      endTime: endTimeString,
      status: appointmentData.status || 'scheduled',
      createdAt: new Date().toISOString(),
    };

    appointments.push(newAppointment);
    localStorage.setItem('mockAppointments', JSON.stringify(appointments));
    
    return newAppointment;
  },

  update: async (id: string, updates: Partial<MockAppointment>) => {
    initializeMockData();
    const appointments: MockAppointment[] = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
    
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates };
      localStorage.setItem('mockAppointments', JSON.stringify(appointments));
      return appointments[index];
    }
    
    throw new Error('Rendez-vous non trouvé');
  },

  delete: async (id: string) => {
    initializeMockData();
    const appointments: MockAppointment[] = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
    
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments.splice(index, 1);
      localStorage.setItem('mockAppointments', JSON.stringify(appointments));
      return true;
    }
    
    throw new Error('Rendez-vous non trouvé');
  }
};