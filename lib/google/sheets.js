import { google } from 'googleapis';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

const sheets = google.sheets({ version: 'v4', auth: getAuth() });

export async function appendRows(rows) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Aulas!A:F',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: rows.map((r) => [
        r.data,
        r.aluno,
        r.modalidade,
        r.horas,
        r.valor,
        r.status_pagamento,
      ]),
    },
  });
}
