// Clear Redux persist storage and localStorage
const clearStorageScript = `
console.log('Clearing all storage...');

// Clear localStorage
Object.keys(localStorage).forEach(key => {
    console.log('Removing localStorage key:', key);
    localStorage.removeItem(key);
});

// Clear sessionStorage
Object.keys(sessionStorage).forEach(key => {
    console.log('Removing sessionStorage key:', key);
    sessionStorage.removeItem(key);
});

console.log('Storage cleared successfully!');
`;

// Write to browser console
console.log('Copy and paste this in browser console:');
console.log(clearStorageScript);
