import axios from 'axios';
import _ from 'lodash';

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

instance.interceptors.response.use(
    (response) => {
        const { data } = response;

        if (data.hasOwnProperty('s') && !isSuccessStatusCode(data.s) && data.hasOwnProperty('errmsg')) {
            return Promise.reject(createError(response.status, data.s, data.errmsg, null, data.errcode || ""));
        }

        if (data.hasOwnProperty('s') && data.hasOwnProperty('d')) return data.d;
        if (data.hasOwnProperty('s') && _.keys(data).length === 1) return null;

        return data;
    },
    (error) => {
        const { response } = error;
        if (!response) return Promise.reject(error);

        const { data } = response;

        if (data?.s && data?.errmsg) {
            error.errorMessage = data.errmsg;
            return Promise.reject(error);
        }

        if (data?.code && data?.message) {
            error.errorMessage = data.message;
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }

);

export default instance;
