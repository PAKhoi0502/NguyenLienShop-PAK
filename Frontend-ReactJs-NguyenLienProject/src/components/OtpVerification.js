import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { sendOTP, verifyOTP, resendOTP } from '../utils/mockSmsService';
import { toast } from 'react-toastify';
import CustomToast from './CustomToast';
import './OtpVerification.scss';

const OtpVerification = ({
    phoneNumber,
    onVerificationSuccess,
    onCancel,
    title = "register.otp.title",
    description = "register.otp.description"
}) => {
    const intl = useIntl();

    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [otpSent, setOtpSent] = useState(false); // Add flag to track if OTP was sent
    const maxAttempts = 3;
    const otpSentRef = useRef(false); // Add ref to prevent duplicate sends

    const inputRefs = useRef([]);

    // Initialize input refs
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, []);

    // Start countdown timer
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [countdown]);

    const handleSendOTP = useCallback(async () => {
        if (otpSent || otpSentRef.current) {
            return;
        }

        setResendLoading(true);
        otpSentRef.current = true; // Set ref immediately to prevent concurrent calls

        try {
            const result = await sendOTP(phoneNumber);
            if (result.success) {
                toast(<CustomToast
                    type="success"
                    titleId="register.otp.sent_title"
                    message={intl.formatMessage({ id: 'register.otp.sent_success_msg' })}
                    time={new Date()}
                />);
                setCountdown(60); // 60 seconds countdown
                setOtpCode(['', '', '', '', '', '']); // Clear previous OTP
                setAttempts(0); // Reset attempts
                setOtpSent(true); // Mark OTP as sent

                // Focus first input
                setTimeout(() => {
                    if (inputRefs.current[0]) {
                        inputRefs.current[0].focus();
                    }
                }, 100);
            } else {
                toast(<CustomToast
                    type="error"
                    titleId="register.otp.error_title"
                    message={intl.formatMessage({ id: 'register.otp.sent_error_msg' })}
                    time={new Date()}
                />);
                setOtpSent(false);
                otpSentRef.current = false;
            }
        } catch (error) {
            toast(<CustomToast
                type="error"
                titleId="register.otp.error_title"
                message={intl.formatMessage({ id: 'register.otp.sent_error_msg' })}
                time={new Date()}
            />);
            setOtpSent(false);
            otpSentRef.current = false;
        }
        setResendLoading(false);
    }, [phoneNumber, otpSent, intl]); // Dependencies include phoneNumber, otpSent, and intl
    useEffect(() => {

        if (!otpSent && !otpSentRef.current && phoneNumber) {
            handleSendOTP();
        } else {
        }
    }, [phoneNumber, handleSendOTP, otpSent]); // Include all dependencies

    const handleOtpChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtpCode = [...otpCode];
        newOtpCode[index] = value;
        setOtpCode(newOtpCode);

        // Auto focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto verify when all 6 digits are entered
        if (value && index === 5 && newOtpCode.every(digit => digit !== '')) {
            handleVerifyOTP(newOtpCode.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            const newOtpCode = [...otpCode];

            if (otpCode[index] === '' && index > 0) {
                // Move to previous input if current is empty
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current input
                newOtpCode[index] = '';
                setOtpCode(newOtpCode);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');

        if (pastedData && /^\d{6}$/.test(pastedData)) {
            const newOtpCode = pastedData.split('');
            setOtpCode(newOtpCode);

            // Focus last input
            inputRefs.current[5]?.focus();

            // Auto verify
            setTimeout(() => {
                handleVerifyOTP(pastedData);
            }, 100);
        }
    };

    const handleVerifyOTP = async (code = null) => {
        const otpToVerify = code || otpCode.join('');

        if (otpToVerify.length !== 6) {
            toast(<CustomToast
                type="error"
                titleId="register.otp.error_title"
                message={intl.formatMessage({ id: 'otp.validation.complete_6_digits' })}
                time={new Date()}
            />);
            return;
        }

        setLoading(true);
        setAttempts(prev => prev + 1);

        try {
            const result = await verifyOTP(phoneNumber, otpToVerify);

            if (result.success) {
                // Don't show success toast here - let parent component handle it
                onVerificationSuccess();
            } else {
                toast(<CustomToast
                    type="error"
                    titleId="register.otp.error_title"
                    message={intl.formatMessage({ id: 'otp.error.invalid' })}
                    time={new Date()}
                />);

                // Clear OTP inputs on failure
                setOtpCode(['', '', '', '', '', '']);
                setTimeout(() => {
                    inputRefs.current[0]?.focus();
                }, 100);

                // Check if max attempts reached
                if (attempts >= maxAttempts - 1) {
                    setTimeout(() => {
                        onCancel();
                    }, 2000);
                }
            }
        } catch (error) {
            toast(<CustomToast
                type="error"
                titleId="register.otp.error_title"
                message={intl.formatMessage({ id: 'otp.error.verify_failed' })}
                time={new Date()}
            />);
        }

        setLoading(false);
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;

        setResendLoading(true);
        setOtpSent(false); // Reset the flag to allow resend
        otpSentRef.current = false; // Reset the ref

        try {
            const result = await resendOTP(phoneNumber);
            if (result.success) {
                toast(<CustomToast
                    type='success'
                    message={intl.formatMessage({ id: 'register.otp.re_sent_success_msg' })}
                    titleId='register.otp.sent_title'
                    time={new Date()}
                />);
                setCountdown(60);
                setOtpCode(['', '', '', '', '', '']);
                setAttempts(0);
                setOtpSent(true); // Mark as sent again
                otpSentRef.current = true; // Set ref again

                setTimeout(() => {
                    inputRefs.current[0]?.focus();
                }, 100);
            } else {
                toast(<CustomToast
                    type='error'
                    titleId='register.otp.error_title'
                    message={intl.formatMessage({ id: 'otp.error.resend_failed' })}
                    time={new Date()}
                />);
                setOtpSent(false);
                otpSentRef.current = false;
            }
        } catch (error) {
            toast(<CustomToast
                type='error'
                titleId='register.otp.error_title'
                message={intl.formatMessage({ id: 'otp.error.resend_failed' })}
                time={new Date()}
            />);
            setOtpSent(false);
            otpSentRef.current = false;
        }
        setResendLoading(false);
    };

    const formatPhoneNumber = (phone) => {
        if (phone.length === 10 && phone.startsWith('0')) {
            return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
        }
        return phone;
    };

    return (
        <div className="otp-verification-container">
            <div className="otp-verification-card">
                <div className="otp-header">
                    <div className="otp-icon">
                        📱
                    </div>
                    <h2 className="otp-title">{title}</h2>
                    <p className="otp-description">
                        {description}
                    </p>
                    <div className="phone-display">
                        <strong>{formatPhoneNumber(phoneNumber)}</strong>
                    </div>
                </div>

                <div className="otp-input-section">
                    <div className="otp-inputs" onPaste={handlePaste}>
                        {otpCode.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`otp-input ${digit ? 'filled' : ''} ${loading ? 'loading' : ''}`}
                                disabled={loading}
                                autoComplete="off"
                            />
                        ))}
                    </div>

                    <div className="otp-info">
                        <div className="attempts-info">
                            <FormattedMessage
                                id="body_admin.account_management.admin_manager.otp.attempts_remaining"
                                defaultMessage="Còn {remaining} lần thử"
                                values={{ remaining: maxAttempts - attempts }}
                            />
                        </div>

                        {countdown > 0 && (
                            <div className="countdown-info">
                                <FormattedMessage
                                    id="body_admin.account_management.admin_manager.otp.expires_in"
                                    defaultMessage="Hết hạn sau {seconds} giây"
                                    values={{ seconds: countdown }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="otp-actions">
                    <button
                        className="btn-verify"
                        onClick={() => handleVerifyOTP()}
                        disabled={loading || otpCode.some(digit => digit === '')}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                <FormattedMessage id="body_admin.account_management.admin_manager.otp.verifying" defaultMessage="Đang xác thực..." />
                            </>
                        ) : (
                            <FormattedMessage id="body_admin.account_management.admin_manager.otp.verify" defaultMessage="Xác thực" />
                        )}
                    </button>

                    <div className="resend-section">
                        {countdown > 0 ? (
                            <span className="resend-countdown">
                                <FormattedMessage
                                    id="body_admin.account_management.admin_manager.otp.resend_in"
                                    defaultMessage="Gửi lại sau {seconds}s"
                                    values={{ seconds: countdown }}
                                />
                            </span>
                        ) : (
                            <button
                                className="btn-resend"
                                onClick={handleResendOTP}
                                disabled={resendLoading}
                            >
                                {resendLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        <FormattedMessage id="body_admin.account_management.admin_manager.otp.sending" defaultMessage="Đang gửi..." />
                                    </>
                                ) : (
                                    <FormattedMessage id="body_admin.account_management.admin_manager.otp.resend" defaultMessage="Gửi lại mã" />
                                )}
                            </button>
                        )}
                    </div>

                    <button
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        <FormattedMessage id="body_admin.account_management.admin_manager.otp.cancel" defaultMessage="Hủy" />
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="development-info">
                        <small>
                            <FormattedMessage
                                id="body_admin.account_management.admin_manager.otp.dev_info"
                                defaultMessage="Development: Kiểm tra console để xem mã OTP"
                            />
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OtpVerification;