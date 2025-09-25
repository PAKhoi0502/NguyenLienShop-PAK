// Test phone validation
const testCases = [
    { input: '0979502094', expected: true, description: 'Valid phone' },
    { input: '0979502094s', expected: false, description: 'Phone with letters' },
    { input: '0979502094 ', expected: false, description: 'Phone with space' },
    { input: '097950209', expected: false, description: 'Too short' },
    { input: '09795020943', expected: false, description: 'Too long' },
    { input: '1979502094', expected: false, description: 'Not start with 0' },
    { input: '0879502094', expected: false, description: 'Invalid prefix' },
    { input: '', expected: false, description: 'Empty' },
    { input: 'abcdefghij', expected: false, description: 'All letters' },
];

const validatePhone = (phoneNumber) => {
    if (!phoneNumber) return false;

    // Strict validation: must be exactly digits only
    if (!/^\d+$/.test(phoneNumber)) return false;

    // Must be exactly 10 digits
    if (phoneNumber.length !== 10) return false;

    // Must start with 0
    if (!phoneNumber.startsWith('0')) return false;

    // Valid prefixes (simplified)
    const validPrefixes = ['032', '033', '034', '035', '036', '037', '038', '039', '097', '098'];
    const prefix = phoneNumber.substring(0, 3);
    return validPrefixes.includes(prefix);
};

console.log('🧪 Phone Validation Tests:');
testCases.forEach(({ input, expected, description }) => {
    const result = validatePhone(input);
    const status = result === expected ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${description}: "${input}" → ${result} (expected: ${expected})`);
});