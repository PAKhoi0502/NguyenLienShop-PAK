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
   const baseOptions = getBaseCookieOptions();

   const authTokenOptions = {
      ...baseOptions,
      maxAge
   };
   
   const authFlagOptions = {
      ...baseOptions,
      httpOnly: false, // ✅ Client can read this
      maxAge
   };

   // 🔒 Set HttpOnly cookie for security (server-side only)
   res.cookie('authToken', token, authTokenOptions);

   // 🏃 Set readable flag cookie for client-side auth checks
   res.cookie('authFlag', 'authenticated', authFlagOptions);

   console.log(`🍪 Access token cookies set with options:`, {
      authToken: authTokenOptions,
      authFlag: authFlagOptions,
      expiry: rememberMe ? '2h' : '30min'
   });
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
   const baseOptions = getBaseCookieOptions();
   
   const authTokenClearOptions = {
      ...baseOptions
   };

   // Clear authFlag (readable) with correct options match
   const authFlagClearOptions = {
      ...baseOptions,
      httpOnly: false // ✅ Must match original httpOnly setting
   };

   console.log(`🧹 Clearing cookies with options:`, {
      authToken: authTokenClearOptions,
      authFlag: authFlagClearOptions
   });

   // ✅ Method 1: Use clearCookie with exact options
   res.clearCookie('authToken', authTokenClearOptions);
   res.clearCookie('authFlag', authFlagClearOptions);

   // ✅ Method 2: Set expired cookies with past date and maxAge 0
   const pastDate = new Date(0); // January 1, 1970
   
   res.cookie('authToken', '', {
      ...authTokenClearOptions,
      expires: pastDate,
      maxAge: 0
   });

   res.cookie('authFlag', '', {
      ...authFlagClearOptions,
      expires: pastDate,
      maxAge: 0
   });

   // ✅ Method 3: Try minimal clearing (fallback)
   res.clearCookie('authToken');
   res.clearCookie('authFlag');

   console.log('🧹 Access token cookies cleared with multiple methods (clearCookie + expired + minimal)');
};

/**
 * 🧹 Clear refresh token cookie
 */
const clearRefreshTokenCookie = (res) => {
   const clearOptions = {
      ...getBaseCookieOptions()
   };

   console.log(`🧹 Clearing refreshToken with options:`, clearOptions);

   // ✅ Method 1: Use clearCookie with exact options
   res.clearCookie('refreshToken', clearOptions);

   // ✅ Method 2: Set expired cookie with past date and maxAge 0
   const pastDate = new Date(0); // January 1, 1970
   
   res.cookie('refreshToken', '', {
      ...clearOptions,
      expires: pastDate,
      maxAge: 0
   });

   // ✅ Method 3: Try minimal clearing (fallback)
   res.clearCookie('refreshToken');

   console.log('🧹 Refresh token cookie cleared with multiple methods');
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
