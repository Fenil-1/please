import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

const sheets = google.sheets({ version: 'v4', auth })

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