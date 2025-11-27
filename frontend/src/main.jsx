import { UserProvider } from "./context/UserContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import TokenBridge from './clerk/TokenBridge.jsx';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={clerkPubKey}
      afterSignOutUrl="/"
      fallbackRedirectUrl="/dashboard"
    >
      <ThemeProvider>
        <UserProvider>
          <TokenBridge />
          <App />
        </UserProvider>
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>,
);
