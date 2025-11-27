import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setExternalTokenGetter } from '../utils/api';

export default function TokenBridge() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    // Register a getter that returns a fresh Clerk token
    setExternalTokenGetter(async () => {
      try {
        const t = await getToken();
        return t || null;
      } catch {
        return null;
      }
    });
  }, [getToken]);

  // no UI
  return null;
}
