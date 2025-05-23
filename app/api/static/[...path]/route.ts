import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Map file extensions to content types
const contentTypes: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const filePath = params.path.join("/")

  try {
    // Path to the static file in the public directory
    const staticFilePath = path.join(process.cwd(), "public", "templates", filePath)

    // Check if file exists
    if (!fs.existsSync(staticFilePath)) {
      return new NextResponse(`File ${filePath} not found`, { status: 404 })
    }

    // Determine the file extension for content type
    const ext = path.extname(filePath).toLowerCase()
    const contentType = contentTypes[ext] || "text/plain"

    // For binary files like images, read as buffer
    if (contentType.startsWith("image/")) {
      const buffer = fs.readFileSync(staticFilePath)
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
        },
      })
    }

    // For text files, read as utf-8
    const content = fs.readFileSync(staticFilePath, "utf-8")

    // Return the content with the appropriate content type
    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
      },
    })
  } catch (error) {
    console.error(`Error serving static file ${filePath}:`, error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
