import { getUserData } from '@/lib/tenant'
import UserWebsite from '@/components/UserWebsite'
import UserNotFound from '@/components/UserNotFound'

interface PageProps {
  params: {
    username: string
  }
}

export default async function UserPage({ params }: PageProps) {
  try {
    const userData = await getUserData(params.username)
    if (!userData) {
      return <UserNotFound username={params.username} />
    }
    return <UserWebsite sheetId={userData.sheetId} isPaid={userData.isPaid} username={params.username} />
  } catch (error) {
    console.error('Error loading user data:', error)
    return <UserNotFound username={params.username} />
  }
}
