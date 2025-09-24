/**
 * Backend SMS Service for OTP functionality
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
const sendOTP = async (phoneNumber) => {
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
        console.log(`📱 [BACKEND SMS SERVICE] ===========================`);
        console.log(`📞 Gửi OTP đến: ${phoneNumber}`);
        console.log(`🔢 Mã OTP: ${otpCode}`);
        console.log(`⏰ Có hiệu lực: 5 phút`);
        console.log(`📱 [SMS] Nội dung: "NguyenLienShop - Mã xác thực: ${otpCode}. Có hiệu lực 5 phút."`);
        console.log(`===============================================`);

        return {
            success: true,
            message: "Mã OTP đã được gửi đến số điện thoại của bạn",
            // Include OTP for development only (remove in production)
            otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
        };

    } catch (error) {
        console.error(`❌ [BACKEND SMS ERROR]:`, error);
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
const verifyOTP = async (phoneNumber, otpCode) => {
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const storedOTP = otpStore.get(phoneNumber);

        if (!storedOTP) {
            console.log(`❌ [BACKEND VERIFY] Không tìm thấy OTP cho số: ${phoneNumber}`);
            return {
                success: false,
                message: "Mã OTP không tồn tại. Vui lòng gửi lại mã mới."
            };
        }

        // Check expiration
        if (Date.now() > storedOTP.expiresAt) {
            console.log(`⏰ [BACKEND VERIFY] OTP đã hết hạn cho số: ${phoneNumber}`);
            otpStore.delete(phoneNumber);
            return {
                success: false,
                message: "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới."
            };
        }

        // Check max attempts
        if (storedOTP.attempts >= storedOTP.maxAttempts) {
            console.log(`🚫 [BACKEND VERIFY] Vượt quá số lần thử cho số: ${phoneNumber}`);
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
            console.log(`✅ [BACKEND VERIFY] OTP hợp lệ cho số: ${phoneNumber}`);
            // Remove OTP after successful verification
            otpStore.delete(phoneNumber);
            return {
                success: true,
                message: "Xác thực OTP thành công!"
            };
        } else {
            console.log(`❌ [BACKEND VERIFY] OTP không đúng. Lần thử: ${storedOTP.attempts}/${storedOTP.maxAttempts}`);
            return {
                success: false,
                message: `Mã OTP không đúng. Còn ${storedOTP.maxAttempts - storedOTP.attempts} lần thử.`
            };
        }

    } catch (error) {
        console.error(`❌ [BACKEND VERIFY ERROR]:`, error);
        return {
            success: false,
            message: "Đã xảy ra lỗi khi xác thực OTP. Vui lòng thử lại."
        };
    }
};

/**
 * Clear stored OTP (for cleanup)
 * @param {string} phoneNumber - Vietnamese phone number
 */
const clearOTP = (phoneNumber) => {
    otpStore.delete(phoneNumber);
    console.log(`🗑️ [BACKEND CLEAR] Đã xóa OTP cho số: ${phoneNumber}`);
};

export default {
    sendOTP,
    verifyOTP,
    clearOTP
};