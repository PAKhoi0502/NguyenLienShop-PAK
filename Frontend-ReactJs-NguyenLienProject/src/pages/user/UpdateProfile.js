import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { updateUserProfile, getUserProfile } from '../../services/userService';
import { adminLoginSuccess } from '../../store/reducers/adminReducer';
import CustomToast from '../../components/CustomToast';
import 'react-toastify/dist/ReactToastify.css';
import './UpdateProfile.scss';

const UpdateProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const intl = useIntl();
    const { adminInfo } = useSelector((state) => state.admin);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        userName: '',
        fullName: '',
        birthday: '',
        gender: ''
    });

    // Initialize form with current user data
    useEffect(() => {
        if (adminInfo) {
            setFormData({
                userName: adminInfo.userName || '',
                fullName: adminInfo.fullName || '',
                birthday: adminInfo.birthday ? new Date(adminInfo.birthday).toISOString().split('T')[0] : '',
                gender: adminInfo.gender || ''
            });
        }
    }, [adminInfo]);

    // Get user initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // Handle avatar file selection
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.avatar.upload_failed"
                    message={intl.formatMessage({ id: 'profile.avatar.invalid_type' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.avatar.upload_failed"
                    message={intl.formatMessage({ id: 'profile.avatar.file_too_large' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        // Preview avatar
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setAvatarFile(file);
    };

    // Trigger file input click
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Get avatar URL
    const getAvatarUrl = () => {
        if (avatarPreview) return avatarPreview;
        if (adminInfo?.avatar) {
            return `${process.env.REACT_APP_BACKEND_URL}/uploads/${adminInfo.avatar}`;
        }
        return null;
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Validation function
    const validate = () => {
        // Validate userName
        if (!formData.userName || formData.userName.trim().length === 0) {
            return intl.formatMessage({
                id: 'update_profile.error.username_required',
                defaultMessage: 'Biệt danh là bắt buộc.'
            });
        }

        if (formData.userName.trim().length < 6) {
            return intl.formatMessage({
                id: 'update_profile.error.username_too_short',
                defaultMessage: 'Biệt danh phải có ít nhất 6 ký tự.'
            });
        }

        // Check for special characters (only allow letters, numbers, underscore, hyphen)
        const specialCharRegex = /[^a-zA-Z0-9_-]/;
        if (specialCharRegex.test(formData.userName.trim())) {
            return intl.formatMessage({
                id: 'update_profile.error.username_special_chars',
                defaultMessage: 'Biệt danh không được chứa ký tự đặc biệt.'
            });
        }

        // Validate fullName (optional but if provided, must be valid)
        if (formData.fullName && formData.fullName.trim().length > 0) {
            if (formData.fullName.trim().length < 2) {
                return intl.formatMessage({
                    id: 'update_profile.error.fullname_too_short',
                    defaultMessage: 'Họ và tên phải có ít nhất 2 ký tự.'
                });
            }

            if (formData.fullName.trim().length > 100) {
                return intl.formatMessage({
                    id: 'update_profile.error.fullname_too_long',
                    defaultMessage: 'Họ và tên không được vượt quá 100 ký tự.'
                });
            }
        }

        return '';
    };

    // Convert date from YYYY-MM-DD to dd/mm/yyyy
    const convertDateFormat = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const errMsg = validate();
        if (errMsg) {
            toast(
                <CustomToast
                    type="error"
                    titleId="update_profile.error"
                    message={errMsg}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();

            // Add form fields (trim string values)
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    let value = formData[key];

                    // Convert date format for birthday
                    if (key === 'birthday') {
                        value = convertDateFormat(value);
                    } else if (typeof value === 'string') {
                        value = value.trim();
                    }

                    formDataToSend.append(key, value);
                }
            });

            // Add avatar if selected
            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile);
            }

            const result = await updateUserProfile(formDataToSend);

            if (result.errCode === 0) {
                toast(
                    <CustomToast
                        type="success"
                        titleId="update_profile.success"
                        message={intl.formatMessage({ id: 'update_profile.success_message' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "success" }
                );

                // Refresh user info from server
                const profileResult = await getUserProfile();
                if (profileResult.errCode === 0 && profileResult.user) {
                    dispatch(adminLoginSuccess(profileResult.user));
                }

                // Navigate back to profile
                setTimeout(() => {
                    navigate('/profile');
                }, 1500);
            } else {
                toast(
                    <CustomToast
                        type="error"
                        titleId="update_profile.failed"
                        message={result.errMessage || intl.formatMessage({ id: 'update_profile.failed_message' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast(
                <CustomToast
                    type="error"
                    titleId="update_profile.error"
                    message={intl.formatMessage({ id: 'update_profile.error_message' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        navigate('/profile');
    };

    return (
        <div className="update-profile">
            <form onSubmit={handleSubmit}>
                {/* Avatar Section */}
                <div className="update-profile__avatar-section">
                    <div className="update-profile__avatar">
                        {getAvatarUrl() ? (
                            <img
                                src={getAvatarUrl()}
                                alt="Avatar"
                                className="update-profile__avatar-img"
                            />
                        ) : (
                            <span className="update-profile__avatar-initials">
                                {getInitials(formData.userName || formData.fullName)}
                            </span>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        className="update-profile__upload-btn"
                        onClick={handleUploadClick}
                    >
                        <FormattedMessage id="profile.change_photo" defaultMessage="Thay đổi ảnh" />
                    </button>
                </div>

                {/* Form Fields */}
                <div className="update-profile__fields">
                    {/* Username - Biệt danh */}
                    <div className="update-profile__field">
                        <label className="update-profile__label">
                            <FormattedMessage id="profile.username" defaultMessage="Biệt danh" />
                        </label>
                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleInputChange}
                            className="update-profile__input"
                            placeholder={intl.formatMessage({ id: 'update_profile.username_placeholder', defaultMessage: 'Nhập biệt danh' })}
                        />
                    </div>

                    {/* Full Name - Họ và tên */}
                    <div className="update-profile__field">
                        <label className="update-profile__label">
                            <FormattedMessage id="profile.fullname" defaultMessage="Họ và tên" />
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="update-profile__input"
                            placeholder={intl.formatMessage({ id: 'update_profile.fullname_placeholder', defaultMessage: 'Nhập họ và tên' })}
                        />
                    </div>

                    {/* Birthday - Ngày sinh */}
                    <div className="update-profile__field">
                        <label className="update-profile__label">
                            <FormattedMessage id="profile.birthday" defaultMessage="Ngày sinh" />
                        </label>
                        <input
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleInputChange}
                            className="update-profile__input"
                        />
                    </div>

                    {/* Gender - Giới tính */}
                    <div className="update-profile__field">
                        <label className="update-profile__label">
                            <FormattedMessage id="profile.gender" defaultMessage="Giới tính" />
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="update-profile__input update-profile__select"
                        >
                            <option value="">
                                {intl.formatMessage({ id: 'update_profile.select_gender', defaultMessage: '-- Chọn giới tính --' })}
                            </option>
                            <option value="M">
                                {intl.formatMessage({ id: 'profile.gender.male', defaultMessage: 'Nam' })}
                            </option>
                            <option value="F">
                                {intl.formatMessage({ id: 'profile.gender.female', defaultMessage: 'Nữ' })}
                            </option>
                            <option value="O">
                                {intl.formatMessage({ id: 'profile.gender.other', defaultMessage: 'Khác' })}
                            </option>
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="update-profile__actions">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="update-profile__btn update-profile__btn--secondary"
                        disabled={isSubmitting}
                    >
                        <FormattedMessage id="common.cancel" defaultMessage="Hủy" />
                    </button>
                    <button
                        type="submit"
                        className="update-profile__btn update-profile__btn--primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <FormattedMessage id="common.loading" defaultMessage="Đang tải..." />
                        ) : (
                            <FormattedMessage id="common.update" defaultMessage="Cập nhật" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateProfile;

