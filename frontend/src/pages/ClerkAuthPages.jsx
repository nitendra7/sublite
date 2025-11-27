import { useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { 
  SignIn, 
  SignUp, 
  useAuth,
  useUser as useClerkUser
} from "@clerk/clerk-react";

import { useUser } from "../context/UserContext";

ClerkAuthPage.propTypes = {
  isLogin: PropTypes.bool,
};

ClerkAuthPage.defaultProps = {
  isLogin: true,
};

export default function ClerkAuthPage({ isLogin = true }) {
  const navigate = useNavigate();
  const { rehydrateUserContext } = useUser();
  const { isSignedIn } = useAuth();
  const { user: clerkUser } = useClerkUser();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      // Sync with your backend and redirect
      rehydrateUserContext();
      navigate('/dashboard');
    }
  }, [isSignedIn, clerkUser, navigate, rehydrateUserContext]);

  // Clerk appearance customization to match your design
  const clerkAppearance = {
    layout: {
      logoImageUrl: "/logos/logo.png",
      showOptionalFields: false,
    },
    elements: {
      formButtonPrimary: 
        "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2",
      card: "shadow-xl border-0 bg-white dark:bg-gray-800 rounded-lg",
      headerTitle: "text-2xl font-bold text-gray-900 dark:text-white mb-2",
      headerSubtitle: "text-gray-600 dark:text-gray-400 mb-6",
      socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 rounded-lg mb-2",
      dividerLine: "bg-gray-200 dark:bg-gray-600",
      formFieldInput: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
      footerActionLink: "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
      formFieldLabel: "block mb-2 text-sm font-medium text-gray-900 dark:text-white",
      identityPreviewText: "text-gray-600 dark:text-gray-400",
      formResendCodeLink: "text-blue-600 hover:text-blue-800 dark:text-blue-400",
    },
    variables: {
      colorPrimary: "#3b82f6",
      colorBackground: "#ffffff",
      colorInputBackground: "#f9fafb",
      colorInputText: "#111827",
      fontFamily: '"Inter", sans-serif',
      borderRadius: "0.5rem",
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img
                className="h-8 w-auto"
                src="/logos/logo.png"
                alt="Sublite"
                onError={(e) => {
                  e.target.src = "https://placehold.co/48x48/2bb6c4/ffffff?text=SL";
                }}
              />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                Sublite
              </span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/help')}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Help
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 flex min-h-screen">
        {/* Left side - Image/Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
            <div className="max-w-md text-center">
              <h1 className="text-4xl font-bold mb-6">
                Welcome to Sublite
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Share subscriptions securely and save money on your favorite services
              </p>
              <div className="grid grid-cols-4 gap-4 opacity-80">
                {/* Service Icons */}
                <div className="bg-white bg-opacity-20 rounded-lg p-3 flex justify-center items-center">
                  <img src="/icons/netflix.svg" alt="Netflix" className="w-8 h-8" />
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 flex justify-center items-center">
                  <img src="/icons/spotify.svg" alt="Spotify" className="w-8 h-8" />
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 flex justify-center items-center">
                  <img src="/icons/adobe.svg" alt="Adobe" className="w-8 h-8" />
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 flex justify-center items-center">
                  <img src="/icons/primevideo.svg" alt="Prime Video" className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Toggle buttons for mobile */}
            <div className="mb-6 lg:hidden">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => window.location.href = '/login'}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    isLogin 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => window.location.href = '/register'}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    !isLogin 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Clerk Auth Components */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-1">
              {isLogin ? (
                <SignIn 
                  appearance={clerkAppearance}
                  redirectUrl="/dashboard"
                  signUpUrl="/register"
                  routing="path"
                  path="/login"
                />
              ) : (
                <SignUp 
                  appearance={clerkAppearance}
                  redirectUrl="/dashboard"
                  signInUrl="/login"
                  routing="path"
                  path="/register"
                />
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}