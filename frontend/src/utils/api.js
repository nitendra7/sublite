// API utility with automatic token refresh
export const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://sublite-wmu2.onrender.com';

// Function to get fresh token using refresh token
const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch(`${API_BASE}/api/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        
        // Update tokens in localStorage
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        return data.accessToken;
    } catch (error) {
        // Clear all auth data if refresh fails
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        
        // Redirect to login
        window.location.href = '/login';
        throw error;
    }
};

// Enhanced fetch function with automatic token refresh
export const apiFetch = async (url, options = {}) => {
    let token = localStorage.getItem('token');
    
    // Add authorization header if token exists
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const requestOptions = {
        ...options,
        headers,
    };

    try {
        let response = await fetch(url, requestOptions);

        // If request fails with 401/403 (token expired), try to refresh token
        if ((response.status === 401 || response.status === 403) && token) {
            console.log('Token expired, attempting to refresh...');
            
            try {
                // Get new token
                const newToken = await refreshAccessToken();
                
                // Retry the original request with new token
                requestOptions.headers['Authorization'] = `Bearer ${newToken}`;
                response = await fetch(url, requestOptions);
                
                console.log('Token refreshed successfully, request retried');
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                throw refreshError;
            }
        }

        return response;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    return !!(token || refreshToken);
};

// Helper function to logout user
export const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken })
            });
        } catch (error) {
            console.error('Logout API call failed:', error);
        }
    }
    
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    
    // Redirect to login
    window.location.href = '/login';
};

export default apiFetch;
