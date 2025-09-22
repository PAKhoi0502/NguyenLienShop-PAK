// clear_auth_cache.js
// Script để dọn dẹp cache và storage khi có vấn đề authentication loop

console.log('🧹 Clearing authentication cache and storage...');

// Clear localStorage
const localStorageKeys = ['token', 'roleId', 'lastRefreshAttempt', 'refreshFailureCount'];
localStorageKeys.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Removed localStorage key: ${key}`);
    }
});

// Clear sessionStorage
const sessionStorageKeys = ['authToken', 'userInfo', 'tempToken'];
sessionStorageKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log(`✅ Removed sessionStorage key: ${key}`);
    }
});

// Clear all localStorage and sessionStorage to be safe
localStorage.clear();
sessionStorage.clear();

console.log('✅ All storage cleared');

// Instructions for manual cookie clearing
console.log(`
🍪 To clear cookies manually:
1. Press F12 to open DevTools
2. Go to Application tab
3. Click on "Cookies" in the left sidebar
4. Select your domain (localhost:3000)
5. Delete all cookies, especially:
   - authToken
   - refreshToken
   - Any authentication related cookies

🔄 After clearing:
1. Close all browser tabs for this app
2. Restart the development server
3. Open the app in a new browser tab or incognito mode

⚠️ If the problem persists, check browser extensions!
`);

// Try to clear some common cookie names if possible (limited by CORS)
try {
    document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    console.log('✅ Attempted to clear cookies via JavaScript');
} catch (error) {
    console.log('⚠️ Cannot clear httpOnly cookies via JavaScript - manual clearing required');
}