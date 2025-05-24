import { google } from 'googleapis'

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export const sheets = google.sheets({ version: 'v4', auth }) 