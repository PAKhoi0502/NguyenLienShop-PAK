// Test backend connection utility
import axios from '../axios';

export const testBackendConnection = async () => {
    try {
        console.log('🔧 [BACKEND TEST] Testing backend connection...');
        console.log('🔧 [BACKEND TEST] Base URL:', process.env.REACT_APP_BACKEND_URL);

        // Test a simple endpoint that should exist
        const response = await axios.get('/api/auth/check');
        console.log('🔧 [BACKEND TEST] Connection successful:', response);
        return { success: true, data: response };
    } catch (error) {
        console.error('🔧 [BACKEND TEST] Connection failed:', error);
        console.error('🔧 [BACKEND TEST] Error message:', error.message);
        console.error('🔧 [BACKEND TEST] Error code:', error.code);
        return { success: false, error: error.message };
    }
};

export const testPhoneCheckEndpoint = async (phoneNumber = '0979502094') => {
    try {
        console.log('🔧 [PHONE CHECK TEST] Testing phone check endpoint...');

        // Make raw axios call without using our wrapper
        const rawResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/check-phone`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber }),
            credentials: 'include'
        });

        console.log('🔧 [PHONE CHECK TEST] Raw response status:', rawResponse.status);
        console.log('🔧 [PHONE CHECK TEST] Raw response ok:', rawResponse.ok);

        const responseData = await rawResponse.json();
        console.log('🔧 [PHONE CHECK TEST] Raw response data:', responseData);

        return { success: rawResponse.ok, data: responseData, status: rawResponse.status };
    } catch (error) {
        console.error('🔧 [PHONE CHECK TEST] Raw fetch failed:', error);
        return { success: false, error: error.message };
    }
};