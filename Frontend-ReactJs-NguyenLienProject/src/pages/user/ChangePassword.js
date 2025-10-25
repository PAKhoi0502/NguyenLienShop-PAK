import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast';
import { requestChangePassword, verifyChangeOTP, changePassword, clearServerOTP } from '../../services/authService';
import { logout } from '../../services/authService';
import './ChangePassword.scss';

// Global flag to prevent multiple restore toasts in dev mode
let hasRestoredGlobal = false;

const ChangePassword = () => {
    const [step, setStep] = useState(1); // 1: Current Password, 2: OTP, 3: New Password
    const [currentPassword, setCurrentPassword] = useState('');
    const [otpCode, setOTPCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [attemptsRemaining, setAttemptsRemaining] = useState(3); // Match backend maxAttempts

    const navigate = useNavigate();
    const intl = useIntl();
    const { adminInfo } = useSelector((state) => state.admin);
    const phoneNumber = adminInfo?.phoneNumber || '';

    const expiryTimeRef = React.useRef(null);
    const hasShownRestoreToastRef = React.useRef(false);

    // 🔧 Clear session when component unmounts
    React.useEffect(() => {
        const handleBeforeUnload = () => {
            if (step >= 2) {
                sessionStorage.removeItem('changePasswordFlow');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            if (step >= 2) {
                sessionStorage.removeItem('changePasswordFlow');
                hasRestoredGlobal = false;
            }
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [step]);

    // 🔧 Restore state from sessionStorage on mount
    React.useEffect(() => {
        if (hasShownRestoreToastRef.current || hasRestoredGlobal) return;

        const savedState = sessionStorage.getItem('changePasswordFlow');
        if (savedState) {
            try {
                const { step: savedStep, resetToken: savedToken, expiryTime, attempts } = JSON.parse(savedState);
                const now = Date.now();

                if (expiryTime && now < expiryTime) {
                    // Don't restore step 3 for security
                    if (savedStep === 3) {
                        sessionStorage.removeItem('changePasswordFlow');
                        toast(
                            <CustomToast
                                type="warning"
                                titleId="profile.change_password.title"
                                message={intl.formatMessage({ id: 'profile.change_password.security_cleared' })}
                                time={new Date()}
                            />,
                            { closeButton: false, type: "warning" }
                        );
                        return;
                    }

                    setStep(savedStep);
                    if (savedToken) setResetToken(savedToken);
                    if (attempts !== undefined) setAttemptsRemaining(attempts);
                    expiryTimeRef.current = expiryTime;

                    if (savedStep === 2) {
                        const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
                        setCountdown(remaining);
                    }

                    if (savedStep > 1) {
                        hasShownRestoreToastRef.current = true;
                        hasRestoredGlobal = true;

                        setTimeout(() => {
                            toast(
                                <CustomToast
                                    type="info"
                                    titleId="profile.change_password.restored_title"
                                    message={intl.formatMessage({ id: 'profile.change_password.restored_message' })}
                                    time={new Date()}
                                />,
                                { closeButton: false, type: "info", toastId: "session-restored" }
                            );
                        }, 100);
                    }
                } else {
                    sessionStorage.removeItem('changePasswordFlow');
                }
            } catch (error) {
                console.error('Failed to restore change password state:', error);
                sessionStorage.removeItem('changePasswordFlow');
            }
        }
    }, [intl]);

    // 🔧 Save state to sessionStorage
    React.useEffect(() => {
        if (step > 1 && phoneNumber) {
            let actualExpiryTime = expiryTimeRef.current;

            if (!actualExpiryTime || (step === 2 && countdown === 300 && !expiryTimeRef.current)) {
                actualExpiryTime = Date.now() + (5 * 60 * 1000);
                expiryTimeRef.current = actualExpiryTime;
            }

            const isPasswordStep = step === 3;
            const securityExpiryTime = isPasswordStep ?
                Date.now() + (2 * 60 * 1000) :
                actualExpiryTime;

            const stateToSave = {
                step,
                resetToken,
                expiryTime: securityExpiryTime,
                attempts: attemptsRemaining,
                timestamp: Date.now()
            };
            sessionStorage.setItem('changePasswordFlow', JSON.stringify(stateToSave));
        }
    }, [step, phoneNumber, resetToken, attemptsRemaining, countdown]);

    // 🔧 Clear saved state
    const clearSavedState = () => {
        sessionStorage.removeItem('changePasswordFlow');
        expiryTimeRef.current = null;
        hasShownRestoreToastRef.current = false;
        hasRestoredGlobal = false;
    };

    // 🔧 Validate token when entering step 3
    React.useEffect(() => {
        if (step === 3 && !resetToken) {
            console.warn('⚠️ No reset token for step 3, redirecting');
            toast(
                <CustomToast
                    type="warning"
                    titleId="profile.change_password.error_title"
                    message={intl.formatMessage({ id: 'profile.change_password.session_expired' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "warning" }
            );
            setStep(1);
            clearSavedState();
        }
    }, [step, resetToken, intl]);

    // Countdown timer
    React.useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0 && step === 2 && otpCode) {
            // Auto clear OTP when countdown expires
            setOTPCode('');
            toast(
                <CustomToast
                    type="warning"
                    titleId="profile.change_password.error_title"
                    message={intl.formatMessage({ id: 'profile.change_password.otp_expired_message' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "warning", toastId: "otp-expired" }
            );
        }
        return () => clearInterval(timer);
    }, [countdown, step, otpCode, intl]);

    const handleVerifyCurrentPassword = async (e) => {
        e.preventDefault();

        if (!currentPassword.trim()) {
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.change_password.error_title"
                    message={intl.formatMessage({ id: 'profile.change_password.current_password_required' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        setLoading(true);

        try {
            const response = await requestChangePassword(currentPassword);

            if (response.errCode !== 0) {
                // Clear password input for security and better UX
                setCurrentPassword('');

                toast(
                    <CustomToast
                        type="error"
                        titleId="profile.change_password.error_title"
                        message={response.errMessage || intl.formatMessage({ id: 'profile.change_password.verify_failed' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
                return;
            }

            setResetToken(response.resetToken);
            setStep(2);
            setCountdown(300);
            expiryTimeRef.current = null;

            toast(
                <CustomToast
                    type="success"
                    titleId="profile.change_password.success_title"
                    message={intl.formatMessage({ id: 'profile.change_password.otp_sent' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "success" }
            );

        } catch (error) {
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.change_password.error_title"
                    message={intl.formatMessage({ id: 'profile.change_password.server_error' })}
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
                    titleId="profile.change_password.error_title"
                    message={intl.formatMessage({ id: 'profile.change_password.otp_invalid' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        setLoading(true);

        try {
            const response = await verifyChangeOTP(phoneNumber, otpCode);

            if (response.errCode !== 0) {
                if (response.errCode === 429 || response.status === 429) {
                    toast(
                        <CustomToast
                            type="error"
                            titleId="profile.change_password.error_title"
                            message={intl.formatMessage({ id: 'profile.change_password.too_many_attempts' })}
                            time={new Date()}
                        />,
                        { closeButton: false, type: "error" }
                    );
                    setStep(1);
                    setOTPCode('');
                    setCountdown(0);
                    clearSavedState();
                } else {
                    const newAttempts = Math.max(0, attemptsRemaining - 1);
                    setAttemptsRemaining(newAttempts);

                    const errorMessage = response.errMessage || intl.formatMessage({ id: 'profile.change_password.otp_incorrect' });
                    const attemptsMessage = newAttempts > 0
                        ? intl.formatMessage({ id: 'profile.change_password.attempts_remaining' }, { count: newAttempts })
                        : '';

                    toast(
                        <CustomToast
                            type="error"
                            titleId="profile.change_password.error_title"
                            message={`${errorMessage} ${attemptsMessage}`}
                            time={new Date()}
                        />,
                        { closeButton: false, type: "error" }
                    );

                    setOTPCode('');

                    if (newAttempts === 0) {
                        setTimeout(() => {
                            setStep(1);
                            setCountdown(0);
                            clearSavedState();
                        }, 2000);
                    }
                }
                return;
            }

            setResetToken(response.resetToken);
            setStep(3);

            toast(
                <CustomToast
                    type="success"
                    titleId="profile.change_password.success_title"
                    message={intl.formatMessage({ id: 'profile.change_password.otp_verified' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "success" }
            );

        } catch (error) {
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.change_password.error_title"
                    message={intl.formatMessage({ id: 'profile.change_password.verify_otp_failed' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!newPassword) {
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.change_password.error_title"
                    message={intl.formatMessage({ id: 'profile.change_password.new_password_required' })}
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
                    titleId="profile.change_password.error_title"
                    message={intl.formatMessage({ id: 'profile.change_password.password_min_length' })}
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
                    titleId="profile.change_password.error_title"
                    message={intl.formatMessage({ id: 'profile.change_password.password_mismatch' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        setLoading(true);

        try {
            const response = await changePassword(resetToken, newPassword);

            if (response.errCode !== 0) {
                toast(
                    <CustomToast
                        type="error"
                        titleId="profile.change_password.error_title"
                        message={response.errMessage || intl.formatMessage({ id: 'profile.change_password.change_failed' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
                return;
            }

            clearSavedState();

            toast(
                <CustomToast
                    type="success"
                    titleId="profile.change_password.success_title"
                    message={intl.formatMessage({ id: 'profile.change_password.change_success' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "success" }
            );

            // Force logout after password change
            setTimeout(async () => {
                await logout();
                navigate('/login');
            }, 2000);

        } catch (error) {
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.change_password.error_title"
                    message={intl.formatMessage({ id: 'profile.change_password.server_error' })}
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
            const response = await requestChangePassword(currentPassword);
            if (response.errCode === 0) {
                setCountdown(300);
                setAttemptsRemaining(3); // Match backend maxAttempts
                setOTPCode('');
                expiryTimeRef.current = null;

                toast(
                    <CustomToast
                        type="success"
                        titleId="profile.change_password.success_title"
                        message={intl.formatMessage({ id: 'profile.change_password.otp_resent' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "success" }
                );
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToStep1 = async () => {
        if (phoneNumber) {
            try {
                await clearServerOTP(phoneNumber);
            } catch (error) {
                console.error('Clear OTP error:', error);
            }
        }

        setStep(1);
        setCurrentPassword('');
        setOTPCode('');
        setResetToken('');
        setCountdown(0);
        setAttemptsRemaining(3); // Match backend maxAttempts
        setLoading(false);
        clearSavedState();

        toast(
            <CustomToast
                type="info"
                titleId="profile.change_password.title"
                message={intl.formatMessage({ id: 'profile.change_password.back_to_step1' })}
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
        <div className="change-password">
            <div className="change-password__title">
                {step === 1 && <FormattedMessage id="profile.change_password.title" />}
                {step === 2 && <FormattedMessage id="profile.change_password.otp_title" />}
                {step === 3 && <FormattedMessage id="profile.change_password.new_password_title" />}
            </div>

            {step === 1 && (
                <form onSubmit={handleVerifyCurrentPassword} className="change-password__form">
                    <div className="change-password__field">
                        <label className="change-password__label">
                            <FormattedMessage id="profile.change_password.current_password_label" />
                        </label>
                        <div className="change-password__password-wrapper">
                            <input
                                className="change-password__input"
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder={intl.formatMessage({ id: 'profile.change_password.current_password_placeholder' })}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="change-password__eye-icon"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                <i className={showCurrentPassword ? "far fa-eye" : "far fa-eye-slash"}></i>
                            </button>
                        </div>
                    </div>

                    <button
                        className="change-password__btn change-password__btn--primary"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ?
                            <FormattedMessage id="profile.change_password.loading" /> :
                            <FormattedMessage id="profile.change_password.continue" />
                        }
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="change-password__form">
                    <div className="change-password__field">
                        <label className="change-password__label">
                            <FormattedMessage id="profile.change_password.otp_label" />
                        </label>
                        <input
                            className="change-password__input"
                            type="text"
                            placeholder={intl.formatMessage({ id: 'profile.change_password.otp_placeholder' })}
                            value={otpCode}
                            onChange={(e) => setOTPCode(e.target.value.replace(/\D/g, ''))}
                            maxLength="6"
                            disabled={loading || countdown === 0}
                        />
                        <small className="change-password__info">
                            <FormattedMessage
                                id="profile.change_password.otp_description"
                                values={{ phone: phoneNumber }}
                            />
                        </small>
                        {attemptsRemaining < 5 && (
                            <small className="change-password__warning">
                                <FormattedMessage
                                    id="profile.change_password.attempts_display"
                                    values={{ count: attemptsRemaining }}
                                />
                            </small>
                        )}
                    </div>

                    {countdown > 0 && (
                        <div className="change-password__timer">
                            <FormattedMessage
                                id="profile.change_password.expires_in"
                                values={{ time: formatTime(countdown) }}
                            />
                        </div>
                    )}

                    <button
                        className="change-password__btn change-password__btn--primary"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ?
                            <FormattedMessage id="profile.change_password.loading" /> :
                            <FormattedMessage id="profile.change_password.verify_otp" />
                        }
                    </button>

                    <div className="change-password__actions">
                        <button
                            type="button"
                            className="change-password__btn change-password__btn--link"
                            onClick={handleResendOTP}
                            disabled={countdown > 0 || loading}
                        >
                            {countdown > 0 ?
                                <FormattedMessage
                                    id="profile.change_password.resend_in"
                                    values={{ time: formatTime(countdown) }}
                                /> :
                                <FormattedMessage id="profile.change_password.resend_otp" />
                            }
                        </button>

                        <button
                            type="button"
                            className="change-password__btn change-password__btn--outline"
                            onClick={handleBackToStep1}
                            disabled={loading}
                        >
                            <i className="fas fa-arrow-left"></i>
                            <FormattedMessage id="profile.change_password.back" />
                        </button>
                    </div>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleChangePassword} className="change-password__form">
                    <div className="change-password__field">
                        <label className="change-password__label">
                            <FormattedMessage id="profile.change_password.new_password_label" />
                        </label>
                        <div className="change-password__password-wrapper">
                            <input
                                className="change-password__input"
                                type={showPassword ? "text" : "password"}
                                placeholder={intl.formatMessage({ id: 'profile.change_password.new_password_placeholder' })}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="change-password__eye-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={showPassword ? "far fa-eye" : "far fa-eye-slash"}></i>
                            </button>
                        </div>
                    </div>

                    <div className="change-password__field">
                        <label className="change-password__label">
                            <FormattedMessage id="profile.change_password.confirm_password_label" />
                        </label>
                        <div className="change-password__password-wrapper">
                            <input
                                className="change-password__input"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder={intl.formatMessage({ id: 'profile.change_password.confirm_password_placeholder' })}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="change-password__eye-icon"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <i className={showConfirmPassword ? "far fa-eye" : "far fa-eye-slash"}></i>
                            </button>
                        </div>
                    </div>

                    <button
                        className="change-password__btn change-password__btn--primary"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ?
                            <FormattedMessage id="profile.change_password.loading" /> :
                            <FormattedMessage id="profile.change_password.submit" />
                        }
                    </button>
                </form>
            )}
        </div>
    );
};

export default ChangePassword;

