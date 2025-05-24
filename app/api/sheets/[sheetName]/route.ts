import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Initialize Google Sheets API with better error handling
let auth: any;
let sheets: any;

try {
  // Option 1: Use JSON credentials (your current approach)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    // Validate that required fields exist
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error('Invalid GOOGLE_APPLICATION_CREDENTIALS: missing client_email or private_key');
    }
    
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  }
  // Option 2: Use separate environment variables (fallback)
  else if (process.env.GOOGLE_SHEETS_CLIENT_EMAIL && process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
    auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  }
  else {
    throw new Error('Missing Google Sheets credentials. Please set either GOOGLE_APPLICATION_CREDENTIALS or both GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY');
  }

  sheets = google.sheets({ version: 'v4', auth });
} catch (error) {
  console.error('Failed to initialize Google Sheets API:', error);
}

// Map URL-friendly sheet names to actual sheet names
const SHEET_NAME_MAP: { [key: string]: string } = {
  'Events_Products': 'Events/Products',
  'Settings': 'Settings',
  'WebPages': 'WebPages'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sheetName: string } }
) {
  try {
    // Check if Google Sheets API was initialized successfully
    if (!sheets || !auth) {
      return NextResponse.json(
        { error: 'Google Sheets API not properly configured. Check your environment variables.' },
        { status: 500 }
      )
    }

    // Get sheetId from query parameters
    const searchParams = request.nextUrl.searchParams
    const sheetId = searchParams.get('sheetId')

    if (!sheetId) {
      return NextResponse.json(
        { error: 'Sheet ID is required' },
        { status: 400 }
      )
    }
        
    // Convert URL-friendly sheet name to actual sheet name
    const actualSheetName = SHEET_NAME_MAP[params.sheetName] || params.sheetName
    console.log(`Fetching sheet "${actualSheetName}" from spreadsheet ${sheetId}`)

    // First check if the spreadsheet exists and we have access
    try {
      await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      })
    } catch (error: any) {
      console.error('Error accessing spreadsheet:', error)
      if (error.code === 404) {
        return NextResponse.json(
          { error: 'Google Sheet not found. Please check the Sheet ID.' },
          { status: 404 }
        )
      } else if (error.code === 403) {
        return NextResponse.json(
          { error: 'Access denied. Please make sure the sheet is shared with the service account.' },
          { status: 403 }
        )
      }
      throw error
    }

    // Get sheet data
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: actualSheetName,
      })

      return NextResponse.json(response.data)
    } catch (error: any) {
      console.error('Error fetching sheet values:', error)
      if (error.code === 404) {
        return NextResponse.json(
          { error: `Sheet "${actualSheetName}" not found in the spreadsheet. Please make sure it exists.` },
          { status: 404 }
        )
      }
      throw error
    }
  } catch (error: any) {
    console.error('Error in sheets API route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sheet data' },
      { status: 500 }
    )
  }
}