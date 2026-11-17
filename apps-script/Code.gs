/* =====================================================================
   BearingMind Health Services: booking system (Google Apps Script)
   ---------------------------------------------------------------------
   The Google Sheet is the booking record. The website's server talks to
   this script with a secret key; visitors never reach the sheet.

   What it does
   - Holds a time slot for a few minutes while the patient pays.
   - Confirms the booking once payment is verified (Razorpay), or records
     the UTR for you to check (manual UPI, until Razorpay is switched on).
   - Sends branded emails to the patient and to you.
   - Adds every confirmed session to your Google Calendar and invites the
     patient. Online sessions get their own Google Meet link.
   - Stops double bookings, and frees unpaid holds automatically.
   - Records organisation enquiries.

   ONE-TIME SETUP: see SETUP.md in this folder (about 15 minutes).

   YOUR DAILY ROUTINE
   - Online payments: nothing to check. "Confirmed" means paid.
   - Manual UPI: when a row says "Payment to verify", check the UTR in your
     bank app, then change Status to "Confirmed". The patient is emailed and
     the calendar invite is sent automatically.
   - Cancelled or rescheduled: change Status. The slot opens again and the
     calendar event is removed.
   - "Paid – needs attention": the patient paid but something needs you
     (for example, the time was taken while they paid). Call them.
   ===================================================================== */

const CONFIG = {
  NOTIFY_EMAIL: 'contact@bearingmind.com',     // where your booking alerts go
  ASSOCIATE_EMAIL: '',                          // optional: associate consultant, copied on Children and family bookings
  PRACTICE: 'BearingMind Health Services',
  ADDRESS: '2 Rose Lane, Richmond Town, Bengaluru 560025',
  PHONE: '+91 94822 23786',
  WHATSAPP: 'https://wa.me/919482223786',
  SITE: 'https://www.bearingmind.com',
  CALENDAR_ID: 'primary',
  TZ: 'Asia/Kolkata',
  CRISIS: 'This service is not for emergencies. If you or someone you know is in crisis, call Tele-MANAS on 14416 or go to the nearest hospital.',
};

const BOOKINGS = 'Bookings';
const ORGS = 'Organisation enquiries';
const HEADERS = ['Received', 'Reference', 'Status', 'Hold until', 'Name', 'Phone', 'Email', 'Session', 'Members',
  'Format', 'Format code', 'Date', 'Start', 'End', 'When', 'Main concern', 'Notes', 'Fee (INR)', 'Payment method',
  'Payment ID / UTR', 'Order ID', 'Amount paid (INR)', 'Paid at', 'Calendar event', 'Meet link'];
const ORG_HEADERS = ['Received', 'Status', 'Contact person', 'Organisation', 'Phone', 'Email', 'Best day', 'Best time', 'Looking for'];

const S = {
  PENDING: 'Pending payment',
  VERIFY: 'Payment to verify',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  ATTENTION: 'Paid – needs attention',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Rescheduled',
};
const FREE = [S.EXPIRED, S.CANCELLED, S.RESCHEDULED];   // these no longer hold a slot
const MAX_HOLDS_PER_EMAIL = 2;
const MAX_HOLDS_PER_IP_HOUR = 8;

/* ---------------------------------------------------------------------
   Web app entry points
   --------------------------------------------------------------------- */
