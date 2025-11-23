# Planning & Scheduling App - Replit Setup

## 🚀 Project Overview

This is a full-stack appointment booking system built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + tRPC (TypeScript RPC framework)
- **Database**: PostgreSQL (Neon-backed on Replit)
- **Calendar Integration**: Google Calendar (iCal + Service Account)
- **Email**: Resend API

## ✅ Current Setup Status

### Infrastructure
- ✅ **Frontend Server**: Running on port 5000 with Vite HMR
- ✅ **Backend Server**: Express.js running on port 5000 (serving both API and frontend)
- ✅ **Database**: PostgreSQL with Drizzle ORM migrations applied
- ✅ **Proxy Configuration**: Vite configured for Replit proxy compatibility with `allowedHosts: true`

### Database
- ✅ **Schema**: 15 tables with full relationships
- ✅ **Admin User**: Created (email: doriansarry47@gmail.com, password: admin123)
- ✅ **Practitioner**: Dorian Sarry (Thérapie Sensori-Motrice specialist)
- ✅ **Services**: 3 services configured (60-minute duration for all)
  - Séance de Thérapie Sensori-Motrice
  - Consultation Initiale  
  - Séance de Suivi

### Google Calendar Integration
- ✅ **Service Account**: Connected with private key
- ✅ **iCal Feed**: Configured to read availability from personal calendar
- ✅ **OAuth2 Ready**: Can be enabled with GOOGLE_CLIENT_ID + GOOGLE_REFRESH_TOKEN
- ✅ **Appointment Creation**: System creates 60-minute appointments in Google Calendar

### Environment Variables Configured
```
NODE_ENV=development
PORT=5000
DATABASE_URL=<PostgreSQL connection string>
GOOGLE_CALENDAR_ICAL_URL=<public calendar feed>
GOOGLE_SERVICE_ACCOUNT_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com
GOOGLE_CALENDAR_PRIVATE_KEY=<service account private key>
GOOGLE_CALENDAR_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com
GOOGLE_CALENDAR_ID=doriansarry47@gmail.com
RESEND_API_KEY=<email service key>
```

## 📋 Key Features Implemented

### Patient-Facing Booking Page (`/book-appointment`)
- **Date Selection**: Calendar picker showing available dates
- **Time Slots**: Display 60-minute appointment slots
- **Patient Information**: Name, email, phone, reason for appointment
- **Google Calendar Sync**: Appointments automatically added to personal Google Calendar
- **Confirmation**: Email confirmation sent via Resend API

### Appointment Duration
- **Fixed at 60 minutes**: All appointments are 1 hour long
- **Automatic scheduling**: End time calculated from start time + 60 minutes
- **Google Calendar**: Properly blocked for 60-minute duration

### Availability Management
- **Source**: Personal Google Calendar via iCal feed
- **Reading**: Events marked as "DISPONIBLE" / "AVAILABLE" are treated as availability slots
- **Conflict Detection**: System prevents double-booking
- **Dynamic Updates**: Calendar automatically reflects Google Calendar changes

## 🔧 File Structure

```
.
├── client/                    # React frontend
│   └── src/
│       ├── pages/
│       │   ├── BookAppointment.tsx      # Main booking page
│       │   ├── Home.tsx                 # Landing page
│       │   └── MyAppointments.tsx       # User appointments view
│       ├── components/
│       │   └── ui/                      # Radix UI components
│       ├── hooks/
│       ├── lib/                         # Utilities
│       └── App.tsx
├── server/                    # Express + tRPC backend
│   ├── _core/
│   │   ├── index.ts           # Server entry point
│   │   ├── env.ts             # Environment configuration
│   │   ├── trpc.ts            # tRPC router setup
│   │   └── vite.ts            # Vite middleware for dev
│   ├── services/
│   │   ├── googleCalendarIcal.ts        # iCal calendar reader
│   │   ├── googleCalendarOAuth.ts       # OAuth2 service (optional)
│   │   └── emailService.ts              # Resend email integration
│   ├── bookingRouter.ts        # Main booking API endpoints
│   ├── routers.ts              # tRPC router aggregation
│   ├── db.ts                   # Database connection (Neon + Drizzle)
│   └── routers/                # Other API routes
├── drizzle/                    # Database migrations
│   ├── schema.postgres.ts      # PostgreSQL schema definition
│   └── migrations/             # Migration files
├── shared/                     # Type definitions
│   └── zodSchemas.ts           # Zod validation schemas
├── vite.config.ts              # Vite configuration (port 5000, HMR)
└── package.json
```

## 🚀 Running the Application

### Start Development Server
```bash
npm run dev
```
This starts the Express server with tRPC API and Vite frontend on port 5000.

### Database Operations
```bash
# Push schema to database
npm run db:push:postgres

# Generate migrations
npm run db:generate:postgres

# Seed database with admin/specialties
npm run db:seed
```

## 🔐 Authentication

Currently: **Mock authentication** (for development)
- Patient booking is public (no auth required)
- Admin panel requires user role with admin privileges

To implement real auth:
1. Configure Google OAuth2 (GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET)
2. Use JWT tokens stored in httpOnly cookies
3. Implement protected routes with middleware

## 📧 Email Configuration

Emails are sent via **Resend API**:
- Appointment confirmation (to patient)
- Appointment reminder (24 hours before)
- Cancellation notification

Configure in `RESEND_API_KEY` environment variable.

## 🎨 UI/UX Notes

- **Language**: French (French locale throughout)
- **Components**: Radix UI for accessibility
- **Styling**: Tailwind CSS with custom theme
- **Icons**: Lucide React
- **Responsive**: Mobile-first design

## 🐛 Known Issues & Limitations

1. **Availability Display**: Currently shows "No availabilities" if no events in Google Calendar
   - **Fix**: Add availability markers in personal Google Calendar
   - **Format**: Events with "DISPONIBLE" or "AVAILABLE" in title

2. **OAuth2 Configuration**: Refresh token not yet configured
   - **Current Fallback**: Using Service Account + iCal (works well)
   - **Alternative**: Can enable OAuth2 with refresh token for automatic sync

3. **React Hook Warnings**: Some warnings about Radix UI components with refs
   - **Impact**: None - application works fine
   - **Fix**: Upgrade Radix UI libraries

## 🔗 Live URL

Once deployed on Replit:
- **Development**: http://localhost:5000
- **Production**: Will be automatically assigned by Replit

## 📝 Next Steps for User

1. **Add Availability**: Create events in personal Google Calendar with "DISPONIBLE" in the title
2. **Test Booking**: Book an appointment from `/book-appointment` page
3. **Verify Email**: Check that confirmation emails are sent
4. **Customize**: Modify UI colors, text, and services as needed
5. **Deploy**: Use Replit's publish feature when ready

## 🛠️ Tech Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | React | 18.3.1 |
| Backend | Express.js | 4.21.2 |
| API | tRPC | 11.0.0 |
| Database | PostgreSQL (Neon) | 16 |
| ORM | Drizzle ORM | 0.38.3 |
| Build Tool | Vite | 4.5.3 |
| Language | TypeScript | 5.7.2 |
| UI Components | Radix UI | Latest |
| Styling | Tailwind CSS | 3.4.17 |
| Calendar | Google Calendar API | v3 |
| Email | Resend | 6.4.2 |

## 📞 Support

For issues:
1. Check logs in terminal output
2. Verify environment variables are set
3. Confirm Google Calendar is properly configured
4. Check database connection with `npm run db:push --force`
