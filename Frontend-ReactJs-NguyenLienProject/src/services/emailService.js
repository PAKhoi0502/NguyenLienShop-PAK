import axios from '../axios';

// 📧 NEW UPDATE EMAIL SERVICES
// Flow: Email input → OTP to email → Verify OTP & Update

export const sendEmailOTP = async (newEmail) => {
    try {
        const res = await axios.post('/api/user/send-email-otp', { newEmail });
        return res;
    } catch (err) {
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi máy chủ!';
        const errorStatus = err?.response?.status;

        console.error('Send email OTP error:', err);

        return {
            errCode: errorStatus || -1,
            errMessage: errorMessage,
        };
    }
};

export const verifyEmailOTPAndUpdate = async (resetToken, otpCode) => {
    try {
        const res = await axios.post('/api/user/verify-email-otp', { resetToken, otpCode });
        return res;
    } catch (err) {
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi máy chủ!';
        const errorStatus = err?.response?.status;
        const attemptsRemaining = err?.response?.data?.attemptsRemaining;

        console.error('Verify email OTP error:', err);

        return {
            errCode: errorStatus || -1,
            errMessage: errorMessage,
            attemptsRemaining,
        };
    }
};

