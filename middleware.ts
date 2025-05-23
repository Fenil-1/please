import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getUserData } from "./lib/sheets"

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || ""
  const url = request.nextUrl.clone()

  // Skip if this is already a rewritten request
  if (request.headers.get("x-tenant-id")) {
    return NextResponse.next()
  }

  // Extract subdomain from host (e.g. username.fenil.life)
  const subdomain = host.split('.')[0]
  const domain = host.split('.').slice(1).join('.')

  // List of reserved subdomains that should not be treated as tenant subdomains
  const reserved = ["www", "app", "admin", "sheetzu"]
  
  // Check if this is a valid subdomain request
  const isSubdomain = !reserved.includes(subdomain) && 
    (domain === 'fenil.life' || domain === 'localhost:3000' || domain === 'localhost')

  if (isSubdomain) {
    // Get user data from master sheet
    const userData = await getUserData(subdomain)
    
    if (userData) {
      // Store user info in headers for the API route to use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-tenant-id', userData.username) // Using username as tenant ID
      requestHeaders.set('x-sheet-id', userData.sheetId)
      requestHeaders.set('x-username', userData.username)
      requestHeaders.set('x-is-paid', userData.isPaid.toString())
      
      // Rewrite to the main page which will handle the sheet content
      url.pathname = '/'
      return NextResponse.rewrite(url, {
        headers: requestHeaders,
      })
    }
    
    // If user not found, redirect to main domain
    const mainDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'fenil.life'
    const redirectUrl = new URL('/', request.url)
    redirectUrl.host = mainDomain
    return NextResponse.redirect(redirectUrl)
  }

  // For the main domain, continue as normal
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
