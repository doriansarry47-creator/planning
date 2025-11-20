import type { Express, Request, Response } from "express";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export class OAuthService {
  static registerRoutes(app: Express) {
    app.get("/api/oauth/callback", async (req: Request, res: Response) => {
      const code = getQueryParam(req, "code");
      const state = getQueryParam(req, "state");

      if (!code || !state) {
        res.status(400).json({ error: "code and state are required" });
        return;
      }

      try {
        // Simple OAuth response - in a real app, this would integrate with your OAuth provider
        console.log("[OAuth] Callback received:", { code, state });
        
        // For now, just redirect to home
        res.redirect(302, "/");
      } catch (error) {
        console.error("[OAuth] Callback failed", error);
        res.status(500).json({ error: "OAuth callback failed" });
      }
    });
  }
}