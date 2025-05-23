import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

const sheets = google.sheets({ version: 'v4', auth })

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

    // Get sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: params.sheetName,
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching sheet data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sheet data' },
      { status: 500 }
    )
  }
} 