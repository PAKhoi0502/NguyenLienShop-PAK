import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { getAnnouncements } from '../../../../services/announcementService';
import AnnouncementActive from './AnnouncementActive';
import AnnouncementDelete from './AnnouncementDelete';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';
import IconRenderer from '../../../../components/common/IconRenderer';
import './AnnouncementManager.scss';

const AnnouncementManager = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType] = useState('all');
    const navigate = useNavigate();
    const intl = useIntl();

    const showToast = useCallback((type, message) => {
        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type={type}
                    titleId={type === "error" ? "body_admin.announcement_management.manager.error_title" : "body_admin.announcement_management.manager.success_title"}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    }, []);

    // Helper function to check if announcement is expired
    const isAnnouncementExpired = (announcement) => {
        if (!announcement.endDate) return false;
        const currentDate = new Date();
        const endDate = new Date(announcement.endDate);
        return endDate < currentDate;
    };

    // Helper function to format date display
    const formatDate = (dateString) => {
        if (!dateString) return intl.formatMessage({ id: 'body_admin.announcement_management.manager.unlimited', defaultMessage: 'Không giới hạn' });
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const fetchAnnouncements = useCallback(async () => {
        try {
            const res = await getAnnouncements();
            if (res.errCode === 0) {
                setAnnouncements(Array.isArray(res.announcements) ? res.announcements : []);
            } else {
                showToast("error", res.errMessage || intl.formatMessage({
                    id: 'body_admin.announcement_management.manager.load_error_fallback',
                    defaultMessage: 'Không thể tải danh sách thông báo'
                }));
            }
        } catch (err) {
            console.error('Fetch announcements error:', err);
            showToast("error", intl.formatMessage({ id: 'body_admin.announcement_management.manager.load_error', defaultMessage: 'Không thể tải danh sách thông báo' }));
        } finally {
            setLoading(false);
        }
    }, [intl, showToast]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    useEffect(() => {
        const keyword = search.trim().toLowerCase();
        const filtered = announcements.filter(announcement => {
            const matchSearch =
                (announcement.title || '').toLowerCase().includes(keyword) ||
                (announcement.content || '').toLowerCase().includes(keyword) ||
                String(announcement.id).includes(keyword) ||
                (announcement.icon || '').includes(keyword);

            const matchStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && announcement.isActive) ||
                (filterStatus === 'inactive' && !announcement.isActive);

            const matchType =
                filterType === 'all' ||
                announcement.type === filterType;

            return matchSearch && matchStatus && matchType;
        });

        setFilteredAnnouncements(filtered);
    }, [search, announcements, filterStatus, filterType]);

    const handleDetailClick = (announcement) => {
        navigate(`/admin/homepage-management/announcement-management/announcement-detail/${announcement.id}`);
    };

    const handleUpdateClick = (clickedAnnouncement) => {
        const realAnnouncement = announcements.find(a => a.id === clickedAnnouncement.id);
        if (realAnnouncement?.isActive) {
            showToast("error", intl.formatMessage({
                id: 'body_admin.announcement_management.manager.update_blocked',
                defaultMessage: 'Vui lòng ẩn thông báo trước khi cập nhật'
            }));
            return;
        }
        navigate(`/admin/homepage-management/announcement-management/announcement-update/${clickedAnnouncement.id}`);
    };

    const getTypeLabel = (type) => {
        const typeLabels = {
            'info': intl.formatMessage({ id: 'body_admin.announcement_management.manager.type_info', defaultMessage: 'Thông tin' }),
            'warning': intl.formatMessage({ id: 'body_admin.announcement_management.manager.type_warning', defaultMessage: 'Cảnh báo' }),
            'success': intl.formatMessage({ id: 'body_admin.announcement_management.manager.type_success', defaultMessage: 'Thành công' }),
            'error': intl.formatMessage({ id: 'body_admin.announcement_management.manager.type_error', defaultMessage: 'Lỗi' })
        };
        return typeLabels[type] || type;
    };

    const getTypeColor = (type) => {
        const typeColors = {
            'info': '#3b82f6',
            'warning': '#f59e0b',
            'success': '#10b981',
            'error': '#ef4444'
        };
        return typeColors[type] || '#6b7280';
    };

    return (
        <div className="announcement-manager-container">
            <div className="announcement-manager-top">
                <h1 className="announcement-title">
                    <FormattedMessage id="body_admin.announcement_management.manager.title_head" defaultMessage="Quản lý thông báo" />
                </h1>
                <button
                    className="btn-create-announcement"
                    onClick={() => navigate('/admin/homepage-management/announcement-management/announcement-create')}
                >
                    + <FormattedMessage id="body_admin.announcement_management.manager.create_button" defaultMessage="Tạo thông báo" />
                </button>
            </div>

            <div className="announcement-filters">
                <HintBox
                    theme="announcement"
                    content={
                        <div>
                            <p><FormattedMessage id="body_admin.announcement_management.manager.hint_title" defaultMessage="Quản lý tất cả thông báo hệ thống" /></p>
                            <ul>
                                <li><FormattedMessage id="body_admin.announcement_management.manager.hint_1" defaultMessage="Sử dụng nút 'Tạo thông báo' để thêm thông báo mới vào hệ thống." /></li>
                                <li><FormattedMessage id="body_admin.announcement_management.manager.hint_2" defaultMessage="Click vào tên thông báo để xem chi tiết." /></li>
                                <li><FormattedMessage id="body_admin.announcement_management.manager.hint_3" defaultMessage="Sử dụng bộ lọc để tìm thông báo theo trạng thái hiển thị." /></li>
                                <li><FormattedMessage id="body_admin.announcement_management.manager.hint_4" defaultMessage="Chức năng tìm kiếm hỗ trợ tìm theo tiêu đề, nội dung, ID, icon." /></li>
                                <li><FormattedMessage id="body_admin.announcement_management.manager.hint_5" defaultMessage="Quản lý loại thông báo thông qua nút 'Loại'." /></li>
                            </ul>
                        </div>
                    }
                />

                <label><FormattedMessage id="body_admin.announcement_management.manager.filter_status" defaultMessage="Lọc trạng thái:" /></label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all"><FormattedMessage id="body_admin.announcement_management.manager.filter_all" defaultMessage="Tất cả" /></option>
                    <option value="active"><FormattedMessage id="body_admin.announcement_management.manager.filter_active" defaultMessage="Đang hiển thị" /></option>
                    <option value="inactive"><FormattedMessage id="body_admin.announcement_management.manager.filter_inactive" defaultMessage="Đã ẩn" /></option>
                </select>
            </div>

            <div className="announcement-search-bar">
                <input
                    type="text"
                    placeholder={intl.formatMessage({ id: 'body_admin.announcement_management.manager.search_placeholder', defaultMessage: 'Tìm theo tiêu đề, nội dung, ID, icon...' })}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <p className="announcement-loading"><FormattedMessage id="body_admin.announcement_management.manager.loading" defaultMessage="Đang tải thông báo..." /></p>
            ) : (
                <div className="announcement-table-wrapper">
                    <table className="announcement-table">
                        <thead>
                            <tr>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>ID</th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.announcement_management.manager.icon" defaultMessage="Icon" /></th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.announcement_management.manager.title" defaultMessage="Tiêu đề" /></th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.announcement_management.manager.type" defaultMessage="Loại" /></th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.announcement_management.manager.priority" defaultMessage="Độ ưu tiên" /></th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.announcement_management.manager.expiry" defaultMessage="Thời gian kết thúc" /></th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.announcement_management.manager.status" defaultMessage="Hiển thị" /></th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.announcement_management.manager.actions" defaultMessage="Hành động" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAnnouncements.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', color: '#888' }}>
                                        <FormattedMessage id="body_admin.announcement_management.manager.empty_body" defaultMessage="Không có thông báo nào phù hợp." />
                                    </td>
                                </tr>
                            ) : (
                                filteredAnnouncements.map((announcement) => (
                                    <tr key={announcement.id}>
                                        <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{announcement.id}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <IconRenderer
                                                icon={announcement.icon || '📢'}
                                                size="medium"
                                            />
                                        </td>
                                        <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                            <span
                                                className="announcement-title-link"
                                                onClick={() => handleDetailClick(announcement)}
                                                title={intl.formatMessage({ id: 'body_admin.announcement_management.manager.detail_title', defaultMessage: 'Click để xem chi tiết' })}
                                            >
                                                {announcement.title || intl.formatMessage({
                                                    id: 'body_admin.announcement_management.manager.no_title',
                                                    defaultMessage: 'N/A'
                                                })}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className="announcement-type-badge"
                                                style={{
                                                    backgroundColor: getTypeColor(announcement.type),
                                                    color: 'white',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {getTypeLabel(announcement.type)}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className="priority-badge"
                                                style={{
                                                    backgroundColor: announcement.priority >= 4 ? '#ef4444' : announcement.priority >= 3 ? '#f59e0b' : '#10b981',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: '50%',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold',
                                                    minWidth: '24px',
                                                    display: 'inline-block',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {announcement.priority || 1}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '1rem' }}>
                                                <div style={{ color: isAnnouncementExpired(announcement) ? '#ef4444' : '#6b7280' }}>
                                                    {formatDate(announcement.endDate)}
                                                </div>
                                                {isAnnouncementExpired(announcement) && (
                                                    <div style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 'bold' }}>
                                                        {intl.formatMessage({
                                                            id: 'body_admin.announcement_management.manager.expired_label',
                                                            defaultMessage: '⚠️ Đã hết hạn'
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="status-cell" style={{ cursor: 'default' }}>
                                            {announcement.isActive ? (
                                                <FormattedMessage id="body_admin.announcement_management.manager.status_active" defaultMessage="Đang hiển thị ✅" />
                                            ) : (
                                                <FormattedMessage id="body_admin.announcement_management.manager.status_inactive" defaultMessage="Đã ẩn ❌" />
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action btn-detail"
                                                    onClick={() => handleDetailClick(announcement)}
                                                >
                                                    <FormattedMessage id="body_admin.announcement_management.manager.detail" defaultMessage="Chi tiết" />
                                                </button>
                                                <button
                                                    className="btn-action btn-update"
                                                    onClick={() => handleUpdateClick(announcement)}
                                                >
                                                    <FormattedMessage id="body_admin.announcement_management.manager.update" defaultMessage="Cập nhật" />
                                                </button>
                                                <AnnouncementActive
                                                    announcement={announcement}
                                                    onSuccess={(announcementId, updatedAnnouncement) => {
                                                        setAnnouncements(prev => prev.map(a => a.id === announcementId ? updatedAnnouncement : a));
                                                    }}
                                                />
                                                <AnnouncementDelete
                                                    announcement={announcement}
                                                    onSuccess={(deletedAnnouncementId) => {
                                                        setAnnouncements(prev => prev.filter(a => a.id !== deletedAnnouncementId));
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AnnouncementManager;
