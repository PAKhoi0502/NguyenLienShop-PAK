// src/axios.js
import axios from 'axios';

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
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
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
    (error) => {
        const { response } = error;
        if (!response) return Promise.reject(error);

        const { data } = response;
        if (data?.errCode && data?.errMessage) {
            error.errorMessage = data.errMessage;
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default instance;