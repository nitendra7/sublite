// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Helper function to exchange Google OAuth token for Firebase ID token
export const exchangeGoogleTokenForFirebaseToken = async (googleAccessToken) => {
  try {
    // Create Google credential from access token
    const credential = GoogleAuthProvider.credential(null, googleAccessToken);
    
    // Sign in with credential to get Firebase user
    const result = await signInWithCredential(auth, credential);
    
    // Get Firebase ID token
    const idToken = await result.user.getIdToken();
    
    return {
      idToken,
      user: result.user
    };
  } catch (error) {
    console.error('Error exchanging Google token for Firebase token:', error);
    throw error;
  }
};

export default app;
