import "dotenv/config";
import express, { Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import superjson from "superjson";
import { TRPCError, initTRPC } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

// Simple OAuth routes without complex imports
import { OAuthService } from "./oauth-simple";
import { TRPCRouter } from "./router-simple";

// Basic TRPC setup for serverless
const t = initTRPC.context<any>().create({
  transformer: superjson,
});

const app = express();

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// OAuth callback under /api/oauth/callback
OAuthService.registerRoutes(app);

// tRPC API with simplified router
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: TRPCRouter,
    createContext: ({ req, res }) => ({
      req,
      res,
      user: null, // Simplified context
    }),
  })
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Export as serverless function handler for Vercel
export default (req: Request, res: Response) => {
  app(req, res);
};