import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/clerk-react';

// Example authentication header component
export function AuthHeader() {
  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Sublite
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <SignedOut>
          <div className="flex items-center space-x-2">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
        </SignedIn>
      </div>
    </header>
  );
}

// Simple auth gate component
export function AuthGate({ children, fallback = null }) {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        {fallback || (
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Sublite
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please sign in to access your dashboard
              </p>
              <div className="flex items-center justify-center space-x-4">
                <SignInButton mode="modal">
                  <button className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-6 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>
        )}
      </SignedOut>
    </>
  );
}
