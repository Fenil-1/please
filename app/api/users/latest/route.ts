import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const MASTER_SHEET_ID = "1UShxLCF5OaN5xC6g79e96XNJMl1JcKaYin1YN8LTXzA"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: MASTER_SHEET_ID,
      range: 'A:C',
    })

    if (!response.data.values) {
      return NextResponse.json({ error: 'No data found in master sheet' }, { status: 404 })
    }

    const users = response.data.values.slice(1)
      .filter((row) => row.length >= 3)
      .map((row) => {
        const [isPaid, username, sheetId] = row
        if (!username || !sheetId) return null
        return {
          isPaid: isPaid?.toString().toUpperCase() === 'TRUE',
          username: username.toString().trim(),
          sheetId: sheetId.toString().trim(),
        }
      })
      .filter((user): user is { isPaid: boolean; username: string; sheetId: string } => user !== null)

    // Return the last 10 users, most recent first
    return NextResponse.json(users.slice(-10).reverse())
  } catch (error) {
    console.error('Error fetching latest signups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch latest signups' },
      { status: 500 }
    )
  }
} 