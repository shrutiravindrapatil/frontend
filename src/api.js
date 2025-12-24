import axios from 'axios';

const api = axios.create({
    baseURL: 'https://no-code-ml-builder-2.onrender.com/api', // Local development - change to production URL when deploying
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        let message = 'Something went wrong with the connection!';

        if (error.response) {
            // Server returned an error (4xx, 5xx)
            message = error.response.data?.detail || `Magic Spell Failed! 🪄 (${error.response.status})`;
        } else if (error.request) {
            // Request was made but no response (Network error)
            message = 'The Magic Server is taking a nap! 😴 Please start the backend.';
        }

        // Trigger global notification
        const event = new CustomEvent('app-notify', {
            detail: { message, type: 'error' }
        });
        window.dispatchEvent(event);

        return Promise.reject(error);
    }
);

export default api;
