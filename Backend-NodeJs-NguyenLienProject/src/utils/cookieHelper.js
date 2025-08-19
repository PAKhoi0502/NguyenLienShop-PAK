// src/utils/cookieHelper.js
// Centralized cookie management utilities

/**
 * 🍪 Standard cookie options for auth tokens
 */
const getBaseCookieOptions = () => ({
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'lax',
   path: '/'
});

/**
 * 🍪 Set access token cookie with appropriate expiration
 */
const setAccessTokenCookie = (res, token, rememberMe = false) => {
   const maxAge = rememberMe ? 2 * 60 * 60 * 1000 : 30 * 60 * 1000; // 2h or 30min
   
   res.cookie('authToken', token, {
      ...getBaseCookieOptions(),
      maxAge
   });

   console.log(`🍪 Access token cookie set: ${rememberMe ? '2h' : '30min'} expiry`);
};

/**
 * 🍪 Set refresh token cookie (always 30 days)
 */
const setRefreshTokenCookie = (res, token) => {
   const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

   res.cookie('refreshToken', token, {
      ...getBaseCookieOptions(),
      maxAge
   });

   console.log('🍪 Refresh token cookie set: 30 days expiry');
};

/**
 * 🍪 Set both auth cookies at once
 */
const setAuthCookies = (res, { accessToken, refreshToken }, rememberMe = false) => {
   setAccessTokenCookie(res, accessToken, rememberMe);
   setRefreshTokenCookie(res, refreshToken);
};

/**
 * 🧹 Clear access token cookie
 */
const clearAccessTokenCookie = (res) => {
   res.clearCookie('authToken', {
      ...getBaseCookieOptions()
   });
   console.log('🧹 Access token cookie cleared');
};

/**
 * 🧹 Clear refresh token cookie
 */
const clearRefreshTokenCookie = (res) => {
   res.clearCookie('refreshToken', {
      ...getBaseCookieOptions()
   });
   console.log('🧹 Refresh token cookie cleared');
};

/**
 * 🧹 Clear both auth cookies
 */
const clearAuthCookies = (res) => {
   clearAccessTokenCookie(res);
   clearRefreshTokenCookie(res);
};

/**
 * 📊 Get cookie expiration info for response
 */
const getTokenExpirationInfo = (rememberMe = false) => {
   const accessTokenExpiry = rememberMe ? '2h' : '30m';
   const accessTokenSeconds = rememberMe ? 7200 : 1800;
   
   return {
      accessTokenExpiry,
      accessTokenSeconds,
      refreshTokenExpiry: '30d',
      refreshTokenSeconds: 30 * 24 * 60 * 60
   };
};

const cookieHelper = {
   getBaseCookieOptions,
   setAccessTokenCookie,
   setRefreshTokenCookie,
   setAuthCookies,
   clearAccessTokenCookie,
   clearRefreshTokenCookie,
   clearAuthCookies,
   getTokenExpirationInfo
};

export default cookieHelper;
