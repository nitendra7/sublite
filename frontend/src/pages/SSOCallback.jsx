import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser as useClerkUser } from '@clerk/clerk-react';
import { useUser } from '../context/UserContext';
import api from '../utils/api';

export default function SSOCallback() {
    const navigate = useNavigate();
    const { isSignedIn, isLoaded } = useAuth();
    const { user: clerkUser } = useClerkUser();
    const { rehydrateUserContext } = useUser();

    useEffect(() => {
        const syncAndRedirect = async () => {
            // Wait for Clerk to fully load
            if (!isLoaded) {
                return;
            }

            if (isSignedIn && clerkUser) {
                try {
                    const response = await api.post('/auth/clerk-sync', {
                        clerkUserId: clerkUser.id,
                        email: clerkUser.emailAddresses[0]?.emailAddress,
                        name: clerkUser.fullName || clerkUser.firstName || 'User',
                        profileImage: clerkUser.imageUrl
                    });

                    if (response.data.token) {
                        localStorage.setItem('token', response.data.token);
                        localStorage.setItem('userId', response.data.user.id);
                        localStorage.setItem('userName', response.data.user.name);

                        rehydrateUserContext(response.data.user, false);

                        navigate('/dashboard', { replace: true });
                    }
                } catch (error) {
                    console.error('❌ Failed to sync with backend:', error);
                    console.error('Error details:', error.response?.data);
                    alert('Failed to complete sign-in: ' + (error.response?.data?.message || error.message));
                    navigate('/login', { replace: true });
                }
            } else if (isLoaded && !isSignedIn) {
                navigate('/login', { replace: true });
            }
        };

        syncAndRedirect();
    }, [isLoaded, isSignedIn, clerkUser, navigate, rehydrateUserContext]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bb6c4] mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Completing sign-in...</p>
            </div>
        </div>
    );
}