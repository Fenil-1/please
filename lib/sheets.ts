// This file handles all Google Sheets related functionality

// The ID of your master Google Sheet that contains user data
const MASTER_SHEET_ID = "1UShxLCF5OaN5xC6g79e96XNJMl1JcKaYin1YN8LTXzA"

export interface UserData {
  isPaid: boolean
  username: string
  sheetId: string
}

// Function to fetch and parse the master sheet data
async function fetchMasterSheetData(): Promise<UserData[]> {
  try {
    // Google Sheets published to the web can be accessed as CSV
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${MASTER_SHEET_ID}/gviz/tq?tqx=out:csv`)

    if (!response.ok) {
      throw new Error(`Failed to fetch master sheet: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log("CSV Response:", csvText.substring(0, 200)) // Log a sample of the response for debugging

    // Parse CSV (simple implementation, consider using a CSV parser library for production)
    const rows = csvText.split("\n").slice(1) // Skip header row

    // Filter out empty rows and parse each valid row
    return rows
      .filter((row) => row.trim() !== "") // Skip empty rows
      .map((row) => {
        const columns = row.split(",")

        // Check if we have enough columns before accessing them
        if (columns.length < 3) {
          console.warn(`Skipping row with insufficient columns: ${row}`)
          return null
        }

        try {
          // Google Sheets exports checkboxes as "TRUE" (checked) or empty/other (unchecked)
          const rawIsPaid = columns[0] ? columns[0].trim().replace(/"/g, "") : ""
          const isPaid = rawIsPaid.toUpperCase() === "TRUE"
          const username = columns[1] ? columns[1].trim().replace(/"/g, "") : ""
          const sheetId = columns[2] ? columns[2].trim().replace(/"/g, "") : ""

          // Skip rows with missing essential data
          if (!username || !sheetId) {
            console.warn(`Skipping row with missing username or sheetId: ${row}`)
            return null
          }

          return {
            isPaid,
            username,
            sheetId,
          }
        } catch (err) {
          console.error(`Error parsing row: ${row}`, err)
          return null
        }
      })
      .filter((userData): userData is UserData => userData !== null) // Filter out null entries
  } catch (error) {
    console.error("Error fetching master sheet:", error)
    throw error
  }
}

// Function to get user data by username
export async function getUserData(username: string): Promise<UserData | null> {
  try {
    const allUsers = await fetchMasterSheetData()

    if (!allUsers || allUsers.length === 0) {
      console.warn("No users found in master sheet")
      return null
    }

    return allUsers.find((user) => user.username.toLowerCase() === username.toLowerCase()) || null
  } catch (error) {
    console.error(`Error getting data for username ${username}:`, error)
    throw error
  }
}

// Function to fetch data from a user's sheet
export async function fetchSheetData(sheetId: string): Promise<any> {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`)

    if (!response.ok) {
      throw new Error("Failed to fetch sheet data")
    }

    // Google's response is not pure JSON, it's wrapped in a callback
    // We need to extract the JSON part
    const text = await response.text()
    const jsonStart = text.indexOf("{")
    const jsonEnd = text.lastIndexOf("}") + 1
    const jsonString = text.substring(jsonStart, jsonEnd)

    return JSON.parse(jsonString)
  } catch (error) {
    console.error("Error fetching sheet data:", error)
    throw error
  }
}

// Add this function to fetch the last N signups from the master sheet
export async function getLastSignups(n: number) {
  const allUsers = await fetchMasterSheetData()
  // Return the last n users, most recent first (assuming sheet is ordered by signup time)
  return allUsers.slice(-n).reverse()
}
