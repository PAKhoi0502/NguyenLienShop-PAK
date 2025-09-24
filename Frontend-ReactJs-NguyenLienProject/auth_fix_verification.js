// Emergency auth fix verification script
// Run this in browser console to check if infinite loop is fixed

console.log('🔧 Auth Fix Verification Script');
console.log('Monitoring useAuth state changes...');

// Monitor Redux store changes
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log('✅ Redux DevTools available - monitoring state');
}

// Check for rapid successive console logs (sign of infinite loop)
let lastLogTime = 0;
let logCount = 0;
let rapidLogWarningShown = false;

const originalLog = console.log;
console.log = function (...args) {
    const now = Date.now();

    // Check if this is a useAuth log
    if (args[0] && args[0].toString().includes('useAuth:')) {
        logCount++;

        // If more than 10 useAuth logs in 2 seconds, warn about potential loop
        if (now - lastLogTime < 2000) {
            if (logCount > 10 && !rapidLogWarningShown) {
                originalLog.warn('🚨 POTENTIAL INFINITE LOOP: Too many useAuth logs in short time');
                originalLog.warn('Log count:', logCount, 'in', now - lastLogTime, 'ms');
                rapidLogWarningShown = true;
            }
        } else {
            // Reset counter after 2 seconds
            logCount = 1;
            lastLogTime = now;
            rapidLogWarningShown = false;
        }
    }

    originalLog.apply(console, arguments);
};

// Monitor for error boundary crashes
window.addEventListener('error', (event) => {
    if (event.message.includes('Maximum update depth exceeded')) {
        console.error('🚨 INFINITE LOOP DETECTED: Maximum update depth exceeded');
        console.error('The authentication fix may not be working properly');
    }
});

console.log('🔧 Verification script loaded. Watch for warnings above.');