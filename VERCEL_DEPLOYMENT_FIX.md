# 🚀 Vercel Deployment Fix Guide

## Problem Identified
Appointments slots are not visible on Vercel deployment because:
1. ❌ Google Calendar Service Account credentials not configured on Vercel
2. ❌ iCal URL fallback not configured on Vercel  
3. ❌ Environment variables not synchronized from Replit to Vercel

## ✅ Solutions

### Step 1: Configure Environment Variables on Vercel

Go to **Vercel Dashboard → Settings → Environment Variables** and add:

```
GOOGLE_CALENDAR_ID=doriansarry47@gmail.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GOOGLE_CALENDAR_ICAL_URL=https://calendar.google.com/calendar/ical/.../basic.ics
DATABASE_URL=postgresql://...
RESEND_API_KEY=...
```

**Critical Notes:**
- Replace newlines in private key with `\n` (literal backslash-n, not actual newlines)
- Example: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...==\n-----END PRIVATE KEY-----`
- Get the iCal URL from Google Calendar settings → Calendar → "Secret address in iCal format"

### Step 2: Verify Google Calendar Sync (For Deleted Slots)

The app now automatically syncs deleted appointments from Google Calendar before showing available slots.

If deleted slots still don't reappear:
1. Make sure `GOOGLE_CALENDAR_ICAL_URL` is set
2. Wait 30+ seconds (sync cache expires after 30 minutes)
3. Check Vercel logs: `vercel logs --follow`

### Step 3: Test the Fix

1. **Deploy to Vercel**: `git push` (or manual redeploy)
2. **Check the booking page**: Should show multiple date slots
3. **Verify auto-sync**: Delete an appointment from Google Calendar, wait 30s, refresh the page
4. **Check console logs** on Vercel:
   ```bash
   vercel logs --follow
   # Look for: "[BookingRouter] ✅ X dates disponibles"
   ```

## 🔍 Debugging Steps

### If slots still don't show:

1. **Check environment variables are set:**
   ```bash
   vercel env list
   ```

2. **View actual logs:**
   ```bash
   vercel logs --follow
   ```

3. **Look for these log patterns:**
   - ✅ Good: `[GoogleCalendar] ✅ Service Google Calendar initialisé avec succès`
   - ❌ Bad: `[GoogleCalendar] ⚠️ Configuration incomplete`
   - ✅ Good: `[BookingRouter] Google Calendar configured: true`
   - ❌ Bad: `[BookingRouter] Google Calendar configured: false`

### If only one slot shows:

This means the app is using default fallback slots. Fix by:
1. Set `GOOGLE_CALENDAR_ICAL_URL` environment variable
2. Redeploy: `vercel deploy --prod`

### If deleted slots don't reappear:

1. Make sure Google event is truly deleted from calendar (check directly)
2. Wait 30+ seconds after deletion
3. Clear browser cache: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
4. Refresh the page
5. If still not working: check Vercel logs for sync errors

## 📋 Quick Verification Checklist

- [ ] `GOOGLE_CALENDAR_ID` set on Vercel
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL` set on Vercel
- [ ] `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` set on Vercel (with `\n` for newlines)
- [ ] `GOOGLE_CALENDAR_ICAL_URL` set on Vercel
- [ ] `DATABASE_URL` set on Vercel (pointing to production database)
- [ ] Redeploy after changing env vars
- [ ] Check logs show Google Calendar initialized successfully
- [ ] Multiple dates appear on booking page
- [ ] Deleted appointments sync within 30 seconds

## 🎯 Expected Behavior After Fix

✅ **Booking Page**: Shows 20+ available appointment dates
✅ **Time Slots**: Multiple time slots per date (9:00, 10:00, 11:00, 14:00, 15:00, 16:00, 17:00)
✅ **Deleted Sync**: When you delete an appointment from Google Calendar, the slot reappears within 30 seconds
✅ **Confirmation**: Booking a new appointment creates an event in Google Calendar + sends email

## 📞 Still Having Issues?

1. Check that credentials are actually being used:
   - View Vercel logs in real-time
   - Look for: `[GoogleCalendar] Utilisation des variables d'environnement pour la configuration`

2. Verify iCal URL works:
   - Copy the URL from `GOOGLE_CALENDAR_ICAL_URL`
   - Paste in browser - should download an `.ics` file

3. Double-check environment variable format:
   - Private key should have literal `\n` characters, not actual newlines
   - Should start with `-----BEGIN PRIVATE KEY-----`
   - Should end with `-----END PRIVATE KEY-----`

---

**Last Updated:** December 19, 2025
