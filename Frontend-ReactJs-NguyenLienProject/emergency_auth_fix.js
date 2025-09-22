// Emergency fix for authentication loop issue
// Run this in browser console to clear all auth-related data

console.log('🚨 EMERGENCY AUTH FIX - Clearing all authentication data...');

// 1. Clear localStorage completely
console.log('📦 Clearing localStorage...');
const localStorageKeys = Object.keys(localStorage);
localStorageKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
});

// 2. Clear sessionStorage completely  
console.log('📦 Clearing sessionStorage...');
const sessionStorageKeys = Object.keys(sessionStorage);
sessionStorageKeys.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
});

// 3. Clear all possible cookies
console.log('🍪 Clearing cookies...');
document.cookie.split(";").forEach(function (c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=localhost");
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// 4. Clear any global auth flags
console.log('🚩 Clearing global flags...');
if (window.isRedirectingToLogin) {
    delete window.isRedirectingToLogin;
    console.log('✅ Cleared isRedirectingToLogin flag');
}

// 5. Clear service worker if exists
console.log('🔧 Checking service worker...');
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
            registration.unregister();
            console.log('✅ Unregistered service worker');
        }
    });
}

console.log(`
✅ EMERGENCY FIX COMPLETED

🔄 Next steps:
1. Close ALL browser tabs for this application
2. Stop the development server (Ctrl+C)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Disable or remove browser extensions temporarily
5. Restart the development server
6. Open the app in a new incognito/private window

🎯 If problem persists:
- Check if backend server is running on port 8080
- Verify backend auth endpoints are working
- Try different browser
- Check for browser extensions interfering with the app

🛠️ Browser extension detected in logs:
chrome-extension://majdfhpaihoncoakbjgbdhglocklcgno
Consider disabling this extension temporarily.
`);

// Try to stop any active refresh attempts
setTimeout(() => {
    window.location.href = 'about:blank';
    console.log('🛑 Redirected to blank page to stop loops');
}, 2000);