// src/axios.js
import axios from 'axios';
import { shouldRefreshToken, handleTokenRefreshAndRetry } from './services/refreshTokenService';

const instance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    withCredentials: true,
});

const createError = (httpStatusCode, statusCode, errorMessage, problems, errorCode = '') => {
    const error = new Error();
    error.httpStatusCode = httpStatusCode;
    error.statusCode = statusCode;
    error.errorMessage = errorMessage;
    error.problems = problems;
    error.errorCode = String(errorCode);
    return error;
};

export const isSuccessStatusCode = (s) => {
    return (typeof s === 'number' && s === 0) || (typeof s === 'string' && s.toUpperCase() === 'OK');
};

instance.interceptors.request.use(
    (config) => {
        // 🍪 HttpOnly cookies are automatically sent by browser
        // No need to manually add Authorization header from localStorage
        // Token will be available in req.cookies.authToken on server

        // � SECURITY: Disable localStorage token completely for security
        // const token = localStorage.getItem('token');
        // if (token) {
        //     console.log('⚠️ Using localStorage token (transitional)');
        //     config.headers['Authorization'] = `Bearer ${token}`;
        // }

        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => {
        const { data } = response;
        // Xử lý response từ backend
        if (data.errCode !== undefined && data.errCode !== 0) {
            return Promise.reject(createError(response.status, data.errCode, data.errMessage, null, data.errCode));
        }
        return data; // Trả về toàn bộ data nếu thành công
    },
    async (error) => {
        const { response, config } = error;

        if (!response) return Promise.reject(error);

        // 🔄 Auto-refresh token logic
        if (shouldRefreshToken(error)) {
            console.log('🔄 Access token expired, attempting refresh...');

            try {
                // Store refresh attempt for debugging
                localStorage.setItem('lastRefreshAttempt', new Date().toISOString());

                return await handleTokenRefreshAndRetry(config);
            } catch (refreshError) {
                console.error('❌ Token refresh failed:', refreshError);

                // Track failure count
                const failureCount = parseInt(localStorage.getItem('refreshFailureCount') || '0') + 1;
                localStorage.setItem('refreshFailureCount', failureCount.toString());

                return Promise.reject(refreshError);
            }
        }

        // 🔧 Handle other errors
        const { data } = response;
        if (data?.errCode && data?.errMessage) {
            error.errorMessage = data.errMessage;
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default instance;