import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";
import { Resend } from "resend";
import { getAvailabilitySyncService } from "../server/services/availabilitySync";

const resend = new Resend(process.env.RESEND_API_KEY);
const availabilitySyncService = getAvailabilitySyncService();

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
        googleCalendar: availabilitySyncService ? "initialized" : "not initialized",
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
      if (!availabilitySyncService) {
        return res.status(503).json({ error: "Google Calendar service not available" });
      }
      const { date } = req.query;
      const targetDate = date ? new Date(date as string) : new Date();
      const startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
      
      const availableSlots = await availabilitySyncService.getAvailableSlots(startDate, endDate);
      const slots = availableSlots.map(slot => slot.startTime);
      
      return res.status(200).json({
        success: true,
        date: targetDate.toISOString().split('T')[0],
        slots,
        totalSlots: slots.length
      });
    }

    if (path === '/api/book' && req.method === 'POST') {
      if (!availabilitySyncService) {
        return res.status(503).json({ error: "Google Calendar service not available" });
      }
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

      const googleEventId = await availabilitySyncService.bookSlot(
        appointmentDate,
        time,
        endTime,
        {
          name: `${patientInfo.firstName} ${patientInfo.lastName}`,
          email: patientInfo.email,
          phone: patientInfo.phone,
          reason: patientInfo.reason,
        }
      );

      if (!googleEventId) {
        return res.status(500).json({ error: "Failed to book appointment" });
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
