import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { TenantService } from "./lib/tenant"

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || ""
  const url = request.nextUrl.clone()

  // Extract subdomain from host (e.g. username.sheetzu.com or username.localhost)
  const subdomain = host.split('.')[0]
  const domain = host.split('.').slice(1).join('.')

  // List of reserved subdomains that should not be treated as tenant subdomains
  const reserved = ["www", "app", "admin", "sheetzu"]
  
  // Check if this is a valid subdomain request
  const isSubdomain = !reserved.includes(subdomain) && 
    (domain === 'sheetzu.com' || domain === 'localhost:3000' || domain === 'localhost')

  if (isSubdomain) {
    // Get tenant by domain
    const tenant = TenantService.getTenantByDomain(`${subdomain}.${domain}`)
    
    if (tenant) {
      // Store tenant info in headers for the API route to use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-tenant-id', tenant.id)
      requestHeaders.set('x-sheet-id', tenant.sheetId)
      requestHeaders.set('x-username', tenant.username)
      
      // Rewrite to the main page which will handle the sheet content
      url.pathname = '/'
      return NextResponse.rewrite(url, {
        headers: requestHeaders,
      })
    }
    
    // If tenant not found, redirect to main domain
    return NextResponse.redirect(new URL('/', request.url))
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
