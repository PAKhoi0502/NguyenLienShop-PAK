import Swal from 'sweetalert2';
import { verifyPassword } from '../../services/adminService';
import './PasswordVerification.scss';

/**
 * Hiển thị dialog xác thực mật khẩu với retry mechanism
 * @param {Object} options - Các tùy chọn cho dialog
 * @param {Function} options.intl - useIntl hook từ react-intl
 * @param {string} options.titleId - ID của translation cho title
 * @param {string} options.securityCheckId - ID của translation cho security check message
 * @param {string} options.instructionId - ID của translation cho instruction message
 * @param {string} options.placeholderId - ID của translation cho input placeholder
 * @param {string} options.buttonId - ID của translation cho confirm button
 * @param {string} options.cancelId - ID của translation cho cancel button
 * @param {string} options.requiredId - ID của translation cho password required error
 * @param {string} options.minLengthId - ID của translation cho password min length error
 * @param {string} options.error401Id - ID của translation cho 401 error
 * @param {string} options.attemptsRemainingId - ID của translation cho attempts remaining message
 * @param {string} options.lastAttemptId - ID của translation cho last attempt message
 * @param {string} options.tryAgainId - ID của translation cho try again button
 * @param {string} options.okId - ID của translation cho ok button
 * @param {string} options.maxAttemptsExceededId - ID của translation cho max attempts exceeded message
 * @param {number} [options.maxAttempts=3] - Số lần thử tối đa
 * @param {string} [options.icon='warning'] - Icon của dialog
 * @param {string} [options.customClass='swal-password-verification'] - Custom class cho popup
 * @returns {Promise<Object>} Promise trả về { success: boolean, password?: string, error?: string }
 */
export const showPasswordVerification = async (options) => {
    const {
        intl,
        titleId,
        securityCheckId,
        instructionId,
        placeholderId,
        buttonId,
        cancelId,
        requiredId,
        minLengthId,
        error401Id,
        attemptsRemainingId,
        lastAttemptId,
        tryAgainId,
        okId,
        maxAttemptsExceededId,
        maxAttempts = 3,
        icon = 'warning',
        customClass = 'swal-password-verification'
    } = options;

    const verifyPasswordWithRetry = async (passwordAttempts = 0) => {
        const safeAttempts = typeof passwordAttempts === 'number' ? passwordAttempts : 0;

        // Check if password attempts exceeded
        if (safeAttempts >= maxAttempts) {
            return {
                success: false,
                error: intl.formatMessage({ id: maxAttemptsExceededId }) || "Đã nhập sai mật khẩu quá nhiều lần"
            };
        }

        const passwordTitle = safeAttempts > 0 ?
            `${intl.formatMessage({ id: titleId })} - Lần thử ${safeAttempts + 1}/${maxAttempts}` :
            intl.formatMessage({ id: titleId });

        const passwordConfirm = await Swal.fire({
            title: passwordTitle,
            html: `
                <div class="password-verification-content">
                    <p class="password-verification__security-check">
                        ${intl.formatMessage({ id: securityCheckId })}
                    </p>
                    <p class="password-verification__instruction">
                        ${intl.formatMessage({ id: instructionId })}
                    </p>
                </div>
            `,
            input: 'password',
            inputPlaceholder: intl.formatMessage({ id: placeholderId }),
            icon,
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: buttonId }),
            cancelButtonText: intl.formatMessage({ id: cancelId }),
            inputValidator: (value) => {
                if (!value || value.trim() === '') {
                    return intl.formatMessage({ id: requiredId });
                }
                if (value.length < 6) {
                    return intl.formatMessage({ id: minLengthId });
                }
            },
            customClass: {
                popup: customClass,
                input: 'swal-password-input',
                confirmButton: 'swal-password-confirm-btn'
            }
        });

        if (!passwordConfirm.isConfirmed) {
            return { success: false, cancelled: true };
        }

        const password = passwordConfirm.value;

        try {
            // Verify password with custom headers to prevent retry loop
            const passwordVerification = await verifyPassword({
                password
            }, {
                headers: {
                    'X-Prevent-Retry': 'true'
                }
            });

            if (passwordVerification.errCode !== 0) {
                const remainingAttempts = maxAttempts - (safeAttempts + 1);

                // Show error with remaining attempts info
                await Swal.fire({
                    title: intl.formatMessage({ id: 'common.error' }),
                    html: `
                        <div class="password-verification-content">
                            <p class="password-verification__error">
                                ${passwordVerification.errMessage || intl.formatMessage({ id: error401Id })}
                            </p>
                            ${remainingAttempts > 0 ?
                            `<p class="password-verification__remaining">
                                    <strong>⚠️ ${intl.formatMessage(
                                { id: attemptsRemainingId },
                                { remaining: remainingAttempts }
                            ) || `Còn lại ${remainingAttempts} lần thử`}</strong>
                                </p>` :
                            `<p class="password-verification__last">
                                    <strong>🚨 ${intl.formatMessage({ id: lastAttemptId }) || 'Đây là lần thử cuối cùng!'}</strong>
                                </p>`
                        }
                        </div>
                    `,
                    icon: 'error',
                    confirmButtonText: remainingAttempts > 0 ?
                        intl.formatMessage({ id: tryAgainId }) || "Thử lại" :
                        intl.formatMessage({ id: okId }) || "OK"
                });

                // Recursively retry if attempts remaining
                if (remainingAttempts > 0) {
                    const nextAttempt = safeAttempts + 1;
                    // Recursively retry after a short delay
                    return await new Promise((resolve) => {
                        setTimeout(async () => {
                            const result = await verifyPasswordWithRetry(nextAttempt);
                            resolve(result);
                        }, 100);
                    });
                } else {
                    return {
                        success: false,
                        error: intl.formatMessage({ id: maxAttemptsExceededId }) || "Đã nhập sai mật khẩu quá nhiều lần"
                    };
                }
            }

            // Password verified successfully
            return {
                success: true,
                password
            };

        } catch (error) {
            console.error('Password verification error:', error);
            return {
                success: false,
                error: error.response?.data?.errMessage || intl.formatMessage({ id: error401Id }) || "Lỗi xác thực mật khẩu"
            };
        }
    };

    return await verifyPasswordWithRetry(0);
};