function doGet() {
  return json({ ok: true, service: 'BearingMind bookings' });
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'bad_request' }); }
  const secret = PropertiesService.getScriptProperties().getProperty('SCRIPT_SECRET');
  if (!secret || !safeEqual(String(d.secret || ''), secret)) return json({ ok: false, error: 'unauthorised' });

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return json({ ok: false, error: 'busy' });
  try {
    switch (d.action) {
      case 'slots': return json({ ok: true, booked: bookedSlots() });
      case 'hold': return json(hold(d));
      case 'release': return json(release(d));
      case 'confirm': return json(confirmPayment(d));
      case 'upi_submit': return json(upiSubmit(d));
      case 'org_enquiry': return json(orgEnquiry(d));
      default: return json({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    console.error(err && err.stack || err);
    return json({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

/* ---------------------------------------------------------------------
   Bookings
   --------------------------------------------------------------------- */
function hold(d) {
  if (!d.ref || !d.date || !d.time || !d.email || !d.name) return { ok: false, error: 'missing_fields' };

  const cache = CacheService.getScriptCache();
  const ipKey = 'ip:' + String(d.ip || 'unknown');
  const ipCount = Number(cache.get(ipKey) || 0);
  if (ipCount >= MAX_HOLDS_PER_IP_HOUR) return { ok: false, error: 'too_many' };
  cache.put(ipKey, String(ipCount + 1), 3600);

  const now = Date.now();
  const email = String(d.email).toLowerCase();
  const rows = readBookings();
  if (bookedSlots(rows, now).indexOf(d.date + ' ' + d.time) !== -1) return { ok: false, error: 'slot_taken' };
  const active = rows.filter(r => r.Email.toLowerCase() === email && r.Status === S.PENDING && r.holdUntilMs > now).length;
  if (active >= MAX_HOLDS_PER_EMAIL) return { ok: false, error: 'too_many' };

  const holdUntil = new Date(now + Number(d.holdMinutes || 15) * 60000);
  appendBooking({
    'Received': new Date(), 'Reference': d.ref, 'Status': S.PENDING, 'Hold until': holdUntil,
    'Name': clean(d.name), 'Phone': text(d.phone), 'Email': clean(email), 'Session': clean(d.session),
    'Members': clean(d.members), 'Format': clean(d.modeLabel), 'Format code': clean(d.mode),
    'Date': text(d.date), 'Start': text(d.time), 'End': text(d.endTime), 'When': clean(d.when),
    'Main concern': clean(d.topic), 'Notes': clean(d.notes), 'Fee (INR)': Number(d.fee) || 0,
    'Payment method': clean(d.paymentMethod),
  });
  return { ok: true };
}

function release(d) {
  const r = findBooking(d.ref);
  if (r && r.Status === S.PENDING) setCells(r, { 'Status': S.EXPIRED });
  return { ok: true };
}

/* Called by the website after Razorpay payment is verified, and again by
   Razorpay's webhook as a safety net. Safe to run twice. */
function confirmPayment(d) {
  const r = findBooking(d.ref);
  if (!r) {
    alertOnce('noref:' + d.paymentId, 'Payment received without a booking: ' + d.ref,
      [['Reference', d.ref], ['Payment ID', d.paymentId], ['Amount', 'Rs ' + d.amount]],
      'A payment arrived that does not match any booking row. Check Razorpay and contact the patient.');
    return { ok: true, status: 'not_found' };
  }
  if ([S.CONFIRMED, S.COMPLETED, S.ATTENTION].indexOf(r.Status) !== -1) {
    return { ok: true, status: r.Status, meetLink: r['Meet link'] };
  }

  const pay = {
    'Payment method': 'Razorpay' + (d.method ? ' (' + d.method + ')' : ''),
    'Payment ID / UTR': clean(d.paymentId), 'Order ID': clean(d.orderId),
    'Amount paid (INR)': Number(d.amount) || 0, 'Paid at': new Date(), 'Hold until': '',
  };

  const now = Date.now();
  const clash = readBookings().some(o => o.row !== r.row && o.Date === r.Date && o.Start === r.Start && holdsSlot(o, now));
  const amountOk = Number(d.amount) === Number(r['Fee (INR)']);

  if (clash || !amountOk) {
    pay['Status'] = S.ATTENTION;
    setCells(r, pay);
    const why = clash ? 'The time was taken by another booking while this patient was paying.' : 'The amount paid does not match the fee.';
    sendMail(CONFIG.NOTIFY_EMAIL, 'Action needed: booking ' + r.Reference + ' paid Rs ' + d.amount,
      emailHtml('Action needed', 'A patient has paid, but this booking needs your attention.', [
        ['Reference', r.Reference], ['Client', r.Name + ' (' + r.Phone + ')'], ['Email', r.Email],
        ['Session', r.Session], ['When', r.When], ['Paid', 'Rs ' + d.amount + ' · ' + d.paymentId], ['Reason', why],
      ], '', '', 'Please call the patient to arrange a time, or refund from your Razorpay dashboard.', true));
    sendMail(r.Email, 'We have received your payment ' + r.Reference,
      emailHtml('Payment received', 'Dear ' + first(r.Name) + ', thank you. We have received your payment of Rs ' + esc(d.amount) + '.', [
        ['Reference', r.Reference], ['Payment ID', d.paymentId],
      ], '', '', 'The time you chose was booked by someone else while you were paying. We will contact you shortly to arrange a time that suits you.'));
    return { ok: true, status: S.ATTENTION };
  }

  pay['Status'] = S.CONFIRMED;
  setCells(r, pay);
  const fresh = findBooking(d.ref);
  const result = sendConfirmation(fresh);
  return { ok: true, status: S.CONFIRMED, meetLink: result.meet };
}

/* Manual UPI: the patient has entered a UTR. You check it, then set Confirmed. */
function upiSubmit(d) {
  const r = findBooking(d.ref);
  if (!r) return { ok: false, error: 'not_found' };
  if (r.Status !== S.PENDING && r.Status !== S.EXPIRED) return { ok: true };
  if (r.Status === S.EXPIRED) {
    const now = Date.now();
    const clash = readBookings().some(o => o.row !== r.row && o.Date === r.Date && o.Start === r.Start && holdsSlot(o, now));
    if (clash) return { ok: false, error: 'slot_taken' };
  }
  setCells(r, { 'Status': S.VERIFY, 'Payment method': 'UPI (manual)', 'Payment ID / UTR': text(d.utr), 'Hold until': '' });

  sendMail(CONFIG.NOTIFY_EMAIL, 'New booking ' + r.Reference + ': verify UPI payment of Rs ' + r['Fee (INR)'],
    emailHtml('Verify a UPI payment', 'A new booking is waiting for you to check the payment.', [
      ['Reference', r.Reference], ['Client', r.Name + ' (' + r.Phone + ')'], ['Session', r.Session + ', ' + r.Format],
      ['When', r.When], ['Amount', 'Rs ' + r['Fee (INR)']], ['UTR', d.utr],
    ], sheetUrl(), 'Open the Bookings sheet',
    'Check the payment in your UPI app, then set Status to "Confirmed". The patient will be emailed and invited automatically. Their main concern and notes are in the sheet.', true));

  sendMail(r.Email, 'We have received your booking ' + r.Reference,
    emailHtml('Booking received', 'Dear ' + first(r.Name) + ', thank you. We have received your booking request for ' + esc(r.When) + '.', [
      ['Reference', r.Reference],
    ], '', '',
    'We will confirm by email once your UPI payment is verified, usually within a few hours.' + venueLine(r['Format code'], false) +
    '<br><br>If you need to cancel, your session will be rescheduled to a later date of your choice.'));
  return { ok: true };
}

/* Calendar invite + confirmation emails. Used for online payments and when you set Confirmed by hand. */
function sendConfirmation(r) {
  let ev = { id: '', meet: '' };
  try {
    ev = createEvent(r);
    setCells(r, { 'Calendar event': ev.id, 'Meet link': ev.meet });
  } catch (err) {
    console.error('Calendar failed: ' + err);
  }
  const rows = [
    ['Reference', r.Reference], ['Session', r.Session], ['Format', r.Format], ['When', r.When],
  ];
  if (r['Amount paid (INR)']) rows.push(['Amount paid', 'Rs ' + r['Amount paid (INR)'] + ', inclusive of all taxes']);
  if (r['Payment ID / UTR']) rows.push(['Payment reference', r['Payment ID / UTR']]);
  if (r['Format code'] === 'phone') rows.push(['Phone', r.Phone]);

  sendMail(r.Email, 'Your BearingMind session is confirmed: ' + r.When,
    emailHtml('Your session is confirmed', 'Dear ' + first(r.Name) + ', thank you. Your session is confirmed.', rows,
      ev.meet, ev.meet ? 'Join on Google Meet' : '',
      (ev.meet ? 'The link is also in your calendar invite.' : '') + venueLine(r['Format code'], true) +
      '<br><br>If you need to cancel, your session will be rescheduled to a later date of your choice. ' +
      'Reply to this email or WhatsApp ' + esc(CONFIG.PHONE) + ' for any change.'));

  sendMail(CONFIG.NOTIFY_EMAIL, 'Confirmed: ' + r.Reference + ', ' + r.When,
    emailHtml('New confirmed booking', 'Payment verified. The session is in your calendar.', [
      ['Reference', r.Reference], ['Client', r.Name + ' (' + r.Phone + ')'], ['Email', r.Email],
      ['Session', r.Session], ['Format', r.Format], ['When', r.When],
      ['Amount', 'Rs ' + (r['Amount paid (INR)'] || r['Fee (INR)'])], ['Payment', r['Payment ID / UTR']],
    ], sheetUrl(), 'Open the Bookings sheet',
    'Main concern and notes are in the sheet, kept out of email for privacy.' +
    (r['Format code'] === 'dining' ? ' Remember to send the hotel details.' : ''), true));

  if (r['Format code'] === 'inperson' && CONFIG.ASSOCIATE_EMAIL) {
    sendMail(CONFIG.ASSOCIATE_EMAIL, 'Children and family session: ' + r.When,
      emailHtml('New session', 'A Children and family session has been booked.', [
        ['Reference', r.Reference], ['Parent or guardian', r.Name + ' (' + r.Phone + ')'], ['Email', r.Email], ['When', r.When],
      ], '', '', 'Please share the venue with the family.', true));
  }
  return ev;
}

function createEvent(r) {
  const start = r.Date + 'T' + r.Start + ':00+05:30';
  const end = r.Date + 'T' + (r.End || r.Start) + ':00+05:30';
  const attendees = [{ email: r.Email, displayName: r.Name }];
  if (r['Format code'] === 'inperson' && CONFIG.ASSOCIATE_EMAIL) attendees.push({ email: CONFIG.ASSOCIATE_EMAIL });
  const event = {
    summary: 'BearingMind session · ' + r.Name,
    description: r.Session + '\n' + r.Format + '\nReference ' + r.Reference +
      (r['Format code'] === 'phone' ? '\nPhone: ' + r.Phone : '') + '\n\n' + CONFIG.PRACTICE + ' · ' + CONFIG.PHONE,
    start: { dateTime: start, timeZone: CONFIG.TZ },
    end: { dateTime: end, timeZone: CONFIG.TZ },
    attendees: attendees,
    guestsCanInviteOthers: false,
    guestsCanSeeOtherGuests: false,
    reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 1440 }, { method: 'popup', minutes: 60 }] },
  };
  if (r['Format code'] === 'meet') {
    event.conferenceData = { createRequest: { requestId: r.Reference + '-' + Date.now(), conferenceSolutionKey: { type: 'hangoutsMeet' } } };
  }
  const created = Calendar.Events.insert(event, CONFIG.CALENDAR_ID, { conferenceDataVersion: 1, sendUpdates: 'all' });
  return { id: created.id, meet: created.hangoutLink || '' };
}

function removeEvent(r) {
  if (!r['Calendar event']) return;
  try {
    Calendar.Events.remove(CONFIG.CALENDAR_ID, r['Calendar event'], { sendUpdates: 'all' });
  } catch (err) {
    console.error('Could not remove event: ' + err);
  }
  setCells(r, { 'Calendar event': '', 'Meet link': '' });
}

/* Runs when you edit the sheet (installed by setup). */
function handleEdit(e) {
  if (!e || !e.range) return;
  const sh = e.range.getSheet();
  if (sh.getName() !== BOOKINGS || e.range.getRow() < 2) return;
  const statusCol = colIndex(sh, 'Status');
  if (e.range.getColumn() !== statusCol || e.range.getNumColumns() !== 1) return;

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return;
  try {
    const r = readRow(sh, e.range.getRow());
    if (r.Status === S.CONFIRMED && !r['Calendar event']) {
      if (!r['Paid at']) setCells(r, { 'Paid at': new Date(), 'Amount paid (INR)': r['Fee (INR)'] });
      sendConfirmation(readRow(sh, r.row));
    }
    if ((r.Status === S.CANCELLED || r.Status === S.RESCHEDULED) && r['Calendar event']) removeEvent(r);
  } finally {
    lock.releaseLock();
  }
}

/* Runs every 10 minutes (installed by setup): marks unpaid holds as expired. */
function expireHolds() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return;
  try {
    const now = Date.now();
    readBookings().forEach(r => {
      if (r.Status === S.PENDING && r.holdUntilMs && r.holdUntilMs < now) setCells(r, { 'Status': S.EXPIRED });
    });
  } finally {
    lock.releaseLock();
  }
}

/* ---------------------------------------------------------------------
   Organisation enquiries
   --------------------------------------------------------------------- */
function orgEnquiry(d) {
  const email = String(d.email || '').trim().toLowerCase();
  if (!d.name || !d.org || !d.phone || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: 'missing_fields' };
  const cache = CacheService.getScriptCache();
  const key = 'org:' + email;
  if (cache.get(key)) return { ok: false, error: 'too_many' };   // one enquiry per hour per email
  cache.put(key, '1', 3600);

  sheet(ORGS, ORG_HEADERS).appendRow([new Date(), 'New', clean(d.name), clean(d.org), text(d.phone), clean(email), text(d.date), clean(d.time), clean(d.need)]);
  const day = Utilities.formatDate(new Date(d.date + 'T00:00:00+05:30'), CONFIG.TZ, 'EEEE d MMMM');

  sendMail(CONFIG.NOTIFY_EMAIL, 'Organisation enquiry: ' + d.org,
    emailHtml('Organisation enquiry', 'A new enquiry has arrived from the website.', [
      ['Contact', d.name], ['Organisation', d.org], ['Phone', d.phone], ['Email', email],
      ['Best time', day + ', ' + d.time], ['Looking for', d.need || '-'],
    ], sheetUrl(), 'Open the enquiries sheet', '', true));
  sendMail(email, 'Thank you for your enquiry',
    emailHtml('Thank you for your enquiry', 'Dear ' + first(d.name) + ', thank you for your interest in BearingMind for ' + esc(String(d.org).slice(0, 80)) + '.', [],
      '', '', 'We will contact you on ' + esc(day + ', ' + String(d.time).toLowerCase()) + '.'));
  return { ok: true };
}

/* ---------------------------------------------------------------------
   One-time setup: run this once from the editor (select "setup", press Run)
   --------------------------------------------------------------------- */
function setup() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('SCRIPT_SECRET');
  if (!secret) {
    secret = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    props.setProperty('SCRIPT_SECRET', secret);
  }

  const sh = sheet(BOOKINGS, HEADERS);
  sheet(ORGS, ORG_HEADERS);
  const statusCol = colIndex(sh, 'Status');
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList([S.PENDING, S.VERIFY, S.CONFIRMED, S.COMPLETED, S.ATTENTION, S.CANCELLED, S.RESCHEDULED, S.EXPIRED], true)
    .setAllowInvalid(false).build();
  sh.getRange(2, statusCol, sh.getMaxRows() - 1, 1).setDataValidation(rule);

  const range = sh.getRange(2, 1, sh.getMaxRows() - 1, HEADERS.length);
  const colour = (status, bg) => SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$' + columnLetter(statusCol) + '2="' + status + '"').setBackground(bg).setRanges([range]).build();
  sh.setConditionalFormatRules([
    colour(S.CONFIRMED, '#E3F0E8'), colour(S.COMPLETED, '#EDF2EE'), colour(S.VERIFY, '#FFF4D6'),
    colour(S.ATTENTION, '#F8DADA'), colour(S.PENDING, '#F4F6F5'), colour(S.EXPIRED, '#FAFAFA'),
    colour(S.CANCELLED, '#FAFAFA'), colour(S.RESCHEDULED, '#FAFAFA'),
  ]);

  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('handleEdit').forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
  ScriptApp.newTrigger('expireHolds').timeBased().everyMinutes(10).create();

  Calendar.Calendars.get(CONFIG.CALENDAR_ID);   // checks calendar access now, not on the first booking

  console.log('Setup complete.\n\nCopy this secret into Vercel as APPS_SCRIPT_SECRET:\n\n' + secret + '\n');
}

/* Compares secrets in constant time, so timing cannot reveal them. */
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ---------------------------------------------------------------------
   Sheet helpers
   --------------------------------------------------------------------- */
function sheet(name, headers) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#EDF2EE');
    sh.setFrozenRows(1);
  }
  return sh;
}

