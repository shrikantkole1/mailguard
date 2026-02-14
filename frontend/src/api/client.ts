import axios from 'axios';

// Create Axios Instance
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    withCredentials: true, // IMPORTANT: Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response Interceptor for Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized (e.g., redirect to login or clear session)
            console.warn('Unauthorized access. Session may have expired.');
        }
        return Promise.reject(error);
    }
);
