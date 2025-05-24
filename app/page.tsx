import { headers } from 'next/headers'
import UserWebsite from '@/components/UserWebsite'
import SheetzuSignupInline from '@/components/SheetzuSignupInline'

export default async function Home() {
  const headersList = headers()
  const sheetId = (await headersList).get('x-sheet-id')
  const username = (await headersList).get('x-username')
  const isPaid = (await headersList).get('x-is-paid') === 'true'

  // If we have a sheetId, this is a subdomain request
  if (sheetId && username) {
    return <UserWebsite 
      sheetId={sheetId} 
      isPaid={isPaid} 
      username={username} 
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
