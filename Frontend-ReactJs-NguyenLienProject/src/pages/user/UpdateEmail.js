import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast';
import { sendEmailOTP, verifyEmailOTPAndUpdate } from '../../services/emailService';
import { getUserProfile } from '../../services/userService';
import { adminLoginSuccess } from '../../store/reducers/adminReducer';
import './UpdateEmail.scss';

const UpdateEmail = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [newEmail, setNewEmail] = useState('');
    const [otpCode, setOTPCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [attemptsRemaining, setAttemptsRemaining] = useState(3);
    const [hasEmail, setHasEmail] = useState(false);
    const [currentEmail, setCurrentEmail] = useState('');

    const intl = useIntl();
    const dispatch = useDispatch();
    const { adminInfo } = useSelector((state) => state.admin);

    // Load current email on mount
    React.useEffect(() => {
        if (adminInfo?.email) {
            setHasEmail(true);
            setCurrentEmail(adminInfo.email);
        }
    }, [adminInfo]);

    // Countdown timer
    React.useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0 && step === 2 && otpCode) {
            setOTPCode('');
            toast(
                <CustomToast
                    type="warning"
                    titleId="profile.update_email.error_title"
                    message={intl.formatMessage({ id: 'profile.update_email.otp_expired' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "warning", toastId: "otp-expired" }
            );
        }
        return () => clearInterval(timer);
    }, [countdown, step, otpCode, intl]);

    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!newEmail.trim()) {
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.update_email.error_title"
                    message={intl.formatMessage({ id: 'profile.update_email.email_required' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.update_email.error_title"
                    message={intl.formatMessage({ id: 'profile.update_email.email_invalid' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        setLoading(true);

        try {
            const response = await sendEmailOTP(newEmail);

            if (response.errCode !== 0) {
                toast(
                    <CustomToast
                        type="error"
                        titleId="profile.update_email.error_title"
                        message={response.errMessage || intl.formatMessage({ id: 'profile.update_email.send_otp_failed' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
                return;
            }

            setResetToken(response.resetToken);
            setStep(2);
            setCountdown(900); // 15 minutes

            toast(
                <CustomToast
                    type="success"
                    titleId="profile.update_email.success_title"
                    message={intl.formatMessage({ id: 'profile.update_email.otp_sent' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "success" }
            );

        } catch (error) {
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.update_email.error_title"
                    message={intl.formatMessage({ id: 'profile.update_email.server_error' })}
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
                    titleId="profile.update_email.error_title"
                    message={intl.formatMessage({ id: 'profile.update_email.otp_invalid' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        setLoading(true);

        try {
            const response = await verifyEmailOTPAndUpdate(resetToken, otpCode);

            if (response.errCode !== 0) {
                if (response.errCode === 429 || response.status === 429) {
                    toast(
                        <CustomToast
                            type="error"
                            titleId="profile.update_email.error_title"
                            message={intl.formatMessage({ id: 'profile.update_email.too_many_attempts' })}
                            time={new Date()}
                        />,
                        { closeButton: false, type: "error" }
                    );
                    setStep(1);
                    setOTPCode('');
                    setCountdown(0);
                } else {
                    const newAttempts = response.attemptsRemaining !== undefined ? response.attemptsRemaining : Math.max(0, attemptsRemaining - 1);
                    setAttemptsRemaining(newAttempts);

                    const errorMessage = response.errMessage || intl.formatMessage({ id: 'profile.update_email.otp_incorrect' });
                    const attemptsMessage = newAttempts > 0
                        ? intl.formatMessage({ id: 'profile.update_email.attempts_remaining' }, { count: newAttempts })
                        : '';

                    toast(
                        <CustomToast
                            type="error"
                            titleId="profile.update_email.error_title"
                            message={`${errorMessage} ${attemptsMessage}`}
                            time={new Date()}
                        />,
                        { closeButton: false, type: "error" }
                    );

                    setOTPCode('');

                }
                return;
            }

            toast(
                <CustomToast
                    type="success"
                    titleId="profile.update_email.success_title"
                    message={intl.formatMessage({ id: 'profile.update_email.update_success' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "success" }
            );

            // Refresh user profile
            setTimeout(async () => {
                const profileResult = await getUserProfile();
                if (profileResult.errCode === 0 && profileResult.user) {
                    dispatch(adminLoginSuccess(profileResult.user));
                }

                // Reset form
                setStep(1);
                setNewEmail('');
                setOTPCode('');
                setResetToken('');
                setCountdown(0);
                setAttemptsRemaining(3);
            }, 1500);

        } catch (error) {
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.update_email.error_title"
                    message={intl.formatMessage({ id: 'profile.update_email.verify_failed' })}
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
            const response = await sendEmailOTP(newEmail);
            if (response.errCode === 0) {
                setResetToken(response.resetToken);
                setCountdown(900);
                setAttemptsRemaining(3);
                setOTPCode('');

                toast(
                    <CustomToast
                        type="success"
                        titleId="profile.update_email.success_title"
                        message={intl.formatMessage({ id: 'profile.update_email.otp_resent' })}
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

    const handleBackToStep1 = () => {
        setStep(1);
        setOTPCode('');
        setResetToken('');
        setCountdown(0);
        setAttemptsRemaining(3);
        setLoading(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="update-email">
            <div className="update-email__title">
                {step === 1 && <FormattedMessage id={hasEmail ? "profile.update_email.change_title" : "profile.update_email.add_title"} />}
                {step === 2 && <FormattedMessage id="profile.update_email.otp_title" />}
            </div>

            {step === 1 && (
                <form onSubmit={handleSendOTP} className="update-email__form">
                    {hasEmail && currentEmail && (
                        <div className="update-email__current">
                            <div className="update-email__current-label">
                                <FormattedMessage id="profile.update_email.current_email" />: <strong>{currentEmail}</strong>
                            </div>
                            <div className="update-email__warning">
                                <i className="fas fa-exclamation-triangle"></i>
                                <FormattedMessage id="profile.update_email.update_warning" />
                            </div>
                        </div>
                    )}

                    <div className="update-email__field">
                        <label className="update-email__label">
                            <FormattedMessage id={hasEmail ? "profile.update_email.new_email_label" : "profile.update_email.email_label"} />
                        </label>
                        <input
                            className="update-email__input"
                            type="email"
                            placeholder={intl.formatMessage({ id: 'profile.update_email.email_placeholder' })}
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            disabled={loading}
                        />
                        <small className="update-email__info">
                            <FormattedMessage id="profile.update_email.email_hint" />
                        </small>
                    </div>

                    <button
                        className="update-email__btn update-email__btn--primary"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ?
                            <FormattedMessage id="profile.update_email.loading" /> :
                            <FormattedMessage id="profile.update_email.send_otp" />
                        }
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="update-email__form">
                    <div className="update-email__otp-info">
                        <FormattedMessage
                            id="profile.update_email.otp_sent_to"
                            values={{ email: <strong>{newEmail}</strong> }}
                        />
                    </div>

                    <div className="update-email__field">
                        <label className="update-email__label">
                            <FormattedMessage id="profile.update_email.otp_label" />
                        </label>
                        <input
                            className="update-email__input"
                            type="text"
                            placeholder={intl.formatMessage({ id: 'profile.update_email.otp_placeholder' })}
                            value={otpCode}
                            onChange={(e) => setOTPCode(e.target.value.replace(/\D/g, ''))}
                            maxLength="6"
                            disabled={loading || countdown === 0}
                        />
                        {attemptsRemaining < 3 && (
                            <small className="update-email__warning">
                                <FormattedMessage
                                    id="profile.update_email.attempts_display"
                                    values={{ count: attemptsRemaining }}
                                />
                            </small>
                        )}
                    </div>

                    {countdown > 0 && (
                        <div className="update-email__timer">
                            <FormattedMessage
                                id="profile.update_email.expires_in"
                                values={{ time: formatTime(countdown) }}
                            />
                        </div>
                    )}

                    <button
                        className="update-email__btn update-email__btn--primary"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ?
                            <FormattedMessage id="profile.update_email.loading" /> :
                            <FormattedMessage id="profile.update_email.verify_otp" />
                        }
                    </button>

                    <div className="update-email__actions">
                        <button
                            type="button"
                            className="update-email__btn update-email__btn--link"
                            onClick={handleResendOTP}
                            disabled={countdown > 0 || loading}
                        >
                            {countdown > 0 ?
                                <FormattedMessage
                                    id="profile.update_email.resend_in"
                                    values={{ time: formatTime(countdown) }}
                                /> :
                                <FormattedMessage id="profile.update_email.resend_otp" />
                            }
                        </button>

                        <button
                            type="button"
                            className="update-email__btn update-email__btn--outline"
                            onClick={handleBackToStep1}
                            disabled={loading}
                        >
                            <i className="fas fa-arrow-left"></i>
                            <FormattedMessage id="profile.update_email.back" />
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default UpdateEmail;
