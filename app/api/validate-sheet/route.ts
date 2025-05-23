import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sheetId = searchParams.get('sheetId');

  if (!sheetId) {
    return NextResponse.json(
      { error: 'Sheet ID is required' },
      { status: 400 }
    );
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // First, try to get the spreadsheet metadata
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    // Then try to read the first sheet to verify we have read access
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A1', // Just try to read the first cell
    });

    if (!response.data) {
      throw new Error('Could not read data from the spreadsheet');
    }

    return NextResponse.json({ 
      success: true,
      title: spreadsheet.data.properties?.title 
    });
  } catch (error: any) {
    console.error('Sheet validation error:', error);
    
    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Google Sheet not found. Please check the Sheet ID and make sure the sheet exists.' },
        { status: 404 }
      );
    } else if (error.code === 403) {
      return NextResponse.json(
        { error: 'Access denied. Please make sure the Google Sheet is shared with the service account email: ' + 
          JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}').client_email },
        { status: 403 }
      );
    } else {
      return NextResponse.json(
        { error: `Error accessing Google Sheet: ${error.message}` },
        { status: 500 }
      );
    }
  }
} 