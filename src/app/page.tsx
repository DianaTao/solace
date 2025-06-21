import LoginForm from '@/components/auth/LoginForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <LoginForm />
        
        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            SOLACE - Social Work Operations and Link-up Assistant for Collaborative Excellence
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Empowering social workers in the San Francisco Bay Area
          </p>
        </div>
      </div>
    </div>
  );
}
