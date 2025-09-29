const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

class ApiService {
  private getHeaders(token?: string) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(token),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Une erreur s'est produite");
    }

    return data;
  }

  // Méthodes d'authentification
  async loginAdmin(email: string, password: string) {
    return this.request("/auth/login/admin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async loginPatient(email: string, password: string) {
    return this.request("/auth/login/patient", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async registerAdmin(userData: any) {
    return this.request("/auth/register/admin", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async registerPatient(userData: any) {
    return this.request("/auth/register/patient", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // Méthodes pour les praticiens
  async getPractitioners() {
    return this.request("/practitioners");
  }

  async getPractitioner(id: string) {
    return this.request(`/practitioners/${id}`);
  }

  async createPractitioner(data: any, token: string) {
    return this.request("/practitioners", {
      method: "POST",
      body: JSON.stringify(data),
    }, token);
  }

  async updatePractitioner(id: string, data: any, token: string) {
    return this.request(`/practitioners/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token);
  }

  async deletePractitioner(id: string, token: string) {
    return this.request(`/practitioners/${id}`, {
      method: "DELETE",
    }, token);
  }

  async getAllPractitionersAdmin(token: string) {
    return this.request("/practitioners/admin/all", {}, token);
  }

  // Méthodes pour les créneaux horaires
  async getPractitionerTimeSlots(practitionerId: string) {
    return this.request(`/timeslots/practitioner/${practitionerId}`);
  }

  async createTimeSlot(data: any, token: string) {
    return this.request("/timeslots", {
      method: "POST",
      body: JSON.stringify(data),
    }, token);
  }

  async createBulkTimeSlots(data: any, token: string) {
    return this.request("/timeslots/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    }, token);
  }

  async updateTimeSlot(id: string, data: any, token: string) {
    return this.request(`/timeslots/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token);
  }

  async deleteTimeSlot(id: string, token: string) {
    return this.request(`/timeslots/${id}`, {
      method: "DELETE",
    }, token);
  }

  async getAllTimeSlotsAdmin(token: string) {
    return this.request("/timeslots/admin/all", {}, token);
  }

  // Méthodes pour les rendez-vous
  async getPatientAppointments(token: string) {
    return this.request("/appointments/patient", {}, token);
  }

  async createAppointment(data: any, token: string) {
    return this.request("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }, token);
  }

  async cancelAppointment(id: string, token: string) {
    return this.request(`/appointments/${id}/cancel`, {
      method: "PUT",
    }, token);
  }

  async getAllAppointmentsAdmin(params: any = {}, token: string) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/appointments/admin/all?${queryParams}` : "/appointments/admin/all";
    return this.request(endpoint, {}, token);
  }

  async updateAppointment(id: string, data: any, token: string) {
    return this.request(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token);
  }

  async getAvailableSlots(practitionerId: string, date: string) {
    return this.request(`/appointments/available-slots/${practitionerId}/${date}`);
  }

  async getAppointmentStats(token: string) {
    return this.request("/appointments/admin/stats", {}, token);
  }

  // Méthodes pour les patients
  async getPatientProfile(token: string) {
    return this.request("/patients/profile", {}, token);
  }

  async updatePatientProfile(data: any, token: string) {
    return this.request("/patients/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }, token);
  }

  async getAllPatientsAdmin(params: any = {}, token: string) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/patients/admin/all?${queryParams}` : "/patients/admin/all";
    return this.request(endpoint, {}, token);
  }

  async getPatientAdmin(id: string, token: string) {
    return this.request(`/patients/admin/${id}`, {}, token);
  }

  async updatePatientAdmin(id: string, data: any, token: string) {
    return this.request(`/patients/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token);
  }

  async deactivatePatient(id: string, token: string) {
    return this.request(`/patients/admin/${id}/deactivate`, {
      method: "PUT",
    }, token);
  }

  async activatePatient(id: string, token: string) {
    return this.request(`/patients/admin/${id}/activate`, {
      method: "PUT",
    }, token);
  }
}

export const api = new ApiService();