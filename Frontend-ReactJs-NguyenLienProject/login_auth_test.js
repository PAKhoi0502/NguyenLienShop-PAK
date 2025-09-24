// Login Authentication Test Script
// Run this in browser console to test the fixed authentication flow

console.log('🧪 Starting Login Authentication Test...');

// Test configuration
const testCredentials = {
    identifier: '0979502093', // Use your test phone number
    password: 'yourpassword' // Use your test password
};

// Monitor function to track auth state changes
let authStateHistory = [];
let originalConsoleLog = console.log;

// Enhanced logging to capture auth flow
console.log = function (...args) {
    const message = args.join(' ');

    // Capture useAuth logs
    if (message.includes('🔧 useAuth:')) {
        authStateHistory.push({
            timestamp: new Date().toISOString(),
            message: message,
            type: 'useAuth'
        });
    }

    // Capture login flow logs  
    if (message.includes('🔧 Login') || message.includes('Login API')) {
        authStateHistory.push({
            timestamp: new Date().toISOString(),
            message: message,
            type: 'login'
        });
    }

    return originalConsoleLog.apply(console, arguments);
};

// Function to test login flow
window.testLoginFlow = async () => {
    console.log('🚀 Testing login flow with authentication fixes...');

    // Clear history
    authStateHistory = [];

    // Wait a bit and then analyze the auth state changes
    setTimeout(() => {
        console.log('\n📊 AUTH FLOW ANALYSIS:');
        console.log('='.repeat(50));

        // Group by type
        const useAuthLogs = authStateHistory.filter(entry => entry.type === 'useAuth');
        const loginLogs = authStateHistory.filter(entry => entry.type === 'login');

        console.log(`\n🔧 useAuth Hook Activity (${useAuthLogs.length} events):`);
        useAuthLogs.slice(-10).forEach(entry => { // Show last 10
            console.log(`  ${entry.timestamp.split('T')[1].split('.')[0]} - ${entry.message}`);
        });

        console.log(`\n🔐 Login Flow Activity (${loginLogs.length} events):`);
        loginLogs.forEach(entry => {
            console.log(`  ${entry.timestamp.split('T')[1].split('.')[0]} - ${entry.message}`);
        });

        // Check for infinite loop indicators
        const recentUseAuthLogs = useAuthLogs.filter(entry => {
            const timestamp = new Date(entry.timestamp);
            const now = new Date();
            return (now - timestamp) < 5000; // Last 5 seconds
        });

        if (recentUseAuthLogs.length > 10) {
            console.log('\n⚠️  POTENTIAL ISSUE: High frequency of useAuth calls detected');
            console.log(`   ${recentUseAuthLogs.length} calls in last 5 seconds`);
        } else {
            console.log('\n✅ AUTH FREQUENCY: Normal - no infinite loop detected');
        }

        // Check final auth state
        console.log('\n🎯 FINAL AUTH STATE CHECK:');
        console.log('   Use F12 → Application → Cookies to verify cookies are set');
        console.log('   Check Redux DevTools for current auth state');
        console.log('   Look for "🔧 useAuth: Using server auth (cookies valid)" in recent logs');

    }, 8000); // Wait 8 seconds to capture full auth flow

    console.log('⏱️  Monitoring authentication flow for 8 seconds...');
    console.log('📝 Login manually or the script will capture the auth state changes');
};

// Function to check current auth state
window.checkAuthState = () => {
    console.log('\n🔍 CURRENT AUTH STATE:');
    console.log('='.repeat(30));

    // Check cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {});

    console.log('🍪 Cookies:', {
        authToken: cookies.authToken ? 'Present' : 'Missing',
        refreshToken: cookies.refreshToken ? 'Present' : 'Missing'
    });

    // Check localStorage  
    const hasToken = localStorage.getItem('token');
    const hasRoleId = localStorage.getItem('roleId');
    console.log('💾 LocalStorage:', {
        token: hasToken ? 'Present (should be cleared)' : 'Cleared ✅',
        roleId: hasRoleId ? 'Present (should be cleared)' : 'Cleared ✅'
    });

    // Try to access Redux state if available
    try {
        if (window.__REDUX_DEVTOOLS_EXTENSION__) {
            console.log('📊 Redux DevTools available - check the store manually');
        }
    } catch (e) {
        console.log('📊 Redux state not accessible from console');
    }
};

// Auto-run initial check
window.checkAuthState();

console.log(`
🧪 LOGIN AUTHENTICATION TEST READY

Available functions:
• testLoginFlow() - Monitor auth flow during login
• checkAuthState() - Check current authentication state

Instructions:
1. Run testLoginFlow() 
2. Login manually within 8 seconds
3. Review the analysis output
4. Check that cookies are set properly
5. Verify no infinite loops occur

Current page: ${window.location.pathname}
`);

// Auto-start monitoring if we're on login page
if (window.location.pathname === '/login') {
    console.log('🎯 Detected login page - starting automatic monitoring...');
    window.testLoginFlow();
}