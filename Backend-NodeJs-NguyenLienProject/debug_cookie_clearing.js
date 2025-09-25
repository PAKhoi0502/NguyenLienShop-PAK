// Backend debug script for cookie clearing issue
const express = require('express');
const app = express();

// Test cookie clearing options
const testCookieClearing = () => {
    console.log('🧪 Testing Cookie Clearing Options:');

    // Current production environment check
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Production mode:', process.env.NODE_ENV === 'production');

    // Cookie options when setting
    const settingOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    };

    console.log('Setting options:', settingOptions);
    console.log('Clearing options:', settingOptions);

    // Test potential mismatches
    if (process.env.NODE_ENV !== 'production' && settingOptions.secure === false) {
        console.log('⚠️  Development mode - secure: false');
    }

    // Domain mismatch check
    console.log('Domain in options:', settingOptions.domain || 'undefined');

    return settingOptions;
};

testCookieClearing();

// Test manual cookie clearing with different approaches
const testManualClearingApproaches = (res) => {
    console.log('🧪 Testing Manual Cookie Clearing Approaches:');

    // Approach 1: Simple clear
    res.clearCookie('authToken');
    res.clearCookie('refreshToken');

    // Approach 2: Clear with path
    res.clearCookie('authToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    // Approach 3: Clear with all original options
    const clearOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    };

    res.clearCookie('authToken', clearOptions);
    res.clearCookie('refreshToken', clearOptions);

    // Approach 4: Set expired cookies
    res.cookie('authToken', '', {
        ...clearOptions,
        expires: new Date(0)
    });

    res.cookie('refreshToken', '', {
        ...clearOptions,
        expires: new Date(0)
    });

    console.log('✅ All clearing approaches attempted');
};

module.exports = {
    testCookieClearing,
    testManualClearingApproaches
};