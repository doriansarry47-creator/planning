import type { MockUser, MockAppointment } from './mock-types';

// Mock database pour le développement et les tests
class MockDatabase {
  private patients: MockUser[] = [];
  private appointments: MockAppointment[] = [];

  // Patients methods
  async findPatientById(id: string): Promise<MockUser | null> {
    return this.patients.find(p => p.id === id) || null;
  }

  async findPatientByEmail(email: string): Promise<MockUser | null> {
    return this.patients.find(p => p.email === email) || null;
  }

  async findAllPatients(): Promise<MockUser[]> {
    return [...this.patients];
  }

  async createPatient(patientData: Omit<MockUser, 'id' | 'createdAt'>): Promise<MockUser> {
    const newPatient: MockUser = {
      ...patientData,
      id: this.generateId(),
      createdAt: new Date()
    };
    this.patients.push(newPatient);
    return newPatient;
  }

  // Appointments methods
  async findAppointmentById(id: string): Promise<MockAppointment | null> {
    const appointment = this.appointments.find(a => a.id === id) || null;
    if (appointment) {
      // Ensure appointmentDate is accessible as both appointmentDate and date
      return {
        ...appointment,
        date: appointment.appointmentDate || appointment.date || appointment.appointmentDate
      };
    }
    return null;
  }

  async findAppointmentsByPatient(patientId: string): Promise<MockAppointment[]> {
    return this.appointments
      .filter(a => a.patientId === patientId)
      .map(a => ({
        ...a,
        date: a.appointmentDate || a.date || a.appointmentDate
      }));
  }

  async findAllAppointments(): Promise<MockAppointment[]> {
    return this.appointments.map(a => ({
      ...a,
      date: a.appointmentDate || a.date || a.appointmentDate
    }));
  }

  async createAppointment(appointmentData: Omit<MockAppointment, 'id' | 'createdAt'>): Promise<MockAppointment> {
    const newAppointment: MockAppointment = {
      ...appointmentData,
      id: this.generateId(),
      appointmentDate: appointmentData.appointmentDate || appointmentData.date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // Ensure date field is set for compatibility
    newAppointment.date = newAppointment.appointmentDate;
    
    this.appointments.push(newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: string, updateData: Partial<MockAppointment>): Promise<MockAppointment | null> {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) return null;

    this.appointments[index] = {
      ...this.appointments[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Ensure date field consistency
    if (updateData.appointmentDate) {
      this.appointments[index].date = updateData.appointmentDate;
    }

    return this.appointments[index];
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    this.appointments.splice(index, 1);
    return true;
  }

  // Additional methods for auth and other features
  async findUserByEmail(email: string): Promise<MockUser | null> {
    return this.findPatientByEmail(email);
  }

  async createUser(userData: Omit<MockUser, 'id' | 'createdAt'>): Promise<MockUser> {
    return this.createPatient(userData);
  }

  async findAppointmentsByDateRange(startDate: string, endDate: string): Promise<MockAppointment[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.appointments
      .filter(a => {
        const appointmentDate = new Date(a.appointmentDate || a.date || '');
        return appointmentDate >= start && appointmentDate <= end;
      })
      .map(a => ({
        ...a,
        date: a.appointmentDate || a.date || a.appointmentDate
      }));
  }

  async findAllPractitioners(): Promise<any[]> {
    // Mock practitioners data
    return [
      {
        id: '1',
        firstName: 'Dr. Sarah',
        lastName: 'Martin',
        email: 'sarah.martin@cabinet.com',
        speciality: 'Psychologue clinicienne',
        phone: '01.23.45.67.89',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
  }

  async createPractitioner(practitionerData: any): Promise<any> {
    const newPractitioner = {
      ...practitionerData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    return newPractitioner;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Initialize with some mock data
  async initialize() {
    // Add some mock patients
    const mockPatients: Omit<MockUser, 'id' | 'createdAt'>[] = [
      {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@email.com',
        password: 'hashedpassword',
        phone: '06.12.34.56.78',
        isReferredByProfessional: true,
        referringProfessional: 'Dr. Martin - Médecin traitant',
        consultationReason: 'Troubles anxieux avec manifestations somatiques',
        symptomsStartDate: '2024-01-15',
        preferredSessionType: 'cabinet',
        isActive: true
      },
      {
        firstName: 'Pierre',
        lastName: 'Durand',
        email: 'pierre.durand@email.com',
        password: 'hashedpassword',
        phone: '06.98.76.54.32',
        isReferredByProfessional: false,
        consultationReason: 'Difficultés de gestion du stress professionnel',
        preferredSessionType: 'visio',
        isActive: true
      }
    ];

    for (const patient of mockPatients) {
      await this.createPatient(patient);
    }
  }
}

export const mockDb = new MockDatabase();

// Initialize mock data
mockDb.initialize().catch(console.error);