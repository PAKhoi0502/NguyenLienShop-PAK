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
        {
            value: '📢',
            label: `📢 ${intl.formatMessage({
                id: 'body_admin.announcement_management.create.general_icon',
                defaultMessage: 'Thông báo chung'
            })}`
        },
        {
            value: 'ℹ️',
            label: `ℹ️ ${intl.formatMessage({
                id: 'body_admin.announcement_management.create.info_icon',
                defaultMessage: 'Thông tin'
            })}`
        },
        {
            value: '✅',
            label: `✅ ${intl.formatMessage({
                id: 'body_admin.announcement_management.create.success_icon',
                defaultMessage: 'Thành công'
            })}`
        },
        {
            value: '⚠️',
            label: `⚠️ ${intl.formatMessage({
                id: 'body_admin.announcement_management.create.warning_icon',
                defaultMessage: 'Cảnh báo'
            })}`
        },
        {
            value: '🎉',
            label: `🎉 ${intl.formatMessage({
                id: 'body_admin.announcement_management.create.celebration_icon',
                defaultMessage: 'Chúc mừng'
            })}`
        },
        {
            value: '🔧',
            label: `🔧 ${intl.formatMessage({
                id: 'body_admin.announcement_management.create.maintenance_icon',
                defaultMessage: 'Bảo trì'
            })}`
        },
        {
            value: '🚀',
            label: `🚀 ${intl.formatMessage({
                id: 'body_admin.announcement_management.create.update_icon',
                defaultMessage: 'Cập nhật'
            })}`
        },
        {
            value: '🎁',
            label: `🎁 ${intl.formatMessage({
                id: 'body_admin.announcement_management.create.promotion_icon',
                defaultMessage: 'Khuyến mãi'
            })}`
        },
        {
            value: '💰',
            label: `💰 ${intl.formatMessage({
                id: 'body_admin.announcement_management.create.discount_icon',
                defaultMessage: 'Giảm giá'
            })}`
        },
        {
            value: '❌',
            label: `❌ ${intl.formatMessage({
                id: 'body_admin.announcement_management.create.error_icon',
                defaultMessage: 'Lỗi'
            })}`
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!title.trim()) {
            showToast("error", intl.formatMessage({
                id: 'body_admin.announcement_management.create.no_title',
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

    // Preview style is now handled by CSS class

    return (
        <div className="announcement-create-container">
            <HintBox
                content={
                    <div>
                        <p><FormattedMessage id="body_admin.announcement_management.create.hint.title" defaultMessage="Hướng dẫn tạo thông báo:" /></p>
                        <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                            <li><FormattedMessage id="body_admin.announcement_management.create.hint.1" defaultMessage="Tiêu đề là bắt buộc, nội dung là tùy chọn" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.create.hint.2" defaultMessage="Chọn biểu tượng phù hợp với nội dung thông báo" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.create.hint.3" defaultMessage="Thông báo được tạo ở trạng thái ẩn - sử dụng chức năng 'Hiển thị' để kích hoạt" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.create.hint.4" defaultMessage="Format hiển thị: [Icon] Tiêu đề - Nội dung" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.create.hint.5" defaultMessage="Các cài đặt khác (màu sắc, vị trí) sẽ được tự động thiết lập" /></li>
                        </ul>
                    </div>
                }
            />

            <h1><FormattedMessage id="body_admin.announcement_management.create.title" defaultMessage="Tạo Thông Báo Mới" /></h1>

            <form onSubmit={handleSubmit} className="announcement-create-form">
                {/* Basic Information */}
                <div className="form-section">

                    <div className="form-group">
                        <label>
                            <FormattedMessage id="body_admin.announcement_management.create.icon" defaultMessage="Biểu tượng:" />
                        </label>
                        <select
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="icon-select"
                        >
                            {emojiIcons.map(iconOption => (
                                <option key={iconOption.value} value={iconOption.value}>
                                    {iconOption.label}
                                </option>
                            ))}
                        </select>
                        <small>
                            {intl.formatMessage({
                                id: 'body_admin.announcement_management.create.icon_selected',
                                defaultMessage: 'Đã chọn:'
                            })} <span>{icon}</span>
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
                        <div className="preview-container">
                            <strong>
                                <span>{icon}</span>
                                {title || intl.formatMessage({
                                    id: 'body_admin.announcement_management.create.title_placeholder_preview',
                                    defaultMessage: 'Tiêu đề thông báo'
                                })}
                                {content && ` - ${content}`}
                            </strong>
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
