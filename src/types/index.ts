// Types pour l'authentification
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'practitioner';
}

export interface Patient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Practitioner {
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
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  practitionerId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  reason?: string;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  patient?: Patient;
  practitioner?: Practitioner;
}

export interface TimeSlot {
  id: string;
  practitionerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
}

export interface AvailabilitySlot {
  id: string;
  practitionerId: string;
  startTime: string;
  endTime: string;
  recurringRule?: string;
  capacity: number;
  isBooked: boolean;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Types pour les formulaires
export interface LoginForm {
  email: string;
  password: string;
}

export interface PatientRegistrationForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export interface AppointmentForm {
  practitionerId: string;
  appointmentDate: string;
  startTime: string;
  reason?: string;
}

// Types pour l'état de l'application
export interface AuthState {
  user: User | Patient | null;
  token: string | null;
  isAuthenticated: boolean;
  userType: 'admin' | 'patient' | null;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}