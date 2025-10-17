import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { getAnnouncementById, updateAnnouncement, toggleAnnouncementStatus } from '../../../../services/announcementService';
import { toast } from 'react-toastify';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';
import IconRenderer from '../../../../components/common/IconRenderer';
import AnnouncementActive from './AnnouncementActive';
import AnnouncementDelete from './AnnouncementDelete';
import './AnnouncementDetail.scss';

const AnnouncementDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const intl = useIntl();

    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [icon, setIcon] = useState('📢');
    const [endDate, setEndDate] = useState('');
    const [priority, setPriority] = useState(1);

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

    const priorityOptions = [
        { value: 1, label: '1 - Cao nhất' },
        { value: 2, label: '2 - Cao' },
        { value: 3, label: '3 - Trung bình' },
        { value: 4, label: '4 - Thấp' },
        { value: 5, label: '5 - Thấp nhất' }
    ];

    const showToast = (type, message) => {
        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type={type}
                    titleId={type === "success" ? "body_admin.announcement_management.detail.success_title" : "body_admin.announcement_management.detail.error_title"}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    };

    const fetchAnnouncement = async () => {
        try {
            setLoading(true);
            const res = await getAnnouncementById(id);

            if (res.errCode === 0) {
                const ann = res.announcement;
                setAnnouncement(ann);

                // Set form values
                setTitle(ann.title || '');
                setContent(ann.content || '');
                setIcon(ann.icon || '📢');
                setEndDate(ann.endDate ? new Date(ann.endDate).toISOString().slice(0, 16) : '');
                setPriority(ann.priority || 1);
            } else {
                showToast("error", res.errMessage || 'Không thể tải thông tin thông báo');
                navigate('/admin/homepage-management/announcement-management');
            }
        } catch (err) {
            console.error('Fetch announcement error:', err);
            showToast("error", 'Lỗi server khi tải thông tin thông báo');
            navigate('/admin/homepage-management/announcement-management');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (updating) return;

        setUpdating(true);
        try {
            const res = await toggleAnnouncementStatus(id);

            if (res.errCode === 0) {
                setAnnouncement(res.announcement);
                showToast("success",
                    res.announcement.isActive
                        ? intl.formatMessage({ id: 'body_admin.announcement_management.detail.activated', defaultMessage: 'Thông báo đã được kích hoạt' })
                        : intl.formatMessage({ id: 'body_admin.announcement_management.detail.deactivated', defaultMessage: 'Thông báo đã được ẩn' })
                );
            } else {
                showToast("error", res.errMessage || 'Không thể thay đổi trạng thái thông báo');
            }
        } catch (err) {
            console.error('Toggle status error:', err);
            showToast("error", 'Lỗi server khi thay đổi trạng thái');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdate = async () => {
        if (updating) return;

        // Validation
        if (!title.trim()) {
            showToast("error", intl.formatMessage({
                id: 'body_admin.announcement_management.detail.no_title',
                defaultMessage: 'Vui lòng nhập tiêu đề thông báo'
            }));
            return;
        }

        setUpdating(true);

        const data = {
            title: title.trim(),
            content: content.trim(),
            icon: icon,
            priority: priority,
            endDate: endDate || null
        };

        try {
            const res = await updateAnnouncement(id, data);

            if (res.errCode === 0) {
                setAnnouncement(res.announcement);
                setIsEditing(false);
                showToast("success", intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.updated',
                    defaultMessage: 'Cập nhật thông báo thành công'
                }));
            } else {
                showToast("error", res.errMessage || 'Không thể cập nhật thông báo');
            }
        } catch (err) {
            console.error('Update announcement error:', err);
            showToast("error", 'Lỗi server khi cập nhật thông báo');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        if (announcement) {
            setTitle(announcement.title || '');
            setContent(announcement.content || '');
            setIcon(announcement.icon || '📢');
            setEndDate(announcement.endDate ? new Date(announcement.endDate).toISOString().slice(0, 16) : '');
            setPriority(announcement.priority || 1);
        }
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleDeleteSuccess = () => {
        navigate('/admin/homepage-management/announcement-management');
    };

    const handleActiveSuccess = (announcementId, updatedAnnouncement) => {
        setAnnouncement(updatedAnnouncement);
    };

    useEffect(() => {
        if (id) {
            fetchAnnouncement();
        }
    }, [id]);

    const getTypeColor = (type) => {
        const colors = {
            'info': '#3b82f6',
            'warning': '#f59e0b',
            'success': '#10b981',
            'error': '#ef4444',
            'default': '#6b7280'
        };
        return colors[type] || colors.default;
    };

    const getTypeLabel = (type) => {
        const labels = {
            'info': 'Thông tin',
            'warning': 'Cảnh báo',
            'success': 'Thành công',
            'error': 'Lỗi',
            'default': 'Mặc định'
        };
        return labels[type] || labels.default;
    };

    const formatDate = (dateString) => {
        if (!dateString) return intl.formatMessage({ id: 'body_admin.announcement_management.detail.no_date', defaultMessage: 'Không có' });
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const isExpired = (endDate) => {
        if (!endDate) return false;
        return new Date(endDate) < new Date();
    };

    if (loading) {
        return (
            <div className="announcement-detail-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p><FormattedMessage id="body_admin.announcement_management.detail.loading" defaultMessage="Đang tải thông tin thông báo..." /></p>
                </div>
            </div>
        );
    }

    if (!announcement) {
        return (
            <div className="announcement-detail-container">
                <div className="error-state">
                    <div className="error-icon">❓</div>
                    <h2><FormattedMessage id="body_admin.announcement_management.detail.not_found_title" defaultMessage="Không tìm thấy thông báo" /></h2>
                    <p><FormattedMessage id="body_admin.announcement_management.detail.not_found" defaultMessage="Thông báo không tồn tại hoặc đã bị xóa" /></p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/admin/homepage-management/announcement-management')}
                    >
                        <FormattedMessage id="common.backToList" defaultMessage="Quay lại danh sách" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="announcement-detail-container">
            <HintBox
                content={
                    <div>
                        <p><FormattedMessage id="body_admin.announcement_management.detail.hint.title" defaultMessage="Chi tiết thông báo:" /></p>
                        <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                            <li><FormattedMessage id="body_admin.announcement_management.detail.hint.view_info" defaultMessage="Xem thông tin chi tiết thông báo" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.detail.hint.edit_mode" defaultMessage="Click 'Chỉnh sửa' để cập nhật thông tin" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.detail.hint.toggle_status" defaultMessage="Sử dụng nút 'Kích hoạt/Ẩn' để thay đổi trạng thái hiển thị" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.detail.hint.priority" defaultMessage="Độ ưu tiên quyết định thứ tự hiển thị (1 = cao nhất)" /></li>
                        </ul>
                    </div>
                }
            />

            <h1>
                <FormattedMessage id="body_admin.announcement_management.detail.title" defaultMessage="Thông tin thông báo" />
            </h1>

            <div className="announcement-detail-card">
                <div className="card-header">
                    <h2>
                        <IconRenderer icon={announcement.icon || '📢'} size="0.5rem" className="mr-3" />
                        {announcement.title || intl.formatMessage({ id: 'body_admin.announcement_management.detail.no_title', defaultMessage: 'Không có tiêu đề' })}
                    </h2>
                    <div className="announcement-id">ID: {announcement.id}</div>
                </div>

                <div className="card-body">
                    <div className="detail-grid">
                        <div className="detail-section">
                            <h3 className="basic-info"><FormattedMessage id="body_admin.announcement_management.detail.basic_info" defaultMessage="Thông tin cơ bản" /></h3>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.icon" defaultMessage="Biểu tượng" />:</span>
                                <span className="value">
                                    {isEditing ? (
                                        <select
                                            value={icon}
                                            onChange={(e) => setIcon(e.target.value)}
                                            style={{ fontSize: '16px', padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        >
                                            {emojiIcons.map(iconOption => (
                                                <option key={iconOption.value} value={iconOption.value}>
                                                    {iconOption.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <IconRenderer icon={announcement.icon || '📢'} size="large" />
                                    )}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.title_label" defaultMessage="Tiêu đề" />:</span>
                                <span className="value">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            style={{ width: '100%', padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                    ) : (
                                        <span className="announcement-title">{announcement.title}</span>
                                    )}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.content" defaultMessage="Nội dung" />:</span>
                                <span className="value description">
                                    {isEditing ? (
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows="3"
                                            style={{ width: '100%', padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                    ) : (
                                        announcement.content || intl.formatMessage({ id: 'body_admin.announcement_management.detail.no_content', defaultMessage: 'Không có nội dung' })
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3 className="settings-info"><FormattedMessage id="body_admin.announcement_management.detail.settings" defaultMessage="Cài đặt" /></h3>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.type" defaultMessage="Loại" />:</span>
                                <span className="value">
                                    <span
                                        className="type-badge"
                                        style={{
                                            backgroundColor: getTypeColor(announcement.type),
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {getTypeLabel(announcement.type)}
                                    </span>
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.priority" defaultMessage="Độ ưu tiên" />:</span>
                                <span className="value">
                                    {isEditing ? (
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(parseInt(e.target.value))}
                                            style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        >
                                            {priorityOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span
                                            className="priority-badge"
                                            style={{
                                                backgroundColor: announcement.priority >= 4 ? '#ef4444' : announcement.priority >= 3 ? '#f59e0b' : '#10b981',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '50%',
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                minWidth: '32px',
                                                display: 'inline-block',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {announcement.priority}
                                        </span>
                                    )}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.status" defaultMessage="Trạng thái" />:</span>
                                <span className="value">
                                    <span className={`badge ${announcement.isActive ? 'active' : 'inactive'}`}>
                                        {announcement.isActive ? (
                                            <FormattedMessage id="body_admin.announcement_management.detail.status_active" defaultMessage="Đang hiển thị" />
                                        ) : (
                                            <FormattedMessage id="body_admin.announcement_management.detail.status_inactive" defaultMessage="Đã ẩn" />
                                        )}
                                    </span>
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.end_date" defaultMessage="Hết hạn" />:</span>
                                <span className="value">
                                    {isEditing ? (
                                        <input
                                            type="datetime-local"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                    ) : (
                                        <span className={`end-date ${isExpired(announcement.endDate) ? 'expired' : ''}`}>
                                            {formatDate(announcement.endDate)}
                                            {isExpired(announcement.endDate) && (
                                                <span className="expired-badge"> (Đã hết hạn)</span>
                                            )}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3 className="timestamps"><FormattedMessage id="body_admin.announcement_management.detail.metadata" defaultMessage="Thông tin hệ thống" /></h3>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.created_at" defaultMessage="Ngày tạo" />:</span>
                                <span className="value">{formatDate(announcement.createdAt)}</span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.updated_at" defaultMessage="Cập nhật lần cuối" />:</span>
                                <span className="value">{formatDate(announcement.updatedAt)}</span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.position" defaultMessage="Vị trí" />:</span>
                                <span className="value">{announcement.position || 'top'}</span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.dismissible" defaultMessage="Có thể đóng" />:</span>
                                <span className="value">{announcement.isDismissible ? 'Có' : 'Không'}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3 className="preview-info"><FormattedMessage id="body_admin.announcement_management.detail.preview" defaultMessage="Xem trước" /></h3>

                            <div className="detail-item">
                                <span className="value">
                                    <div
                                        className="announcement-preview"
                                        style={{
                                            color: announcement.textColor || '#ffffff',
                                            padding: '16px 20px',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <strong style={{ fontSize: '1.1rem' }}>
                                            <IconRenderer
                                                icon={isEditing ? icon : announcement.icon || '📢'}
                                                size="medium"
                                                className="mr-2"
                                            />
                                            {isEditing ? title : announcement.title}
                                            {(isEditing ? content : announcement.content) && ` - ${isEditing ? content : announcement.content}`}
                                        </strong>
                                        {announcement.endDate && (
                                            <div style={{ fontSize: '0.875rem', marginTop: '8px', opacity: 0.8 }}>
                                                <FormattedMessage
                                                    id="body_admin.announcement_management.detail.expires_on"
                                                    defaultMessage="Hết hạn: {date}"
                                                    values={{ date: formatDate(announcement.endDate) }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="action-buttons">
                        {isEditing ? (
                            <>
                                <button
                                    className="btn-action btn-save"
                                    onClick={handleUpdate}
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <FormattedMessage id="body_admin.announcement_management.detail.saving" defaultMessage="Đang lưu..." />
                                    ) : (
                                        <FormattedMessage id="body_admin.announcement_management.detail.save" defaultMessage="Lưu thay đổi" />
                                    )}
                                </button>

                                <button
                                    className="btn-action btn-cancel"
                                    onClick={handleCancel}
                                    disabled={updating}
                                >
                                    <FormattedMessage id="body_admin.announcement_management.detail.cancel" defaultMessage="Hủy" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn-action btn-update" onClick={handleEdit}>
                                    <FormattedMessage id="body_admin.announcement_management.detail.edit_button" defaultMessage="Chỉnh sửa" />
                                </button>

                                <AnnouncementActive announcement={announcement} onSuccess={handleActiveSuccess} />

                                <AnnouncementDelete announcement={announcement} onSuccess={handleDeleteSuccess} />
                            </>
                        )}

                        <button className="btn-action btn-back" onClick={() => navigate('/admin/homepage-management/announcement-management')}>
                            <FormattedMessage id="body_admin.announcement_management.detail.back_button" defaultMessage="Quay lại" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetail;