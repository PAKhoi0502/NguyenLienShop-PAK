import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast';
import { requestPasswordReset, verifyResetOTP, resetPassword, clearServerOTP } from '../../services/authService';
import './ForgotPassword.scss'; // Import SCSS riêng cho ForgotPassword

// Global flag to prevent multiple restore toasts in dev mode
let hasRestoredGlobal = false;

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOTPCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [attemptsRemaining, setAttemptsRemaining] = useState(5);

    const navigate = useNavigate();
    const intl = useIntl();
    const expiryTimeRef = React.useRef(null); // Store expiry time to prevent recalculation
    const hasShownRestoreToastRef = React.useRef(false); // Prevent duplicate restore toast

    // 🔧 Clear session when component unmounts (user navigates away)
    React.useEffect(() => {
        // Clear session when user closes browser/tab at sensitive steps
        const handleBeforeUnload = () => {
            if (step >= 2) {
                sessionStorage.removeItem('forgotPasswordFlow');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            // Clear session when user leaves the forgot password page
            // This is important for security - don't restore sensitive reset sessions
            if (step >= 2) { // Only clear if we're past the phone input step
                sessionStorage.removeItem('forgotPasswordFlow');
                hasRestoredGlobal = false;
            }

            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [step]);

    // 🔧 Restore state from sessionStorage on component mount
    React.useEffect(() => {
        // Only run once on mount, and only if we haven't processed restore yet
        if (hasShownRestoreToastRef.current || hasRestoredGlobal) return;

        const savedState = sessionStorage.getItem('forgotPasswordFlow');
        if (savedState) {
            try {
                const { step: savedStep, phoneNumber: savedPhone, resetToken: savedToken, expiryTime, attempts } = JSON.parse(savedState);
                const now = Date.now();

                if (expiryTime && now < expiryTime) {
                    // Security check: Don't restore step 3 (password reset) for security reasons
                    if (savedStep === 3) {
                        sessionStorage.removeItem('forgotPasswordFlow');

                        // Show security warning
                        toast(
                            <CustomToast
                                type="warning"
                                titleId="forgot_password.phone_step.title"
                                message={intl.formatMessage({ id: 'forgot_password.security_cleared' })}
                                time={new Date()}
                            />,
                            { closeButton: false, type: "warning" }
                        );
                        return;
                    }

                    setStep(savedStep);
                    setPhoneNumber(savedPhone);
                    if (savedToken) setResetToken(savedToken);
                    if (attempts !== undefined) setAttemptsRemaining(attempts);
                    expiryTimeRef.current = expiryTime; // Store the expiry time

                    // Restore countdown if in step 2
                    if (savedStep === 2) {
                        const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
                        setCountdown(remaining);
                    }


                    // Only show restore toast if we're restoring meaningful progress
                    if (savedStep > 1) {
                        hasShownRestoreToastRef.current = true; // Mark as shown
                        hasRestoredGlobal = true; // Global flag

                        // Delay toast slightly to avoid conflict with any ongoing operations
                        setTimeout(() => {
                            toast(
                                <CustomToast
                                    type="info"
                                    titleId="forgot_password.restored_title"
                                    message={intl.formatMessage({ id: 'forgot_password.restored_message' })}
                                    time={new Date()}
                                />,
                                {
                                    closeButton: false,
                                    type: "info",
                                    toastId: "session-restored" // Prevent duplicate
                                }
                            );
                        }, 100);
                    }
                } else {
                    // Expired, clean up
                    sessionStorage.removeItem('forgotPasswordFlow');
                }
            } catch (error) {
                console.error('Failed to restore forgot password state:', error);
                sessionStorage.removeItem('forgotPasswordFlow');
            }
        }
    }, [intl]);

    // 🔧 Save state to sessionStorage whenever critical data changes
    React.useEffect(() => {
        if (step > 1 && phoneNumber) {
            let actualExpiryTime = expiryTimeRef.current;

            // Only calculate new expiry time when:
            // 1. We don't have one yet, OR
            // 2. We just moved to step 2 with fresh countdown (300s)
            if (!actualExpiryTime || (step === 2 && countdown === 300 && !expiryTimeRef.current)) {
                actualExpiryTime = Date.now() + (5 * 60 * 1000); // 5 minutes
                expiryTimeRef.current = actualExpiryTime;
            }

            // For step 3 (password reset), reduce expiry time for security
            const isPasswordStep = step === 3;
            const securityExpiryTime = isPasswordStep ?
                Date.now() + (2 * 60 * 1000) : // Only 2 minutes for password step
                actualExpiryTime;

            const stateToSave = {
                step,
                phoneNumber,
                resetToken,
                expiryTime: securityExpiryTime,
                attempts: attemptsRemaining,
                timestamp: Date.now()
            };
            sessionStorage.setItem('forgotPasswordFlow', JSON.stringify(stateToSave));
        }
    }, [step, phoneNumber, resetToken, attemptsRemaining, countdown]);

    // 🔧 Clear saved state on successful completion
    const clearSavedState = () => {
        sessionStorage.removeItem('forgotPasswordFlow');
        expiryTimeRef.current = null; // Reset expiry time ref
        hasShownRestoreToastRef.current = false; // Reset restore toast flag
        hasRestoredGlobal = false; // Reset global flag
    };

    // 🔧 Validate token when entering step 3
    React.useEffect(() => {
        if (step === 3 && !resetToken) {
            console.warn('⚠️ No reset token available for step 3, redirecting to step 1');
            toast(
                <CustomToast
                    type="warning"
                    titleId="forgot_password.password_step.error_title"
                    message={intl.formatMessage({ id: 'forgot_password.session_expired' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "warning" }
            );
            setStep(1);
            clearSavedState();
        }
    }, [step, resetToken, intl]);

    // Countdown timer for resend OTP
    React.useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
        return phoneRegex.test(phone);
    };

    const handleRequestReset = async (e) => {
        e.preventDefault();

        if (!phoneNumber.trim()) {
            toast(
                <CustomToast
                    type="error"
                    titleId="forgot_password.phone_step.error_title"
                    message={intl.formatMessage({ id: 'forgot_password.phone_step.validation.phone_required' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        if (!validatePhoneNumber(phoneNumber)) {
            toast(
                <CustomToast
                    type="error"
                    titleId="forgot_password.phone_step.error_title"
                    message={intl.formatMessage({ id: 'forgot_password.phone_step.validation.phone_invalid' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        setLoading(true);

        try {
            const response = await requestPasswordReset(phoneNumber);

            if (response.errCode !== 0) {
                toast(
                    <CustomToast
                        type="error"
                        titleId="forgot_password.phone_step.error_title"
                        message={response.errMessage || intl.formatMessage({ id: 'forgot_password.phone_step.errors.send_failed' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
                return;
            }

            // Success - move to OTP step
            setResetToken(response.resetToken);
            setStep(2);
            setCountdown(300); // 5 minutes countdown
            expiryTimeRef.current = null; // Reset so new expiry time will be calculated

            toast(
                <CustomToast
                    type="success"
                    titleId="forgot_password.phone_step.success_title"
                    message={intl.formatMessage({ id: 'forgot_password.phone_step.success_message' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "success" }
            );

        } catch (error) {
            toast(
                <CustomToast
                    type="error"
                    titleId="forgot_password.phone_step.error_title"
                    message={intl.formatMessage({ id: 'forgot_password.phone_step.errors.server_error' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!otpCode || otpCode.length !== 6) {
            toast(
                <CustomToast
                    type="error"
                    titleId="forgot_password.otp_step.error_title"
                    message={intl.formatMessage({ id: 'forgot_password.otp_step.validation.otp_invalid' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        setLoading(true);

        try {
            const response = await verifyResetOTP(phoneNumber, otpCode);

            if (response.errCode !== 0) {
                // Handle different error scenarios
                if (response.errCode === 429 || response.status === 429) {
                    // Too many attempts - reset flow
                    toast(
                        <CustomToast
                            type="error"
                            titleId="forgot_password.otp_step.error_title"
                            message={intl.formatMessage({ id: 'forgot_password.otp_step.errors.too_many_attempts' })}
                            time={new Date()}
                        />,
                        { closeButton: false, type: "error" }
                    );
                    setStep(1);
                    setOTPCode('');
                    setCountdown(0);
                    clearSavedState();
                } else {
                    // Update attempts remaining
                    const newAttempts = Math.max(0, attemptsRemaining - 1);
                    setAttemptsRemaining(newAttempts);

                    const errorMessage = response.errMessage || intl.formatMessage({ id: 'forgot_password.otp_step.errors.invalid_otp' });
                    const attemptsMessage = newAttempts > 0
                        ? intl.formatMessage({ id: 'forgot_password.otp_step.attempts_remaining' }, { count: newAttempts })
                        : '';

                    toast(
                        <CustomToast
                            type="error"
                            titleId="forgot_password.otp_step.error_title"
                            message={`${errorMessage} ${attemptsMessage}`}
                            time={new Date()}
                        />,
                        { closeButton: false, type: "error" }
                    );

                    // Reset OTP input for next attempt
                    setOTPCode('');

                    if (newAttempts === 0) {
                        // No attempts left, reset flow
                        setTimeout(() => {
                            setStep(1);
                            setCountdown(0);
                            clearSavedState();
                            toast(
                                <CustomToast
                                    type="warning"
                                    titleId="forgot_password.otp_step.error_title"
                                    message={intl.formatMessage({ id: 'forgot_password.otp_step.errors.no_attempts_left' })}
                                    time={new Date()}
                                />,
                                { closeButton: false, type: "warning" }
                            );
                        }, 2000);
                    }
                }
                return;
            }

            // Success - move to password reset step
            setResetToken(response.resetToken);
            setStep(3);

            toast(
                <CustomToast
                    type="success"
                    titleId="forgot_password.otp_step.success_title"
                    message={intl.formatMessage({ id: 'forgot_password.password_step.description' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "success" }
            );

        } catch (error) {
            console.error('Verify OTP error:', error);
            toast(
                <CustomToast
                    type="error"
                    titleId="forgot_password.otp_step.error_title"
                    message={intl.formatMessage({ id: 'forgot_password.otp_step.errors.verification_failed' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!newPassword) {
            toast(
                <CustomToast
                    type="error"
                    titleId="forgot_password.password_step.error_title"
                    message={intl.formatMessage({ id: 'forgot_password.password_step.validation.password_required' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        if (newPassword.length < 6) {
            toast(
                <CustomToast
                    type="error"
                    titleId="forgot_password.password_step.error_title"
                    message={intl.formatMessage({ id: 'forgot_password.password_step.validation.password_min_length' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            toast(
                <CustomToast
                    type="error"
                    titleId="forgot_password.password_step.error_title"
                    message={intl.formatMessage({ id: 'forgot_password.password_step.validation.password_mismatch' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        setLoading(true);

        try {
            const response = await resetPassword(resetToken, newPassword);

            if (response.errCode !== 0) {
                toast(
                    <CustomToast
                        type="error"
                        titleId="forgot_password.password_step.error_title"
                        message={response.errMessage || intl.formatMessage({ id: 'forgot_password.password_step.errors.reset_failed' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
                return;
            }

            // Success - redirect to login
            clearSavedState(); // Clear saved state on successful completion

            toast(
                <CustomToast
                    type="success"
                    titleId="forgot_password.password_step.success_title"
                    message={intl.formatMessage({ id: 'forgot_password.password_step.success_message' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "success" }
            );

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            toast(
                <CustomToast
                    type="error"
                    titleId="forgot_password.password_step.error_title"
                    message={intl.formatMessage({ id: 'forgot_password.password_step.errors.server_error' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;

        setLoading(true);
        try {
            const response = await requestPasswordReset(phoneNumber);
            if (response.errCode === 0) {
                setCountdown(300); // Reset countdown
                setAttemptsRemaining(5); // Reset attempts counter
                setOTPCode(''); // Clear OTP input
                expiryTimeRef.current = null; // Reset so new expiry time will be calculated

                toast(
                    <CustomToast
                        type="success"
                        titleId="forgot_password.otp_step.success_title"
                        message={intl.formatMessage({ id: 'forgot_password.resent_message' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "success" }
                );
            } else {
                toast(
                    <CustomToast
                        type="error"
                        titleId="forgot_password.phone_step.error_title"
                        message={response.errMessage || intl.formatMessage({ id: 'forgot_password.phone_step.errors.send_failed' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            toast(
                <CustomToast
                    type="error"
                    titleId="forgot_password.phone_step.error_title"
                    message={intl.formatMessage({ id: 'forgot_password.phone_step.errors.server_error' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
        } finally {
            setLoading(false);
        }
    };

    // 🔄 Handle back to step 1 (change phone number)
    const handleBackToStep1 = async () => {

        // Clear server-side OTP for current phone number
        if (phoneNumber) {
            try {
                await clearServerOTP(phoneNumber);
            } catch (error) {
            }
        }

        // Clear all local state
        setStep(1);
        setPhoneNumber('');
        setOTPCode('');
        setResetToken('');
        setCountdown(0);
        setAttemptsRemaining(5);
        setLoading(false);

        // Clear sessionStorage
        clearSavedState();

        toast(
            <CustomToast
                type="info"
                titleId="forgot_password.phone_step.title"
                message={intl.formatMessage({ id: 'forgot_password.back_to_phone_input' })}
                time={new Date()}
            />,
            { closeButton: false, type: "info" }
        );
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <div className="text-login">
                    {step === 1 && <FormattedMessage id="forgot_password.title" />}
                    {step === 2 && <FormattedMessage id="forgot_password.otp_step.title" />}
                    {step === 3 && <FormattedMessage id="forgot_password.password_step.title" />}
                </div>

                {step === 1 && (
                    <form onSubmit={handleRequestReset}>
                        <div className="form-group login-input">
                            <label><FormattedMessage id="forgot_password.phone_step.phone_label" /></label>
                            <input
                                className="form-control"
                                type="text"
                                placeholder={intl.formatMessage({ id: 'forgot_password.phone_step.phone_placeholder' })}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                maxLength="10"
                                disabled={loading}
                            />
                        </div>

                        <button
                            className="btn-login"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ?
                                <FormattedMessage id="forgot_password.phone_step.sending" /> :
                                <FormattedMessage id="forgot_password.phone_step.submit_button" />
                            }
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group login-input">
                            <label><FormattedMessage id="forgot_password.otp_step.otp_label" /></label>
                            <input
                                className="form-control"
                                type="text"
                                placeholder={intl.formatMessage({ id: 'forgot_password.otp_step.otp_placeholder' })}
                                value={otpCode}
                                onChange={(e) => setOTPCode(e.target.value.replace(/\D/g, ''))}
                                maxLength="6"
                                disabled={loading}
                            />
                            <small className="text-muted">
                                <FormattedMessage
                                    id="forgot_password.otp_step.description"
                                    values={{ phone: phoneNumber }}
                                />
                            </small>
                            {attemptsRemaining < 5 && (
                                <small className="text-warning d-block mt-1">
                                    <FormattedMessage
                                        id="forgot_password.otp_step.attempts_remaining_display"
                                        values={{ count: attemptsRemaining }}
                                    />
                                </small>
                            )}
                        </div>

                        {countdown > 0 && (
                            <div className="text-center">
                                <small className="text-muted">
                                    <FormattedMessage
                                        id="forgot_password.otp_step.expires_in"
                                        values={{ seconds: formatTime(countdown) }}
                                    />
                                </small>
                            </div>
                        )}

                        <button
                            className="btn-login"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ?
                                <FormattedMessage id="forgot_password.otp_step.verifying" /> :
                                <FormattedMessage id="forgot_password.otp_step.verify_button" />
                            }
                        </button>

                        <div className="text-center mt-3">
                            <button
                                type="button"
                                className="btn btn-link"
                                onClick={handleResendOTP}
                                disabled={countdown > 0 || loading}
                            >
                                {countdown > 0 ?
                                    <FormattedMessage
                                        id="forgot_password.otp_step.resend_in"
                                        values={{ seconds: formatTime(countdown) }}
                                    /> :
                                    <FormattedMessage id="forgot_password.otp_step.resend_button" />
                                }
                            </button>
                        </div>

                        <div className="text-center mt-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleBackToStep1}
                                disabled={loading}
                            >
                                <i className="fas fa-arrow-left"></i>
                                <FormattedMessage id="forgot_password.otp_step.change_phone" />
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group login-input">
                            <label><FormattedMessage id="forgot_password.password_step.password_label" /></label>
                            <div className="custom-input-password">
                                <input
                                    className="form-control"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={intl.formatMessage({ id: 'forgot_password.password_step.password_placeholder' })}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={showPassword ? "far fa-eye" : "far fa-eye-slash"}></i>
                                </span>
                            </div>
                        </div>

                        <div className="form-group login-input">
                            <label><FormattedMessage id="forgot_password.password_step.confirm_password_label" /></label>
                            <div className="custom-input-password">
                                <input
                                    className="form-control"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder={intl.formatMessage({ id: 'forgot_password.password_step.confirm_password_placeholder' })}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <span
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <i className={showConfirmPassword ? "far fa-eye" : "far fa-eye-slash"}></i>
                                </span>
                            </div>
                        </div>

                        <button
                            className="btn-login"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ?
                                <FormattedMessage id="forgot_password.password_step.resetting" /> :
                                <FormattedMessage id="forgot_password.password_step.reset_button" />
                            }
                        </button>
                    </form>
                )}

                <div className="text-center mt-3">
                    <span className="txt1">
                        <FormattedMessage id="forgot_password.back_to_login_text" />
                    </span>
                    <Link className="txt2" to="/login">
                        <FormattedMessage id="login.button" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;