function colIndex(sh, name) {
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].indexOf(name) + 1;
}

function readBookings() {
  const sh = sheet(BOOKINGS, HEADERS);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const shown = sh.getRange(2, 1, last - 1, head.length).getDisplayValues();
  const raw = sh.getRange(2, 1, last - 1, head.length).getValues();
  return shown.map((vals, i) => toRecord(head, vals, raw[i], i + 2, sh));
}

function readRow(sh, row) {
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const range = sh.getRange(row, 1, 1, head.length);
  return toRecord(head, range.getDisplayValues()[0], range.getValues()[0], row, sh);
}

function toRecord(head, shown, raw, row, sh) {
  const r = { row: row, sheet: sh };
  head.forEach((h, j) => { r[h] = shown[j]; });
  const hu = raw[head.indexOf('Hold until')];
  r.holdUntilMs = hu instanceof Date ? hu.getTime() : 0;
  return r;
}

function findBooking(ref) {
  if (!ref) return null;
  return readBookings().find(r => r.Reference === String(ref)) || null;
}

function holdsSlot(r, now) {
  if (FREE.indexOf(r.Status) !== -1) return false;
  if (r.Status === S.PENDING && r.holdUntilMs && r.holdUntilMs < now) return false;
  return Boolean(r.Date && r.Start);
}

