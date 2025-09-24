import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast';
import { requestPasswordReset, verifyResetOTP, resetPassword } from '../../services/authService';
import './ForgotPassword.scss'; // Import SCSS riêng cho ForgotPassword

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

    const navigate = useNavigate();
    const intl = useIntl();

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
                toast(
                    <CustomToast
                        type="error"
                        titleId="forgot_password.otp_step.error_title"
                        message={response.errMessage || intl.formatMessage({ id: 'forgot_password.otp_step.errors.invalid_otp' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
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
                toast(
                    <CustomToast
                        type="success"
                        titleId="forgot_password.otp_step.success_title"
                        message={intl.formatMessage({ id: 'forgot_password.resent_message' })}
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