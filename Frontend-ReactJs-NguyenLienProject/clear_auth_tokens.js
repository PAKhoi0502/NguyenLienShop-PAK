// Emergency script to clear ALL authentication data
console.log('🧹 Clearing ALL authentication data...');

// Clear localStorage
localStorage.removeItem('token');
localStorage.removeItem('roleId');
localStorage.removeItem('persist:root');
localStorage.removeItem('persist:admin');
localStorage.removeItem('lastLoginTime');
localStorage.removeItem('rememberMe');
localStorage.removeItem('savedIdentifier');

// Clear sessionStorage
sessionStorage.clear();

// Clear cookies manually (since HttpOnly cookies can't be cleared by JS)
// This will only clear non-HttpOnly cookies
document.cookie.split(";").forEach(function (c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

console.log('✅ localStorage and sessionStorage cleared!');
console.log('⚠️ Please also manually clear cookies in DevTools:');
console.log('   1. Open DevTools > Application');
console.log('   2. Go to Cookies > http://localhost:3000');
console.log('   3. Delete authToken and refreshToken cookies');
console.log('🔄 Then refresh the page to test.');