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
 */

const SHEET_NAME = 'Applications'; // rename your sheet tab to this, or change this string

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Add header row once
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'First Name',
        'Email',
        'Phone / WhatsApp',
        'Instagram',
        'Age Range',
        'Location',
        'Training Frequency',
        'Fitness Goal',
        'What Stopped Them',
        'Previous Coaching',
        'Commitment (1–10)',
      ]);

      // Basic formatting
      const header = sheet.getRange(1, 1, 1, 12);
      header.setFontWeight('bold');
      header.setBackground('#0f1a0c');
      header.setFontColor('#b0e455');
      sheet.setFrozenRows(1);
      sheet.setColumnWidths(1, 12, 200);
    }

    sheet.appendRow([
      new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
      data.firstName   || '',
      data.email       || '',
      data.phone       || '',
      data.instagram   || '',
      data.ageRange    || '',
      data.location    || '',
      data.trainingFrequency  || '',
      data.fitnessGoal        || '',
      data.stoppedProgress    || '',
      data.previousCoaching   || '',
      data.commitment  || '',
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

// Test this manually from the Apps Script editor:
// Run > Run function > testPost
function testPost() {
  const mock = {
    postData: {
      contents: JSON.stringify({
        firstName: 'Test',
        email: 'test@example.com',
        phone: '+65 9999 0000',
        instagram: '@test',
        ageRange: '26–30',
        location: 'Singapore',
        trainingFrequency: '3–4x / week',
        fitnessGoal: 'Lose body fat and get more defined',
        stoppedProgress: 'Consistency and not knowing what to eat',
        previousCoaching: 'No',
        commitment: 9,
      }),
    },
  };
  const result = doPost(mock);
  Logger.log(result.getContent());
}
