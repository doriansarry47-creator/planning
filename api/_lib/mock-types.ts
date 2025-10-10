// Types pour les données mock utilisées dans le développement
export interface MockUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  isReferredByProfessional?: boolean;
  referringProfessional?: string | null;
  consultationReason?: string;
  symptomsStartDate?: string | null;
  preferredSessionType?: string;
  therapistNotes?: string;
  createdAt: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface MockAppointment {
  id: string;
  patientId: string;
  practitionerId?: string;
  appointmentDate: string;
  date?: string; // Alias pour appointmentDate
  duration: number;
  status: string;
  type?: string;
  reason: string;
  isReferredByProfessional?: boolean;
  referringProfessional?: string | null;
  symptomsStartDate?: string | null;
  therapistNotes?: string;
  sessionSummary?: string;
  reminderSent?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MockPatientWithAppointment extends MockUser {
  appointments?: MockAppointment[];
}