import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomToast from '../../../../components/CustomToast';
import { createAnnouncement } from '../../../../services/announcementService';
import { useIntl, FormattedMessage } from 'react-intl';
import HintBox from '../../../../components/HintBox';
import './AnnouncementCreate.scss';

const AnnouncementCreate = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [icon, setIcon] = useState('📢');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const intl = useIntl();

    // Predefined emoji icons for selection
    const emojiIcons = [
        { value: '📢', label: '📢 Thông báo chung' },
        { value: 'ℹ️', label: 'ℹ️ Thông tin' },
        { value: '✅', label: '✅ Thành công' },
        { value: '⚠️', label: '⚠️ Cảnh báo' },
        { value: '🎉', label: '🎉 Chúc mừng' },
        { value: '🔧', label: '🔧 Bảo trì' },
        { value: '🚀', label: '🚀 Cập nhật' },
        { value: '🎁', label: '🎁 Khuyến mãi' },
        { value: '💰', label: '💰 Giảm giá' },
        { value: '❌', label: '❌ Lỗi' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!title.trim()) {
            showToast("error", intl.formatMessage({
                id: 'body_admin.announcement_management_management.create.no_title',
                defaultMessage: 'Vui lòng nhập tiêu đề thông báo'
            }));
            return;
        }

        if (!content.trim()) {
            showToast("error", intl.formatMessage({
                id: 'body_admin.announcement_management.create.no_content',
                defaultMessage: 'Vui lòng nhập nội dung thông báo'
            }));
            return;
        }

        setLoading(true);

        const data = {
            title: title.trim(),
            content: content.trim(),
            icon: icon,
            type: 'info',
            priority: 1,
            isActive: false,
            isDismissible: true,
            backgroundColor: '#3b82f6',
            textColor: '#ffffff',
            position: 'top',
            startDate: null,
            endDate: null
        };

        try {
            const res = await createAnnouncement(data);

            if (res && res.errCode === 0) {
                showToast("success", intl.formatMessage({
                    id: 'body_admin.announcement_management.create.success',
                    defaultMessage: 'Tạo thông báo thành công'
                }));
                navigate('/admin/homepage-management/announcement-management');
            } else {
                showToast("error", res.errMessage || intl.formatMessage({
                    id: 'body_admin.announcement_management.create.error',
                    defaultMessage: 'Không thể tạo thông báo'
                }));
            }
        } catch (err) {
            console.error('Create announcement error:', err);
            showToast("error", intl.formatMessage({
                id: 'body_admin.announcement_management.create.server_error',
                defaultMessage: 'Lỗi server khi tạo thông báo'
            }));
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, message) => {
        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type={type}
                    titleId={type === "success" ? "body_admin.announcement_management.create.create_success_title" : "body_admin.announcement_management.create.create_error_title"}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    };

    const previewStyle = {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        padding: '12px 16px',
        borderRadius: '8px',
        margin: '8px 0',
        border: '1px solid #e5e7eb'
    };

    return (
        <div className="announcement-create-container">
            <HintBox
                content={
                    <div>
                        <p><FormattedMessage id="body_admin.announcement_management.create.hint.title" defaultMessage="Hướng dẫn tạo thông báo:" /></p>
                        <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                            <li><FormattedMessage id="body_admin.announcement_management.create.hint.title_required" defaultMessage="Tiêu đề là bắt buộc, nội dung là tùy chọn" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.create.hint.icon_select" defaultMessage="Chọn biểu tượng phù hợp với nội dung thông báo" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.create.hint.default_hidden" defaultMessage="Thông báo được tạo ở trạng thái ẩn - sử dụng chức năng 'Hiển thị' để kích hoạt" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.create.hint.format" defaultMessage="Format hiển thị: [Icon] Tiêu đề - Nội dung" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.create.hint.auto_settings" defaultMessage="Các cài đặt khác (màu sắc, vị trí) sẽ được tự động thiết lập" /></li>
                        </ul>
                    </div>
                }
            />

            <h1><FormattedMessage id="body_admin.announcement_management.create.title" defaultMessage="Tạo Thông Báo Mới" /></h1>

            <form onSubmit={handleSubmit} className="announcement-create-form">
                {/* Basic Information */}
                <div className="form-section">
                    <h3><FormattedMessage id="body_admin.announcement_management.create.basic_info" defaultMessage="Thông tin cơ bản" /></h3>

                    <div className="form-group">
                        <label>
                            <FormattedMessage id="body_admin.announcement_management.create.icon" defaultMessage="Biểu tượng:" />
                        </label>
                        <select
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            style={{ fontSize: '16px', padding: '8px' }}
                        >
                            {emojiIcons.map(iconOption => (
                                <option key={iconOption.value} value={iconOption.value}>
                                    {iconOption.label}
                                </option>
                            ))}
                        </select>
                        <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                            Đã chọn: <span style={{ fontSize: '18px' }}>{icon}</span>
                        </small>
                    </div>

                    <div className="form-group">
                        <label>
                            <FormattedMessage id="body_admin.announcement_management.create.title_label" defaultMessage="Tiêu đề:" />
                            <span>*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={intl.formatMessage({
                                id: 'body_admin.announcement_management.create.title_placeholder',
                                defaultMessage: 'Nhập tiêu đề thông báo'
                            })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FormattedMessage id="body_admin.announcement_management.create.content_label" defaultMessage="Nội dung:" />
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={intl.formatMessage({
                                id: 'body_admin.announcement_management.create.content_placeholder',
                                defaultMessage: 'Nhập nội dung thông báo (tùy chọn)'
                            })}
                            rows="3"
                        />
                    </div>

                    {/* Preview */}
                    <div className="form-group">
                        <label><FormattedMessage id="body_admin.announcement_management.create.preview" defaultMessage="Xem trước:" /></label>
                        <div style={previewStyle}>
                            <strong>
                                <span style={{ fontSize: '18px', marginRight: '8px' }}>{icon}</span>
                                {title || 'Tiêu đề thông báo'}
                                {content && ` - ${content}`}
                            </strong>
                            <div style={{ fontSize: '0.875rem', marginTop: '4px', opacity: 0.8 }}>
                                <FormattedMessage
                                    id="body_admin.announcement_management.create.status_hidden"
                                    defaultMessage="Trạng thái: Ẩn (sử dụng chức năng 'Hiển thị' để kích hoạt)"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button className="btn-submit" type="submit" disabled={loading}>
                        {loading ?
                            <FormattedMessage id="body_admin.announcement_management.create.loading" defaultMessage="Đang tạo..." /> :
                            <FormattedMessage id="body_admin.announcement_management.create.submit" defaultMessage="Tạo Thông Báo" />
                        }
                    </button>
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate('/admin/homepage-management/announcement-management')}
                        disabled={loading}
                    >
                        <FormattedMessage id="body_admin.announcement_management.create.cancel" defaultMessage="Hủy" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AnnouncementCreate;
