// Login Page Fix Script
// Chạy script này trong console nếu vẫn thấy lỗi ở trang login

console.log('🔧 LOGIN PAGE FIX - Clearing auth loops on login page...');

// 1. Stop any ongoing auth checks
if (window.isCheckingAuth) {
    window.isCheckingAuth = false;
    console.log('✅ Stopped auth checking flag');
}

// 2. Clear redirect flag  
if (window.isRedirectingToLogin) {
    delete window.isRedirectingToLogin;
    console.log('✅ Cleared redirect flag');
}

// 3. Clear auth cache if accessible
try {
    // Try to clear auth cache via global function
    if (window.clearAuthCache && typeof window.clearAuthCache === 'function') {
        window.clearAuthCache();
        console.log('✅ Cleared auth cache via global function');
    }
} catch (error) {
    console.log('⚠️ Could not clear auth cache:', error.message);
}

// 4. Clear localStorage and sessionStorage again
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cleared all storage');

// 5. Clear any remaining cookies
document.cookie.split(";").forEach(function (c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
console.log('✅ Cleared cookies');

// 6. Check current page and recommend action
if (window.location.pathname === '/login') {
    console.log(`
🎯 ALREADY ON LOGIN PAGE - No further action needed
The auth system should now work normally.

✅ If login form appears, you can proceed to login
✅ Auth checks are now disabled on login page
✅ No more token refresh attempts on login page

🔄 If you still see errors, try:
1. Hard refresh (Ctrl+Shift+R)
2. Close tab and open new one
3. Clear browser cache completely
    `);
} else {
    console.log(`
🔄 NOT ON LOGIN PAGE CURRENTLY
Current page: ${window.location.pathname}

Redirecting to login page in 2 seconds...
    `);

    setTimeout(() => {
        window.location.href = '/login';
    }, 2000);
}

// 7. Set flag to prevent future auth loops
window.authLoopFixed = true;
console.log('🏁 Login page fix completed!');