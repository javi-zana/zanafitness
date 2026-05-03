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

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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
