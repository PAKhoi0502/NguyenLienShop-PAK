/**
 * Mock SMS Service for OTP functionality
 * Logs to console instead of sending real SMS
 * Perfect for development and testing
 */

// Store OTP codes in memory for development (don't use in production)
const otpStore = new Map();

/**
 * Generate 6-digit OTP code
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to phone number (Mock - logs to console)
 * @param {string} phoneNumber - Vietnamese phone number
 * @returns {Promise<{success: boolean, message: string, otpCode?: string}>}
 */
export const sendOTP = async (phoneNumber) => {
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate OTP
        const otpCode = generateOTP();

        // Store OTP with expiration time (5 minutes)
        const expiresAt = Date.now() + (5 * 60 * 1000);
        otpStore.set(phoneNumber, {
            code: otpCode,
            expiresAt,
            attempts: 0,
            maxAttempts: 3
        });

        // Mock console log instead of real SMS
        console.log(`📱 [MOCK SMS SERVICE] ===========================`);
        console.log(`📞 Gửi OTP đến: ${phoneNumber}`);
        console.log(`🔢 Mã OTP: ${otpCode}`);
        console.log(`⏰ Có hiệu lực: 5 phút`);
        console.log(`📱 [MOCK SMS] Nội dung: "NguyenLienShop - Mã xác thực: ${otpCode}. Có hiệu lực 5 phút."`);
        console.log(`===============================================`);

        return {
            success: true,
            message: "Mã OTP đã được gửi đến số điện thoại của bạn",
            // Include OTP for development only (remove in production)
            otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
        };

    } catch (error) {
        console.error(`❌ [MOCK SMS ERROR]:`, error);
        return {
            success: false,
            message: "Đã xảy ra lỗi khi gửi OTP. Vui lòng thử lại."
        };
    }
};

/**
 * Verify OTP code
 * @param {string} phoneNumber - Vietnamese phone number
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyOTP = async (phoneNumber, otpCode) => {
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const storedOTP = otpStore.get(phoneNumber);

        if (!storedOTP) {
            console.log(`❌ [MOCK VERIFY] Không tìm thấy OTP cho số: ${phoneNumber}`);
            return {
                success: false,
                message: "Mã OTP không tồn tại. Vui lòng gửi lại mã mới."
            };
        }

        // Check expiration
        if (Date.now() > storedOTP.expiresAt) {
            console.log(`⏰ [MOCK VERIFY] OTP đã hết hạn cho số: ${phoneNumber}`);
            otpStore.delete(phoneNumber);
            return {
                success: false,
                message: "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới."
            };
        }

        // Check max attempts
        if (storedOTP.attempts >= storedOTP.maxAttempts) {
            console.log(`🚫 [MOCK VERIFY] Vượt quá số lần thử cho số: ${phoneNumber}`);
            otpStore.delete(phoneNumber);
            return {
                success: false,
                message: "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới."
            };
        }

        // Increment attempt counter
        storedOTP.attempts += 1;
        otpStore.set(phoneNumber, storedOTP);

        // Verify code
        if (otpCode === storedOTP.code) {
            console.log(`✅ [MOCK VERIFY] OTP hợp lệ cho số: ${phoneNumber}`);
            // Remove OTP after successful verification
            otpStore.delete(phoneNumber);
            return {
                success: true,
                message: "Xác thực OTP thành công!"
            };
        } else {
            console.log(`❌ [MOCK VERIFY] OTP không đúng. Lần thử: ${storedOTP.attempts}/${storedOTP.maxAttempts}`);
            return {
                success: false,
                message: `Mã OTP không đúng. Còn ${storedOTP.maxAttempts - storedOTP.attempts} lần thử.`
            };
        }

    } catch (error) {
        console.error(`❌ [MOCK VERIFY ERROR]:`, error);
        return {
            success: false,
            message: "Đã xảy ra lỗi khi xác thực OTP. Vui lòng thử lại."
        };
    }
};

/**
 * Resend OTP (with rate limiting)
 * @param {string} phoneNumber - Vietnamese phone number
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const resendOTP = async (phoneNumber) => {
    try {
        const storedOTP = otpStore.get(phoneNumber);

        // Check if can resend (not too frequent)
        if (storedOTP && storedOTP.lastSent && (Date.now() - storedOTP.lastSent) < 60000) {
            const waitTime = Math.ceil((60000 - (Date.now() - storedOTP.lastSent)) / 1000);
            console.log(`⏳ [MOCK RESEND] Phải đợi ${waitTime}s trước khi gửi lại`);
            return {
                success: false,
                message: `Vui lòng đợi ${waitTime} giây trước khi gửi lại mã.`
            };
        }

        // Send new OTP
        const result = await sendOTP(phoneNumber);
        if (result.success && storedOTP) {
            // Update last sent time
            const newStoredOTP = otpStore.get(phoneNumber);
            newStoredOTP.lastSent = Date.now();
            otpStore.set(phoneNumber, newStoredOTP);
        }

        return result;

    } catch (error) {
        console.error(`❌ [MOCK RESEND ERROR]:`, error);
        return {
            success: false,
            message: "Đã xảy ra lỗi khi gửi lại OTP. Vui lòng thử lại."
        };
    }
};

/**
 * Clear stored OTP (for cleanup)
 * @param {string} phoneNumber - Vietnamese phone number
 */
export const clearOTP = (phoneNumber) => {
    otpStore.delete(phoneNumber);
    console.log(`🗑️ [MOCK CLEAR] Đã xóa OTP cho số: ${phoneNumber}`);
};

/**
 * Get development info (only for testing)
 * @param {string} phoneNumber - Vietnamese phone number
 * @returns {object|null} OTP info for debugging
 */
export const getOTPInfo = (phoneNumber) => {
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    const storedOTP = otpStore.get(phoneNumber);
    if (!storedOTP) return null;

    return {
        code: storedOTP.code,
        expiresIn: Math.max(0, Math.ceil((storedOTP.expiresAt - Date.now()) / 1000)),
        attempts: storedOTP.attempts,
        maxAttempts: storedOTP.maxAttempts
    };
};

// Export default functions for convenience
const mockSmsService = {
    sendOTP,
    verifyOTP,
    resendOTP,
    clearOTP,
    getOTPInfo
};

export default mockSmsService;