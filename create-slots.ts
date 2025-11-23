import 'dotenv/config';
import { google } from 'googleapis';

async function createAvailabilities() {
  const privateKey = (process.env.GOOGLE_CALENDAR_PRIVATE_KEY || '')
    .replace(/\\n/g, '\n')
    .replace(/^["']|["']$/g, '');
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'doriansarry47@gmail.com';

  console.log('🔍 Config:', { serviceAccountEmail, calendarId, keyLength: privateKey.length });

  if (!privateKey || !serviceAccountEmail) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  const calendar = google.calendar({ version: 'v3', auth });

  // Days: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  const targetDays = [1, 2, 4, 5]; // Monday, Tuesday, Thursday, Friday
  const startHour = 17;
  const startMinute = 30;
  const endHour = 20;

  const today = new Date();
  const endDate = new Date(today.getTime() + 8 * 7 * 24 * 60 * 60 * 1000);

  let created = 0;
  
  for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (targetDays.includes(d.getDay())) {
      const dateStr = d.toISOString().split('T')[0];
      
      const startDateTime = new Date(d);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      const endDateTime = new Date(d);
      endDateTime.setHours(endHour, 0, 0, 0);

      const event = {
        summary: '🟢 DISPONIBLE',
        description: 'Créneau disponible pour réservation (Thérapie Sensori-Motrice)',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        colorId: '2',
        transparency: 'transparent',
      };

      try {
        const res = await calendar.events.insert({
          calendarId: calendarId,
          resource: event,
        });
        console.log(`✅ ${dateStr} 17h30-20h créé (${res.data.id})`);
        created++;
      } catch (error: any) {
        console.error(`❌ ${dateStr}:`, error.message);
      }
    }
  }

  console.log(`\n✅ ${created} créneaux créés avec succès!`);
}

createAvailabilities().catch(console.error);
