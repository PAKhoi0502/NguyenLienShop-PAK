import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { updateUserProfile, getUserProfile } from '../../services/userService';
import { adminLoginSuccess } from '../../store/reducers/adminReducer';
import CustomToast from '../../components/CustomToast';
import 'react-toastify/dist/ReactToastify.css';
import './ProfileInfo.scss';

const ProfileInfo = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const intl = useIntl();
    const { adminInfo } = useSelector((state) => state.admin);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Get user initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // Handle avatar file selection
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.profile_info.avatar.upload_failed"
                    message={intl.formatMessage({ id: 'profile.profile_info.avatar.invalid_type' })}
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
                    titleId="profile.profile_info.avatar.upload_failed"
                    message={intl.formatMessage({ id: 'profile.profile_info.avatar.file_too_large' })}
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

        // Upload avatar
        await handleUploadAvatar(file);
    };

    // Upload avatar to server
    const handleUploadAvatar = async (file) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const result = await updateUserProfile(formData);

            if (result.errCode === 0) {
                toast(
                    <CustomToast
                        type="success"
                        titleId="profile.profile_info.avatar.upload_success"
                        message={intl.formatMessage({ id: 'profile.profile_info.avatar.update_success' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "success" }
                );

                // Refresh user info from server
                const profileResult = await getUserProfile();
                if (profileResult.errCode === 0 && profileResult.user) {
                    dispatch(adminLoginSuccess(profileResult.user));
                }
            } else {
                toast(
                    <CustomToast
                        type="error"
                        titleId="profile.profile_info.avatar.update_failed"
                        message={result.errMessage || intl.formatMessage({ id: 'profile.profile_info.avatar.update_failed' })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
                setAvatarPreview(null);
            }
        } catch (error) {
            console.error('Upload avatar error:', error);
            toast(
                <CustomToast
                    type="error"
                    titleId="profile.profile_info.avatar.update_failed"
                    message={intl.formatMessage({ id: 'profile.profile_info.avatar.upload_error' })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
            setAvatarPreview(null);
        } finally {
            setIsUploading(false);
        }
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

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return intl.formatMessage({ id: 'profile.profile_info.empty', defaultMessage: 'Không có' });
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Get gender display
    const getGenderDisplay = (gender) => {
        if (!gender) return intl.formatMessage({ id: 'profile.profile_info.empty', defaultMessage: 'Không có' });
        if (gender === 'M' || gender === 'male' || gender === 'Male') {
            return intl.formatMessage({ id: 'profile.profile_info.gender_display.male', defaultMessage: 'Nam' });
        } else if (gender === 'F' || gender === 'female' || gender === 'Female') {
            return intl.formatMessage({ id: 'profile.profile_info.gender_display.female', defaultMessage: 'Nữ' });
        } else if (gender === 'O' || gender === 'other' || gender === 'Other') {
            return intl.formatMessage({ id: 'profile.profile_info.gender_display.other', defaultMessage: 'Khác' });
        }
        return gender;
    };

    return (
        <div className="profile-info">
            {/* Avatar Section */}
            <div className="profile-info__avatar-section">
                <div className="profile-info__avatar">
                    {getAvatarUrl() ? (
                        <img
                            src={getAvatarUrl()}
                            alt="Avatar"
                            className="profile-info__avatar-img"
                        />
                    ) : (
                        <span className="profile-info__avatar-initials">
                            {getInitials(adminInfo?.userName)}
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
                    className="profile-info__upload-btn"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        intl.formatMessage({ id: 'profile.profile_info.avatar.loading', defaultMessage: 'Đang tải...' })
                    ) : (
                        <FormattedMessage id="profile.profile_info.avatar.change_photo" defaultMessage="Thay đổi ảnh" />
                    )}
                </button>
            </div>

            {/* Info Fields */}
            <div className="profile-info__fields">
                {/* Username - Biệt danh */}
                <div className="profile-info__field">
                    <label className="profile-info__label">
                        <FormattedMessage id="profile.profile_info.username" defaultMessage="Biệt danh" />
                    </label>
                    <div className={`profile-info__value ${!adminInfo?.userName ? 'profile-info__value--empty' : ''}`}>
                        {adminInfo?.userName || intl.formatMessage({ id: 'profile.profile_info.empty', defaultMessage: 'Không có' })}
                    </div>
                </div>

                {/* Full Name - Họ và tên */}
                <div className="profile-info__field">
                    <label className="profile-info__label">
                        <FormattedMessage id="profile.profile_info.fullname" defaultMessage="Họ và tên" />
                    </label>
                    <div className={`profile-info__value ${!adminInfo?.fullName ? 'profile-info__value--empty' : ''}`}>
                        {adminInfo?.fullName || intl.formatMessage({ id: 'profile.profile_info.empty', defaultMessage: 'Không có' })}
                    </div>
                </div>

                {/* Phone Number - Số điện thoại */}
                <div className="profile-info__field">
                    <label className="profile-info__label">
                        <FormattedMessage id="profile.profile_info.phone" defaultMessage="Số điện thoại" />
                    </label>
                    <div className={`profile-info__value ${!adminInfo?.phoneNumber ? 'profile-info__value--empty' : ''}`}>
                        {adminInfo?.phoneNumber || intl.formatMessage({ id: 'profile.profile_info.empty', defaultMessage: 'Không có' })}
                    </div>
                </div>

                {/* Email */}
                <div className="profile-info__field">
                    <label className="profile-info__label">
                        <FormattedMessage id="profile.profile_info.email" defaultMessage="Email" />
                    </label>
                    <div className={`profile-info__value ${!adminInfo?.email ? 'profile-info__value--empty' : ''}`}>
                        {adminInfo?.email || intl.formatMessage({ id: 'profile.profile_info.empty', defaultMessage: 'Không có' })}
                    </div>
                </div>

                {/* Birthday - Ngày sinh */}
                <div className="profile-info__field">
                    <label className="profile-info__label">
                        <FormattedMessage id="profile.profile_info.birthday" defaultMessage="Ngày sinh" />
                    </label>
                    <div className={`profile-info__value ${!adminInfo?.birthday ? 'profile-info__value--empty' : ''}`}>
                        {formatDate(adminInfo?.birthday)}
                    </div>
                </div>

                {/* Gender - Giới tính */}
                <div className="profile-info__field">
                    <label className="profile-info__label">
                        <FormattedMessage id="profile.profile_info.gender" defaultMessage="Giới tính" />
                    </label>
                    <div className={`profile-info__value ${!adminInfo?.gender ? 'profile-info__value--empty' : ''}`}>
                        {getGenderDisplay(adminInfo?.gender)}
                    </div>
                </div>

                {/* Created At - Ngày tạo tài khoản */}
                <div className="profile-info__field">
                    <label className="profile-info__label">
                        <FormattedMessage id="profile.profile_info.created_at" defaultMessage="Ngày tạo tài khoản" />
                    </label>
                    <div className={`profile-info__value ${!adminInfo?.createdAt ? 'profile-info__value--empty' : ''}`}>
                        {formatDate(adminInfo?.createdAt)}
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="profile-info__actions">
                <button
                    className="profile-info__btn profile-info__btn--primary"
                    onClick={() => navigate('/profile/update-user')}
                >
                    <FormattedMessage id="profile.profile_info.edit" defaultMessage="Chỉnh sửa thông tin" />
                </button>
            </div>
        </div>
    );
};

export default ProfileInfo;

