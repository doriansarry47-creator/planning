import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

class GoogleCalendarService {
  private auth: any;
  public isInitialized = false;

  constructor() {
    this.initializeCalendar();
  }

  private async initializeCalendar() {
    try {
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
      let serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "";

      if (!serviceAccountEmail || !serviceAccountPrivateKey) {
        console.warn("[Vercel API] Google Calendar credentials manquants");
        this.isInitialized = false;
        return;
      }

      // Nettoyer la clé privée : enlever les guillemets et convertir les \n en sauts de ligne réels
      serviceAccountPrivateKey = serviceAccountPrivateKey
        .replace(/^["']|["']$/g, '') // Enlever les guillemets au début et à la fin
        .replace(/\\n/g, '\n');       // Convertir les \n littéraux en sauts de ligne

      // Vérifier que la clé est au bon format
      if (!serviceAccountPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.error("[Vercel API] Format de clé privée invalide");
        this.isInitialized = false;
        return;
      }

      this.auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: serviceAccountPrivateKey,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ],
      });

      await this.auth.authorize();
      this.isInitialized = true;
      console.log("[Vercel API] ✅ Google Calendar initialisé avec succès");
    } catch (error: any) {
      console.error("[Vercel API] ❌ Erreur initialisation Google Calendar:", error.message);
      if (error.stack) {
        console.error("[Vercel API] Stack trace:", error.stack);
      }
      this.isInitialized = false;
    }
  }

  getDefaultSlots(): string[] {
    return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  }

  /**
   * Créer un événement dans Google Calendar
   */
  async createEvent(eventData: {
    patientName: string;
    patientEmail: string;
    patientPhone?: string;
    date: Date;
    startTime: string;
    endTime: string;
    reason?: string;
  }): Promise<string | null> {
    if (!this.isInitialized) {
      console.warn("[Vercel API] Google Calendar non initialisé, impossible de créer l'événement");
      return null;
    }

    try {
      const calendar = google.calendar({ version: 'v3', auth: this.auth });
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      // Construire les dates avec timezone
      const startDateTime = new Date(eventData.date);
      const [startHours, startMinutes] = eventData.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(eventData.date);
      const [endHours, endMinutes] = eventData.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Construire la description
      let description = `Rendez-vous avec ${eventData.patientName}`;
      if (eventData.reason) {
        description += `\n\nMotif: ${eventData.reason}`;
      }
      if (eventData.patientPhone) {
        description += `\nTéléphone: ${eventData.patientPhone}`;
      }
      description += `\nEmail: ${eventData.patientEmail}`;

      // Créer l'événement (sans attendees car les comptes de service ne peuvent pas les gérer sans Domain-Wide Delegation)
      const event = {
        summary: `RDV - ${eventData.patientName}`,
        description: description,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 }, // 24h avant
            { method: 'popup', minutes: 60 },   // 1h avant
          ],
        },
        colorId: '11', // Rouge pour les rendez-vous réservés
        transparency: 'opaque',
        extendedProperties: {
          private: {
            isAppointment: 'true',
            patientName: eventData.patientName,
            patientEmail: eventData.patientEmail,
            source: 'webapp',
          },
        },
      };

      const response = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
        sendUpdates: 'none', // Ne pas envoyer de notifications Google Calendar
      });

      console.log(`[Vercel API] ✅ Événement Google Calendar créé: ${response.data.id}`);
      return response.data.id || null;
    } catch (error: any) {
      console.error("[Vercel API] ❌ Erreur création événement Google Calendar:", error.message);
      if (error.response?.data) {
        console.error("[Vercel API] Détails:", JSON.stringify(error.response.data));
      }
      return null;
    }
  }
}

