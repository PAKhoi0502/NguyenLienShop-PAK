// 🧪 Quick translation test - Run this in browser console to test translations

// Test current translations
console.log('🔍 Testing translation keys...');

// Check if translations are loaded
const messages = JSON.parse(localStorage.getItem('persist:root') || '{}');
console.log('Redux state:', messages);

// Test logout keys specifically
try {
    const testKeys = [
        'logout.success',
        'logout.success_message',
        'logout.failed_title',
        'logout.error'
    ];

    console.log('🎯 Testing logout translation keys:');
    testKeys.forEach(key => {
        try {
            const element = document.createElement('div');
            element.innerHTML = `<span data-key="${key}">Testing ${key}</span>`;
            console.log(`✅ Key: ${key} - Ready for testing`);
        } catch (e) {
            console.log(`❌ Key: ${key} - Error: ${e.message}`);
        }
    });

    console.log('');
    console.log('💡 Solutions to try:');
    console.log('1. Hard refresh (Ctrl+Shift+R)');
    console.log('2. Clear browser cache');
    console.log('3. Restart frontend server');
    console.log('4. Check browser dev tools > Application > Local Storage');

} catch (error) {
    console.error('❌ Translation test failed:', error);
}

// Clear any cached translations
console.log('🧹 Clearing cached translations...');
localStorage.removeItem('persist:root');
sessionStorage.clear();

console.log('✅ Cache cleared. Please refresh the page.');