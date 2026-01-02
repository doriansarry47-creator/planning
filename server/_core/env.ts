export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  appUrl: process.env.APP_URL ?? "http://localhost:5173",
  
  // Google Calendar Configuration (Service Account JWT)
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID ?? "doriansarry47@gmail.com",
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
  googleServiceAccountPrivateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? process.env.GOOGLE_CALENDAR_PRIVATE_KEY ?? "",
  googleCalendarIcalUrl: process.env.GOOGLE_CALENDAR_ICAL_URL ?? "",
  googleServiceAccountJsonPath: process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH ?? "./server/google-service-account.json",
};