const googleCalendarService = new GoogleCalendarService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;
  const path = url?.split('?')[0] || '';

  try {
    if (path === '/api/health' || path === '/api') {
      return res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        platform: "vercel",
        googleCalendar: googleCalendarService.isInitialized ? "initialized" : "not initialized",
        service: "Planning App - Vercel Serverless",
        version: "2.0"
      });
    }

    if (path === '/api/oauth/init') {
      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL}/api/oauth/callback`;

      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: "OAuth credentials not configured" });
      }

      const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      const scopes = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];

      const authUrl = auth.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state: 'calendar_auth'
      });

      return res.status(200).json({
        success: true,
        authUrl,
        message: "Visitez cette URL pour autoriser l'acces a votre Google Calendar"
      });
    }

    if (path === '/api/oauth/callback') {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({ error: "Code d'autorisation manquant" });
      }

      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL}/api/oauth/callback`;

      const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

      try {
        const { tokens } = await auth.getToken(code as string);
        
        if (tokens.refresh_token) {
          return res.redirect(`/success?refresh_token=${tokens.refresh_token}`);
        } else {
          return res.status(500).json({ error: "Refresh token non recu" });
        }
      } catch (error: any) {
        return res.status(500).json({ error: "Erreur OAuth2", details: error.message });
      }
    }

    if (path === '/api/slots' && req.method === 'GET') {
      const { date } = req.query;
      const targetDate = date ? new Date(date as string) : new Date();
      
      const slots = googleCalendarService.getDefaultSlots();
      
      return res.status(200).json({
        success: true,
        date: targetDate.toISOString().split('T')[0],
        slots,
        totalSlots: slots.length
      });
    }

    if (path === '/api/book' && req.method === 'POST') {
      console.log('[Vercel TRPC] bookAppointment:', JSON.stringify(req.body, null, 2));
      
      const { date, time, patientInfo } = req.body;

      if (!date || !time || !patientInfo) {
        return res.status(400).json({ error: "Donnees manquantes" });
      }

      const appointmentDate = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      // Créer l'événement dans Google Calendar
      let googleEventId: string | null = null;
      try {
        googleEventId = await googleCalendarService.createEvent({
          patientName: `${patientInfo.firstName} ${patientInfo.lastName}`,
          patientEmail: patientInfo.email,
          patientPhone: patientInfo.phone,
          date: appointmentDate,
          startTime: time,
          endTime: endTime,
          reason: patientInfo.reason || '',
        });

        if (googleEventId) {
          console.log('[Vercel TRPC] ✅ Événement créé dans Google Calendar:', googleEventId);
        } else {
          console.warn('[Vercel TRPC] ⚠️ Événement non créé dans Google Calendar (service non disponible)');
        }
      } catch (calendarError: any) {
        console.error('[Vercel TRPC] ❌ Erreur creation evenement Google Calendar:', calendarError.message);
        // Continuer même si la création dans Calendar échoue
      }

      // Envoyer l'email de confirmation
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'Dorian Sarry <noreply@dorian-sarry.com>',
            to: patientInfo.email,
            subject: 'Confirmation de votre rendez-vous',
            html: `
              <h2>Confirmation de rendez-vous</h2>
              <p>Bonjour ${patientInfo.firstName},</p>
              <p>Votre rendez-vous a bien ete confirme.</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Date:</strong> ${appointmentDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Heure:</strong> ${time} - ${endTime}</p>
                <p><strong>Praticien:</strong> Dorian Sarry</p>
              </div>
              <p>Cordialement,<br>Dorian Sarry</p>
            `
          });
          console.log('[Vercel TRPC] ✅ Email de confirmation envoyé');
        } catch (emailError) {
          console.error("[Vercel TRPC] ❌ Erreur envoi email:", emailError);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Rendez-vous confirme et ajoute a votre Google Calendar",
        googleEventId: googleEventId,
        confirmation: {
          date,
          time,
          endTime,
          practitioner: "Dorian Sarry",
          patient: `${patientInfo.firstName} ${patientInfo.lastName}`
        }
      });
    }

    return res.status(404).json({
      error: "Route not found",
      path,
      availableRoutes: ["/api/health", "/api/slots", "/api/book", "/api/oauth/init", "/api/oauth/callback"]
    });

  } catch (error: any) {
    console.error("[Vercel API] Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
}
