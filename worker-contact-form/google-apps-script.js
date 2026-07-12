/**
 * LZproxy contact form → Google Sheets webhook.
 *
 * SETUP:
 * 1. Go to sheets.google.com, create a new blank sheet, name it e.g.
 *    "LZproxy leads". Rename the first tab to "Leads".
 * 2. In the sheet: Extensions → Apps Script.
 * 3. Delete any starter code and paste this file's contents in.
 * 4. Click Deploy → New deployment → gear icon → Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click Deploy, authorize the permissions it asks for (this is your
 *    own script accessing your own sheet — safe to approve).
 * 6. Copy the Web App URL it gives you — this is your SHEETS_WEBHOOK_URL,
 *    set it as a Worker secret:
 *      wrangler secret put SHEETS_WEBHOOK_URL
 *
 * If you ever change this code, you must create a NEW deployment (or
 * "Manage deployments" → edit → new version) for changes to take effect.
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads')
      || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    const data = JSON.parse(e.postData.contents);

    // Add a header row if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Submitted At', 'Name', 'Business', 'Email', 'Area of Interest', 'Message']);
    }

    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.name || '',
      data.business || '',
      data.email || '',
      data.area || '',
      data.message || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
