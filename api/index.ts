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

      serviceAccountPrivateKey = serviceAccountPrivateKey
        .trim()
        .replace(/^"|"$/g, '')
        .replace(/\\n/g, '\n')
        .replace(/\\\\n/g, '\n');

      this.auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: serviceAccountPrivateKey,
        scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events'],
      });

      await this.auth.authorize();
      this.isInitialized = true;
      console.log("[Vercel API] Google Calendar initialise");
    } catch (error) {
      console.error("[Vercel API] Erreur Google Calendar:", error);
      this.isInitialized = false;
    }
  }

  getDefaultSlots(): string[] {
    return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
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
      const { date, time, patientInfo } = req.body;

      if (!date || !time || !patientInfo) {
        return res.status(400).json({ error: "Donnees manquantes" });
      }

      const appointmentDate = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

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
        } catch (emailError) {
          console.error("[Vercel API] Erreur envoi email:", emailError);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Rendez-vous confirme",
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
