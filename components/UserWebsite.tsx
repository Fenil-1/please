"use client"

import { useEffect, useState } from "react"

interface UserWebsiteProps {
  sheetId: string
  isPaid: boolean
  username: string
}

interface SheetData {
  events: any[]
  settings: any
  webpages: any[]
}

export default function UserWebsite({ sheetId, isPaid, username }: UserWebsiteProps) {
  const [data, setData] = useState<SheetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSheetData() {
      try {
        // Fetch events data
        const eventsResponse = await fetch(`/api/sheets/Events/Products?sheetId=${sheetId}`)
        if (!eventsResponse.ok) throw new Error('Failed to fetch events data')
        const eventsData = await eventsResponse.json()

        // Fetch settings data
        const settingsResponse = await fetch(`/api/sheets/Settings?sheetId=${sheetId}`)
        if (!settingsResponse.ok) throw new Error('Failed to fetch settings data')
        const settingsData = await settingsResponse.json()

        // Fetch webpages data
        const webpagesResponse = await fetch(`/api/sheets/WebPages?sheetId=${sheetId}`)
        if (!webpagesResponse.ok) throw new Error('Failed to fetch webpages data')
        const webpagesData = await webpagesResponse.json()

        setData({
          events: eventsData.values || [],
          settings: settingsData.values || {},
          webpages: webpagesData.values || []
        })
      } catch (err) {
        setError('Failed to load website data')
        console.error('Error fetching sheet data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (sheetId) {
      fetchSheetData()
    }
  }, [sheetId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500 text-xl">No data available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {data.settings.title || `${username}'s Website`}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Events/Products Section */}
        {data.events.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Events & Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.events.map((event, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  {event.price && (
                    <div className="text-lg font-bold text-green-600">
                      ${event.price}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Web Pages Section */}
        {data.webpages.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Pages</h2>
            <div className="space-y-8">
              {data.webpages.map((page, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">{page.title}</h3>
                  <div className="prose max-w-none">
                    {page.content}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} {data.settings.footerText || `${username}'s Website`}
          </p>
        </div>
      </footer>
    </div>
  )
}
