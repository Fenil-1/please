export default function UserNotFound({
  username,
  error = false,
}: {
  username: string
  error?: boolean
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">{error ? "Something went wrong" : `User "${username}" not found`}</h1>
        <p className="text-lg mb-6">
          {error
            ? "We encountered an error while trying to load this page. This might be due to an issue with our data source or configuration."
            : "The username you are looking for does not exist in our database or may have been removed."}
        </p>
        <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  )
}
