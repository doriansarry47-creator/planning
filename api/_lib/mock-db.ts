// Mock database for demo purposes
// This is a simple implementation that stores data in memory and localStorage

import bcrypt from 'bcryptjs';

// Mock data structure
interface MockUser {
  id: string;
  username?: string;
  email: string;
  password: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  phoneNumber?: string;
  createdAt: string;
}

interface MockAppointment {
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

interface MockPractitioner {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  email: string;
  phoneNumber?: string;
  licenseNumber?: string;
  biography?: string;
  consultationDuration: number;
  isActive: boolean;
  createdAt: string;
}

// In-memory storage
let mockUsers: MockUser[] = [];
let mockAppointments: MockAppointment[] = [];
let mockPractitioners: MockPractitioner[] = [];

// Initialize with default data
export function initializeMockData() {
  if (mockUsers.length === 0) {
    // Add default admin user
    mockUsers.push({
      id: 'admin-1',
      username: 'admin',
      email: 'doriansarry47@gmail.com',
      password: bcrypt.hashSync('admin123', 10),
      fullName: 'Dorian Sarry',
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    // Add test patient
    mockUsers.push({
      id: 'patient-1',
      email: 'patient@test.fr',
      password: bcrypt.hashSync('patient123', 10),
      firstName: 'Jean',
      lastName: 'Dupont',
      phoneNumber: '0123456789',
      createdAt: new Date().toISOString()
    });

    // Add practitioners
    mockPractitioners.push({
      id: 'practitioner-1',
      firstName: 'Dorian',
      lastName: 'Sarry',
      specialization: 'Thérapie sensori-motrice',
      email: 'doriansarry47@gmail.com',
      phoneNumber: '0123456789',
      licenseNumber: 'THER001',
      biography: 'Spécialiste en thérapie sensori-motrice, stabilisation émotionnelle et traitement du psycho-traumatisme.',
      consultationDuration: 60,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }
}

// Mock database functions
export const mockDb = {
  // Users/Admins
  findUserByEmail: async (email: string) => {
    initializeMockData();
    return mockUsers.find(u => u.email === email && u.role === 'admin');
  },

  findUserById: async (id: string) => {
    initializeMockData();
    return mockUsers.find(u => u.id === id);
  },

  createUser: async (userData: Omit<MockUser, 'id' | 'createdAt'>) => {
    initializeMockData();
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  },

  // Patients
  findPatientByEmail: async (email: string) => {
    initializeMockData();
    return mockUsers.find(u => u.email === email && !u.role);
  },

  createPatient: async (patientData: Omit<MockUser, 'id' | 'createdAt'>) => {
    initializeMockData();
    const newPatient = {
      ...patientData,
      id: `patient-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    mockUsers.push(newPatient);
    return newPatient;
  },

  // Practitioners
  findAllPractitioners: async () => {
    initializeMockData();
    return mockPractitioners.filter(p => p.isActive);
  },

  findPractitionerById: async (id: string) => {
    initializeMockData();
    return mockPractitioners.find(p => p.id === id);
  },

  createPractitioner: async (practitionerData: Omit<MockPractitioner, 'id' | 'createdAt'>) => {
    initializeMockData();
    const newPractitioner = {
      ...practitionerData,
      id: `practitioner-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    mockPractitioners.push(newPractitioner);
    return newPractitioner;
  },

  // Appointments
  findAppointmentsByPatient: async (patientId: string) => {
    initializeMockData();
    return mockAppointments.filter(a => a.patientId === patientId);
  },

  findAllAppointments: async () => {
    initializeMockData();
    return mockAppointments;
  },

  createAppointment: async (appointmentData: Omit<MockAppointment, 'id' | 'createdAt'>) => {
    initializeMockData();
    const newAppointment = {
      ...appointmentData,
      id: `appointment-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    mockAppointments.push(newAppointment);
    return newAppointment;
  },

  updateAppointment: async (id: string, updates: Partial<MockAppointment>) => {
    initializeMockData();
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index !== -1) {
      mockAppointments[index] = { ...mockAppointments[index], ...updates };
      return mockAppointments[index];
    }
    return null;
  },

  deleteAppointment: async (id: string) => {
    initializeMockData();
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index !== -1) {
      mockAppointments.splice(index, 1);
      return true;
    }
    return false;
  }
};

export type { MockUser, MockAppointment, MockPractitioner };