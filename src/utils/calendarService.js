/**
 * Formats a JavaScript Date to the iCalendar specification (YYYYMMDDTHHMMSS)
 * We use "floating" time (no 'Z' at the end) so it always triggers at the user's local time.
 */
function formatICSDate(date) {
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/**
 * Folds a line ensuring it does not exceed 75 characters as per RFC 5545
 * Lines longer than 75 chars are broken and continued on the next line starting with a space
 */
function foldLine(line) {
  if (line.length <= 75) return line;
  let result = line.substring(0, 75);
  let remaining = line.substring(75);
  while (remaining.length > 0) {
    result += '\r\n ' + remaining.substring(0, 74);
    remaining = remaining.substring(74);
  }
  return result;
}

/**
 * Creates an iCalendar format string containing VEVENTs for upcoming spaced repetition reviews
 * @param {Array} topics - Array of topic objects
 * @returns {String} - iCalendar formatted string
 */
export function generateICalendar(topics) {
  const intervals = [1, 2, 5, 10, 20, 30]; // Matches spacedRepetition.js
  
  const now = new Date();
  const nowStr = formatICSDate(now) + 'Z'; 

  let lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RecallX//Spaced Repetition Calendar//EN',
    'CALSCALE:GREGORIAN'
  ];

  topics.forEach(topic => {
    const createdDate = new Date(topic.createdDate || now);

    intervals.forEach((daysToAdd, index) => {
      const revisionDate = new Date(createdDate);
      revisionDate.setDate(revisionDate.getDate() + daysToAdd);
      
      // Skip past revisions
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      if (revisionDate < startOfDay) {
          return;
      }

      // Schedule exactly for 9:00 AM local time
      revisionDate.setHours(9, 0, 0, 0);
      const startStr = formatICSDate(revisionDate);
      
      const endDate = new Date(revisionDate);
      endDate.setMinutes(30);
      const endStr = formatICSDate(endDate);

      const title = `📚 RecallX: Revise "${topic.title}"`;
      
      // ICS inline newlines correctly escaped.
      // Remove any physical newlines from description logic to prevent syntax breaking
      const cleanDesc = (topic.description || 'No description provided.').replace(/\n/g, ' ');
      const description = `This is your scheduled revision reminder.\\n\\nTopic: ${topic.title}\\nRevision Session: #${index + 1}\\nDescription: ${cleanDesc}\\n\\nLog into RecallX to finish your review today!`;

      const uid = `${topic.id}-rev${index + 1}@recallx.local`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${nowStr}`);
      lines.push(`DTSTART:${startStr}`);
      lines.push(`DTEND:${endStr}`);
      lines.push(`SUMMARY:${title}`);
      lines.push(`DESCRIPTION:${description}`);
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-PT30M');
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:RecallX Revision Reminder');
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    });
  });

  lines.push('END:VCALENDAR');

  // RFC 5545 strictly mandates folding and CRLF line endings
  return lines.map(foldLine).join('\r\n');
}

/**
 * Triggers a browser download of the ICS string for a single topic
 */
export function downloadICS(topic) {
  const icsString = generateICalendar([topic]);
  downloadBlob(icsString, `${topic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_due_revisions.ics`);
}

/**
 * Triggers an ICS download for all topics (bulk due revisions export)
 */
export function downloadAllICS(topics) {
  const icsString = generateICalendar(topics);
  downloadBlob(icsString, `RecallX_all_due_revisions.ics`);
}

function downloadBlob(content, filename) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
