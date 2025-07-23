// AuthPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function AuthPage({
  pageTitle,
  pageSubtitle,
  activeTab,
  children,
  error,
  loading,
  onGoogleClick,
  onEmailPasswordSubmit, // New prop for email/password form submission
  handleFacebookLogin,
  handleAppleLogin,
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <img
            src="/logo.jpg"
            alt="Sublite Logo"
            className="w-12 h-12 rounded-full"
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/48x48/2bb6c4/ffffff?text=SL'; }}
          />
          <span className="text-2xl font-extrabold text-[#2bb6c4] tracking-tight">Sublite</span>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">{pageTitle}</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">{pageSubtitle}</p>

        <div className="flex mb-5 rounded-xl overflow-hidden border border-gray-200">
          <Link
            to="/login"
            className={`flex-1 py-2 font-semibold text-center transition-colors duration-200 ${
              activeTab === 'signin' ? 'bg-[#2bb6c4] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className={`flex-1 py-2 font-semibold text-center transition-colors duration-200 ${
              activeTab === 'signup' ? 'bg-[#2bb6c4] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Signup
          </Link>
        </div>

        {/* This is where the specific Login or Signup form will be rendered */}
        {/* Pass onEmailPasswordSubmit to the form's onSubmit if needed */}
        {React.Children.map(children, child =>
            React.cloneElement(child, { onSubmit: onEmailPasswordSubmit || child.props.onSubmit })
        )}

        <div className="my-5 flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">Or Continue With</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex gap-4 justify-center mb-4">
          <button
            onClick={onGoogleClick}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <img src="/google.svg" alt="Google" className="w-5 h-5" />
          </button>

          <button onClick={handleFacebookLogin} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
            <img src="/fb.svg" alt="Facebook" className="w-5 h-5" />
          </button>
          <button onClick={handleAppleLogin} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
            <img src="/apple.svg" alt="Apple" className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg mt-4">{error}</div>}

        {activeTab === 'signup' && (
          <div className="text-center text-gray-400 text-xs mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2bb6c4] hover:underline font-semibold">Sign In</Link>
          </div>
        )}
        {activeTab === 'signin' && (
          <div className="text-center text-gray-400 text-xs mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#2bb6c4] hover:underline font-semibold">Sign Up</Link>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out both;
          }
        `}
      </style>
    </div>
  );
}

export default AuthPage;