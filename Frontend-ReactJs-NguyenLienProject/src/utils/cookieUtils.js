// Cookie utility for client-side cookie management
// src/utils/cookieUtils.js

/**
 * 🍪 Clear a specific cookie by name
 * @param {string} name - Cookie name
 * @param {string} path - Cookie path (default: '/')
 * @param {string} domain - Cookie domain (optional)
 */
export const clearCookie = (name, path = '/', domain = null) => {

    // Multiple approaches to ensure cookie clearing
    const expiredDate = 'Thu, 01 Jan 1970 00:00:00 UTC';

    // Approach 1: Clear with path and SameSite
    let cookieString = `${name}=; expires=${expiredDate}; path=${path}; SameSite=Lax`;
    if (domain) cookieString += `; domain=${domain}`;
    document.cookie = cookieString;

    // Approach 2: Clear with path only
    cookieString = `${name}=; expires=${expiredDate}; path=${path}`;
    if (domain) cookieString += `; domain=${domain}`;
    document.cookie = cookieString;

    // Approach 3: Clear with minimal options
    document.cookie = `${name}=; expires=${expiredDate}; path=/`;

    // Approach 4: Clear with root path
    document.cookie = `${name}=; expires=${expiredDate}; path=`;

};

/**
 * 🧹 Clear all authentication cookies
 */
export const clearAuthCookies = () => {

    const authCookieNames = ['authToken', 'refreshToken', 'authFlag']; // ✅ Include authFlag

    authCookieNames.forEach(cookieName => {
        clearCookie(cookieName);

        // Also try clearing with different domains
        const currentDomain = window.location.hostname;
        if (currentDomain !== 'localhost') {
            clearCookie(cookieName, '/', currentDomain);
            clearCookie(cookieName, '/', '.' + currentDomain);
        }
    });

};/**
 * 🔍 Get cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

/**
 * 📊 Debug: List all cookies
 */
export const debugCookies = () => {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    cookies.forEach(cookie => {
        if (cookie) {
        }
    });

    // Check specific auth cookies
    const authToken = getCookie('authToken');
    const refreshToken = getCookie('refreshToken');


    return {
        allCookies: cookies,
        authToken: authToken,
        refreshToken: refreshToken
    };
};

const cookieUtils = {
    clearCookie,
    clearAuthCookies,
    getCookie,
    debugCookies
};

export default cookieUtils;