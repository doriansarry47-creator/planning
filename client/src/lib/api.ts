import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-app.vercel.app/api' 
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface AppointmentData {
  practitionerId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
  notes?: string;
}

interface PractitionerData {
  firstName: string;
  lastName: string;
  specialization: string;
  email: string;
  phoneNumber?: string;
  licenseNumber?: string;
  biography?: string;
  consultationDuration?: number;
}

interface TimeSlotData {
  practitionerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface AvailabilitySlotData {
  practitionerId: string;
  startTime: string;
  endTime: string;
  capacity?: number;
  notes?: string;
}

// Authentication API
export const authAPI = {
  // Patient authentication
  loginPatient: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login/patient', credentials);
    return response.data;
  },
  
  registerPatient: async (data: RegisterData) => {
    const response = await api.post('/auth/register/patient', data);
    return response.data;
  },
  
  // Admin authentication
  loginAdmin: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login/admin', credentials);
    return response.data;
  },
  
  registerAdmin: async (data: Omit<RegisterData, 'firstName' | 'lastName'> & { username: string; fullName: string }) => {
    const response = await api.post('/auth/register/admin', data);
    return response.data;
  },
  
  // Token verification
  verifyToken: async (token: string) => {
    const response = await api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

// Practitioners API
export const practitionersAPI = {
  getAll: async () => {
    const response = await api.get('/practitioners');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/practitioners/${id}`);
    return response.data;
  },
  
  create: async (data: PractitionerData, token: string) => {
    const response = await api.post('/practitioners', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  update: async (id: string, data: Partial<PractitionerData>, token: string) => {
    const response = await api.put(`/practitioners/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  delete: async (id: string, token: string) => {
    const response = await api.delete(`/practitioners/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

// Appointments API
export const appointmentsAPI = {
  // Patient appointments
  getPatientAppointments: async (token: string) => {
    const response = await api.get('/appointments/patient', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  create: async (data: AppointmentData, token: string) => {
    const response = await api.post('/appointments', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  cancel: async (id: string, token: string) => {
    const response = await api.put(`/appointments/${id}/cancel`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Admin appointments
  getAllAppointments: async (token: string) => {
    const response = await api.get('/appointments/admin/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  update: async (id: string, data: Partial<AppointmentData>, token: string) => {
    const response = await api.put(`/appointments/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

// Patients API
export const patientsAPI = {
  getProfile: async (token: string) => {
    const response = await api.get('/patients/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateProfile: async (data: Partial<RegisterData>, token: string) => {
    const response = await api.put('/patients/profile', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Admin patient management
  getAllPatients: async (token: string) => {
    const response = await api.get('/patients/admin/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updatePatient: async (id: string, data: Partial<RegisterData>, token: string) => {
    const response = await api.put(`/patients/admin/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

// Time Slots API (Recurring schedules)
export const timeSlotsAPI = {
  getPractitionerTimeSlots: async (practitionerId: string, token: string) => {
    const response = await api.get(`/timeslots/practitioner/${practitionerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  create: async (data: TimeSlotData, token: string) => {
    const response = await api.post('/timeslots', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  update: async (id: string, data: Partial<TimeSlotData>, token: string) => {
    const response = await api.put(`/timeslots/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  delete: async (id: string, token: string) => {
    const response = await api.delete(`/timeslots/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

// Availability Slots API (Specific date/time slots)
export const availabilityAPI = {
  getAvailableSlots: async (practitionerId: string, date: string) => {
    const response = await api.get(`/availability/slots/${practitionerId}`, {
      params: { date }
    });
    return response.data;
  },
  
  getPractitionerAvailability: async (practitionerId: string, date: string, token: string) => {
    const response = await api.get(`/availability/practitioner/${practitionerId}`, {
      params: { date },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  create: async (data: AvailabilitySlotData, token: string) => {
    const response = await api.post('/availability', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  update: async (id: string, data: Partial<AvailabilitySlotData>, token: string) => {
    const response = await api.put(`/availability/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  delete: async (id: string, token: string) => {
    const response = await api.delete(`/availability/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getAdminStats: async (token: string) => {
    const response = await api.get('/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getPatientStats: async (token: string) => {
    const response = await api.get('/patient/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

// Main API object with all endpoints
export const apiClient = {
  // Legacy compatibility methods
  loginPatient: authAPI.loginPatient,
  registerPatient: authAPI.registerPatient,
  loginAdmin: authAPI.loginAdmin,
  registerAdmin: authAPI.registerAdmin,
  verifyToken: authAPI.verifyToken,
  
  getPractitioners: practitionersAPI.getAll,
  getPractitioner: practitionersAPI.getById,
  createPractitioner: practitionersAPI.create,
  updatePractitioner: practitionersAPI.update,
  deletePractitioner: practitionersAPI.delete,
  
  getPatientAppointments: appointmentsAPI.getPatientAppointments,
  createAppointment: appointmentsAPI.create,
  cancelAppointment: appointmentsAPI.cancel,
  getAllAppointments: appointmentsAPI.getAllAppointments,
  updateAppointment: appointmentsAPI.update,
  
  getPatientProfile: patientsAPI.getProfile,
  updatePatientProfile: patientsAPI.updateProfile,
  getAllPatients: patientsAPI.getAllPatients,
  updatePatient: patientsAPI.updatePatient,
  
  getPractitionerTimeSlots: timeSlotsAPI.getPractitionerTimeSlots,
  createTimeSlot: timeSlotsAPI.create,
  updateTimeSlot: timeSlotsAPI.update,
  deleteTimeSlot: timeSlotsAPI.delete,
  
  getAvailableSlots: availabilityAPI.getAvailableSlots,
  getPractitionerAvailability: availabilityAPI.getPractitionerAvailability,
  createAvailabilitySlot: availabilityAPI.create,
  updateAvailabilitySlot: availabilityAPI.update,
  deleteAvailabilitySlot: availabilityAPI.delete,
  
  getAdminStats: dashboardAPI.getAdminStats,
  getPatientStats: dashboardAPI.getPatientStats,
};

export { apiClient as api };
export default apiClient;