export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Clenergize V3
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Enterprise ESG Management Platform
        </p>
        <div className="flex gap-4 justify-center">
          <div className="px-4 py-2 bg-green-100 rounded-lg">
            <span className="text-green-800 font-medium">Environmental</span>
          </div>
          <div className="px-4 py-2 bg-blue-100 rounded-lg">
            <span className="text-blue-800 font-medium">Social</span>
          </div>
          <div className="px-4 py-2 bg-purple-100 rounded-lg">
            <span className="text-purple-800 font-medium">Governance</span>
          </div>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          Development Environment - Sprint 0.1
        </p>
      </div>
    </main>
  )
}
