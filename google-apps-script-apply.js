/**
 * Zana Fitness — Application Form → Google Sheets webhook
 *
 * HOW TO DEPLOY:
 * 1. Open your Google Sheet
 * 2. Extensions > Apps Script
 * 3. Delete the default code, paste all of this
 * 4. Save (Ctrl+S)
 * 5. Click Deploy > New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Click Deploy, copy the Web App URL
 * 7. Add to Vercel: GOOGLE_SHEET_APPLY_WEBHOOK = <that URL>
 *
 * NOTE: If you change questions, update the HEADERS array and the
 * sheet.appendRow([...]) array below to match, then redeploy.
 */

const SHEET_NAME = 'Applications';

// Who gets the "new application" alert email.
const NOTIFY_EMAILS = ['me@javilorenzana.com', 'bea.ongg@gmail.com'];

const HEADERS = [
  'Timestamp',
  'First Name',        // Q1
  'Email',             // Q2
  'Phone / WhatsApp',  // Q3
  'Instagram',         // Q4
  'Age',               // Q5
  'Location',          // Q6
  'Work',              // Q7
  'Mirror Goal',       // Q8
  'What Stopped Them', // Q9
  'Training History',  // Q10
  'Commitment (1–10)', // Q11
  'Investment Fit',    // Q12
  'Why Now',           // Q13 (optional)
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      const header = sheet.getRange(1, 1, 1, HEADERS.length);
      header.setFontWeight('bold');
      header.setBackground('#0f1a0c');
      header.setFontColor('#b0e455');
      sheet.setFrozenRows(1);
      sheet.setColumnWidths(1, HEADERS.length, 220);
    }

    sheet.appendRow([
      new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
      data.firstName        || '',
      data.email            || '',
      data.phone            || '',
      data.instagram        || '',
      data.age              || '',
      data.location         || '',
      data.work             || '',
      data.mirrorGoal       || '',
      data.whatStopped      || '',
      data.trainingHistory  || '',
      data.commitment       || '',
      data.investmentFit    || '',
      data.whyNow           || '',
    ]);

    // Fire-and-forget email alert — log but never fail the sheet write.
    try {
      sendApplicationAlert(data, ss.getUrl());
    } catch (mailErr) {
      Logger.log('Email alert failed: ' + mailErr);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendApplicationAlert(data, sheetUrl) {
  const name = data.firstName || 'Someone';
  const subject = 'New Zana application: ' + name +
    (data.commitment ? ' (commitment ' + data.commitment + '/10)' : '');

  const ig = data.instagram
    ? '<a href="https://instagram.com/' + String(data.instagram).replace(/^@/, '') +
      '">@' + String(data.instagram).replace(/^@/, '') + '</a>'
    : '';

  const rows = [
    ['First Name',       data.firstName],
    ['Email',            data.email ? '<a href="mailto:' + data.email + '">' + data.email + '</a>' : ''],
    ['Phone / WhatsApp', data.phone],
    ['Instagram',        ig],
    ['Age',              data.age],
    ['Location',         data.location],
    ['Work',             data.work],
    ['Mirror Goal',      data.mirrorGoal],
    ['What Stopped',     data.whatStopped],
    ['Training History', data.trainingHistory],
    ['Commitment (1–10)', data.commitment],
    ['Investment Fit',   data.investmentFit],
    ['Why Now',          data.whyNow],
  ];

  const rowHtml = rows.map(function (r) {
    const val = r[1] == null || r[1] === '' ? '<em style="color:#888">—</em>' : String(r[1]).replace(/\n/g, '<br>');
    return '<tr>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#444;vertical-align:top;white-space:nowrap;">' + r[0] + '</td>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111;">' + val + '</td>' +
      '</tr>';
  }).join('');

  const html =
    '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:640px;margin:0 auto;">' +
      '<div style="background:#0f1a0c;color:#b0e455;padding:20px 24px;border-radius:8px 8px 0 0;">' +
        '<div style="font-size:12px;letter-spacing:1px;opacity:.7;">ZANA FITNESS</div>' +
        '<div style="font-size:22px;font-weight:700;margin-top:4px;">New application from ' + name + '</div>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eee;border-top:none;font-size:14px;">' +
        rowHtml +
      '</table>' +
      '<div style="padding:20px;text-align:center;">' +
        '<a href="' + sheetUrl + '" style="display:inline-block;background:#b0e455;color:#0f1a0c;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Open sheet</a>' +
      '</div>' +
    '</div>';

  MailApp.sendEmail({
    to: NOTIFY_EMAILS.join(','),
    subject: subject,
    htmlBody: html,
    replyTo: data.email || undefined,
    name: 'Zana Applications',
  });
}

function testPost() {
  const mock = {
    postData: {
      contents: JSON.stringify({
        firstName: 'Marco',
        email: 'marco@example.com',
        phone: '+65 9123 4567',
        instagram: 'marco_sg',
        age: '30–34',
        location: 'Singapore',
        work: 'Investment banker',
        mirrorGoal: 'Look good with my shirt off at Bali in October',
        whatStopped: 'Inconsistency and not knowing what to eat when travelling',
        trainingHistory: "I train 3–4×/week but don't see the results I want",
        commitment: 9,
        investmentFit: "Yes — ready to commit if we're a match",
        whyNow: 'Getting married in December — want to look my best',
      }),
    },
  };
  Logger.log(doPost(mock).getContent());
}
