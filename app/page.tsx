import { headers } from 'next/headers'
import { TenantService } from '@/lib/tenant'
import UserWebsite from '@/components/UserWebsite'
import UserNotFound from '@/components/UserNotFound'
import SheetzuSignupInline from '@/components/SheetzuSignupInline'

async function getTenantFromHost() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const subdomain = host.split('.')[0]
  const domain = host.split('.').slice(1).join('.')

  if (subdomain && domain && subdomain !== 'www' && subdomain !== 'localhost') {
    return TenantService.getTenantByDomain(`${subdomain}.${domain}`)
  }
  return null
}

export default async function Home() {
  const tenant = await getTenantFromHost()

  // If this is a subdomain request
  if (tenant) {
    return <UserWebsite 
      sheetId={tenant.sheetId} 
      isPaid={true} 
      username={tenant.username} 
    />
  }

  // For the main domain, show the home page
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <section className="flex-1 flex flex-col items-center justify-center border-b border-gray-200 bg-[#f8fafc] min-h-[50vh]">
        <div className="w-full max-w-2xl text-center mt-24 mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-gray-900 tracking-tight leading-tight" style={{letterSpacing:0.01}}>
            Start selling from a <span className="bg-[#e3fee3] px-2 rounded" style={{paddingBottom:20}}>single Google Sheet</span>
          </h1>
          <div className="flex justify-center flex-col mx-4 items-center gap-6 mt-10">
            <SheetzuSignupInline />
          </div>
        </div>
      </section>
    </main>
  )
}
