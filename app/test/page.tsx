export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🎉 AgentBay Test Page</h1>
        <p className="text-xl mb-8">If you can see this, the app is working!</p>
        <div className="space-y-4">
          <a href="/auth/login" className="block text-blue-400 hover:underline">
            → Go to Login Page
          </a>
          <a href="/dashboard" className="block text-blue-400 hover:underline">
            → Go to Dashboard (will redirect to login)
          </a>
        </div>
      </div>
    </div>
  )
}