function bookedSlots(rows, now) {
  now = now || Date.now();
  return (rows || readBookings()).filter(r => holdsSlot(r, now)).map(r => r.Date + ' ' + r.Start);
}

function appendBooking(values) {
  const sh = sheet(BOOKINGS, HEADERS);
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  sh.appendRow(head.map(h => (h in values ? values[h] : '')));
}

function setCells(r, values) {
  const head = r.sheet.getRange(1, 1, 1, r.sheet.getLastColumn()).getValues()[0];
  Object.keys(values).forEach(k => {
    const c = head.indexOf(k);
    if (c !== -1) r.sheet.getRange(r.row, c + 1).setValue(values[k]);
  });
}

function columnLetter(n) {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

function sheetUrl() { return SpreadsheetApp.getActive().getUrl(); }

/* Stops text being read as a spreadsheet formula, and trims long input. */
function clean(v) {
  let s = String(v == null ? '' : v).slice(0, 2000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

/* Keeps dates, times and numbers exactly as sent (e.g. 2026-10-14, 18:45, +9198…). */
function text(v) { return "'" + String(v == null ? '' : v).slice(0, 40); }

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------------------------------------------------------------
   Email
   --------------------------------------------------------------------- */
function sendMail(to, subject, html) {
  if (!to) return;
  try {
    MailApp.sendEmail({
      to: to, subject: subject, name: CONFIG.PRACTICE, replyTo: CONFIG.NOTIFY_EMAIL,
      htmlBody: html, body: html.replace(/<br\s*\/?>/g, '\n').replace(/<\/(p|tr|h1|div)>/g, '\n').replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim(),
    });
  } catch (err) {
    console.error('Email to ' + to + ' failed: ' + err);
  }
}

function alertOnce(key, subject, rows, note) {
  const cache = CacheService.getScriptCache();
  if (cache.get(key)) return;
  cache.put(key, '1', 21600);
  sendMail(CONFIG.NOTIFY_EMAIL, subject, emailHtml('Action needed', esc(subject), rows, '', '', note, true));
}

function venueLine(code, confirmed) {
  if (code === 'dining') return confirmed ? ' The venue details will be shared with you separately.' : ' The venue will be shared with your confirmation.';
  if (code === 'inperson') return confirmed ? ' Our associate consultant will share the venue with you.' : ' Our associate consultant will share the venue with your confirmation.';
  return '';
}

function first(name) { return esc(String(name || '').slice(0, 60)); }

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Branded email in the website's colours. Text-only logo, so it shows even when images are blocked. */
function emailHtml(heading, intro, rows, buttonUrl, buttonText, after, internal) {
  const table = rows.length ? '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:22px 0;border-top:1px solid #DCE3E1">' +
    rows.map(r => '<tr><td style="padding:11px 12px 11px 0;border-bottom:1px solid #DCE3E1;color:#5A6762;font-size:14px;width:38%;vertical-align:top">' + esc(r[0]) +
      '</td><td style="padding:11px 0;border-bottom:1px solid #DCE3E1;color:#0E1A16;font-size:14px;vertical-align:top">' + esc(r[1]) + '</td></tr>').join('') +
    '</table>' : '';
  const button = buttonUrl && buttonText ? '<p style="margin:26px 0"><a href="' + esc(buttonUrl) + '" style="display:inline-block;background:#1F4D3A;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:999px">' + esc(buttonText) + '</a></p>' : '';
  const footer = internal ? '<p style="margin:0;color:#8A9590;font-size:12px">Sent by your website booking system.</p>' :
    '<p style="margin:0 0 6px;color:#5A6762;font-size:13px">' + esc(CONFIG.PRACTICE) + '<br>' + esc(CONFIG.ADDRESS) + '<br>' +
    '<a href="tel:' + CONFIG.PHONE.replace(/\s/g, '') + '" style="color:#163A2B">' + esc(CONFIG.PHONE) + '</a> · <a href="' + CONFIG.WHATSAPP + '" style="color:#163A2B">WhatsApp</a> · <a href="' + CONFIG.SITE + '" style="color:#163A2B">bearingmind.com</a></p>' +
    '<p style="margin:12px 0 0;color:#8A9590;font-size:12px;line-height:1.5">' + esc(CONFIG.CRISIS) + '</p>';
  return '<!doctype html><html><body style="margin:0;padding:0;background:#EDF2EE">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDF2EE;padding:28px 12px"><tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#FBFCFB;border:1px solid #DCE3E1;border-radius:16px">' +
    '<tr><td style="padding:28px 32px 18px;border-bottom:1px solid #DCE3E1">' +
    '<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:24px;color:#1B2A25;line-height:1">BearingMind</div>' +
    '<div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:2.4px;color:#4C5854;margin-top:6px">HEALTH SERVICES</div></td></tr>' +
    '<tr><td style="padding:28px 32px 8px;font-family:Arial,Helvetica,sans-serif;color:#34433E;font-size:15px;line-height:1.6">' +
    '<h1 style="margin:0 0 14px;font-family:Georgia,\'Times New Roman\',serif;font-weight:400;font-size:26px;color:#0E1A16;line-height:1.2">' + esc(heading) + '</h1>' +
    '<p style="margin:0">' + intro + '</p>' + table + button +
    (after ? '<p style="margin:0 0 8px">' + after + '</p>' : '') +
    '</td></tr><tr><td style="padding:22px 32px 28px;font-family:Arial,Helvetica,sans-serif;border-top:1px solid #DCE3E1">' + footer + '</td></tr>' +
    '</table></td></tr></table></body></html>';
}
