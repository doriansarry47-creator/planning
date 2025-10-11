export interface IcsEvent {
  uid: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  description?: string;
  location?: string;
}

function formatDateToICS(dt: string): string {
  const date = new Date(dt);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mi = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
}

export function generateICS(events: IcsEvent[], calendarName = 'Agenda Dorian Sarry'): string {
  const lines: string[] = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Dorian Sarry//Therapie Sensorimotrice//FR');
  lines.push(`X-WR-CALNAME:${calendarName}`);
  lines.push('CALSCALE:GREGORIAN');

  for (const e of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e.uid}`);
    lines.push(`DTSTAMP:${formatDateToICS(new Date().toISOString())}`);
    lines.push(`DTSTART:${formatDateToICS(e.start)}`);
    lines.push(`DTEND:${formatDateToICS(e.end)}`);
    lines.push(`SUMMARY:${escapeText(e.title)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
    if (e.location) lines.push(`LOCATION:${escapeText(e.location)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function downloadICS(content: string, filename = 'planning.ics') {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
