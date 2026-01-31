export default function AdminTestSimple() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Routing Test</h2>
          <p className="text-green-600 font-medium">✅ Admin dashboard routing is working!</p>
          <p className="text-gray-600 mt-2">
            If you can see this page, the authentication and routing system is functioning correctly.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current URL</h2>
          <p className="font-mono text-sm bg-gray-100 p-2 rounded">
            {typeof window !== 'undefined' ? window.location.href : 'Server rendering'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Navigation Links</h2>
          <div className="space-y-2">
            <a href="/admin/dashboard" className="block text-blue-600 hover:underline">
              → Go to Main Dashboard
            </a>
            <a href="/admin/login" className="block text-blue-600 hover:underline">
              → Return to Login
            </a>
            <a href="/" className="block text-blue-600 hover:underline">
              → Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}