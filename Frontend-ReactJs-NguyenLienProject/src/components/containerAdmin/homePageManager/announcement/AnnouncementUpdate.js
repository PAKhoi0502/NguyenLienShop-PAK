import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useIntl, FormattedMessage } from 'react-intl';
import Swal from 'sweetalert2';
import { getAnnouncements, updateAnnouncement } from '../../../../services/announcementService';
import './AnnouncementCreate.scss';

const AnnouncementUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const intl = useIntl();

    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const res = await getAnnouncements();
                if (res.errCode === 0) {
                    const found = res.announcements.find(item => String(item.id) === String(id));
                    if (!found) {
                        toast.error(intl.formatMessage({ id: 'body_admin.announcement.update.not_found', defaultMessage: 'Không tìm thấy thông báo' }));
                        return navigate('/admin/homepage-management/announcement-management');
                    }
                    setAnnouncement(found);
                } else {
                    toast.error(res.errMessage || 'Không thể tải danh sách thông báo');
                }
            } catch (err) {
                console.error(err);
                toast.error(intl.formatMessage({ id: 'body_admin.announcement.update.load_error', defaultMessage: 'Lỗi khi tải thông báo' }));
                navigate('/admin/homepage-management/announcement-management');
            }
        };
        fetchAnnouncement();
    }, [id, navigate]);

    const handleChange = (field, value) => {
        setAnnouncement({ ...announcement, [field]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!announcement.title || !announcement.title.trim()) {
            toast.error(intl.formatMessage({ id: 'body_admin.announcement.update.no_title', defaultMessage: 'Vui lòng nhập tiêu đề thông báo' }));
            return;
        }

        if (!announcement.content || !announcement.content.trim()) {
            toast.error(intl.formatMessage({ id: 'body_admin.announcement.update.no_content', defaultMessage: 'Vui lòng nhập nội dung thông báo' }));
            return;
        }

        // Step 1: Initial Confirmation
        const confirmFirst = await Swal.fire({
            title: intl.formatMessage({ id: 'body_admin.announcement.update.confirm_title_1', defaultMessage: 'Xác nhận cập nhật thông báo' }),
            html: `<strong>${announcement.title || intl.formatMessage({ id: 'body_admin.announcement.update.no_title_name', defaultMessage: 'Không có tiêu đề thông báo' })}</strong><br>ID: ${announcement.id}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: 'body_admin.announcement.update.confirm_button_1', defaultMessage: 'Tiếp tục' }),
            cancelButtonText: intl.formatMessage({ id: 'body_admin.announcement.update.cancel_button', defaultMessage: 'Hủy' })
        });

        if (!confirmFirst.isConfirmed) return;

        // Step 2: Secondary Confirmation
        const confirmSecond = await Swal.fire({
            title: intl.formatMessage({ id: 'body_admin.announcement.update.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn cập nhật?' }),
            text: intl.formatMessage({ id: 'body_admin.announcement.update.confirm_text_2', defaultMessage: 'Thông tin thông báo sẽ được thay đổi!' }),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: 'body_admin.announcement.update.confirm_button_2', defaultMessage: 'Cập nhật' }),
            cancelButtonText: intl.formatMessage({ id: 'body_admin.announcement.update.cancel_button', defaultMessage: 'Hủy' })
        });

        if (!confirmSecond.isConfirmed) return;

        // Step 3: Text confirmation - Type exact phrase
        const confirmText = await Swal.fire({
            title: intl.formatMessage({ id: 'body_admin.announcement.update.security_title', defaultMessage: 'Xác nhận bảo mật' }),
            html: `
               <div style="text-align: left; margin: 20px 0;">
                  <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                     ${intl.formatMessage({ id: 'body_admin.announcement.update.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ cập nhật thông tin thông báo!' })}
                  </p>
                  <p style="margin-bottom: 10px; color: #374151;">
                     ${intl.formatMessage({ id: 'body_admin.announcement.update.security_confirm_text', defaultMessage: 'Thông báo cần cập nhật' })}: <strong style="color: #dc2626;">${announcement.title || intl.formatMessage({ id: 'body_admin.announcement.update.no_title_name', defaultMessage: 'Không có tiêu đề thông báo' })}</strong>
                  </p>
                  <p style="margin-bottom: 15px; color: #374151;">
                     ${intl.formatMessage({ id: 'body_admin.announcement.update.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.announcement.update.security_phrase', defaultMessage: 'CẬP NHẬT THÔNG BÁO' })}</code>
                  </p>
               </div>
            `,
            input: 'text',
            inputPlaceholder: intl.formatMessage({ id: 'body_admin.announcement.update.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' }),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: 'body_admin.announcement.update.security_continue', defaultMessage: 'Tiếp tục cập nhật' }),
            cancelButtonText: intl.formatMessage({ id: 'body_admin.announcement.update.cancel_button', defaultMessage: 'Hủy' }),
            inputValidator: (value) => {
                const expectedPhrase = intl.formatMessage({ id: 'body_admin.announcement.update.security_phrase', defaultMessage: 'CẬP NHẬT THÔNG BÁO' });
                if (value !== expectedPhrase) {
                    return intl.formatMessage({ id: 'body_admin.announcement.update.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' });
                }
            },
            customClass: {
                popup: 'swal-update-step3',
                input: 'swal-text-input'
            }
        });

        if (!confirmText.isConfirmed) return;

        setLoading(true);

        try {
            const dataToSend = {
                id: announcement.id,
                title: announcement.title || '',
                content: announcement.content || '',
                icon: announcement.icon || '📢',
                priority: announcement.priority || 1,
                endDate: announcement.endDate || null,
                isActive: announcement.isActive
            };

            const res = await updateAnnouncement(dataToSend);

            if (res && res.errCode === 0) {
                toast.success(intl.formatMessage({ id: 'body_admin.announcement.update.success', defaultMessage: 'Cập nhật thông báo thành công' }));
                navigate('/admin/homepage-management/announcement-management');
            } else {
                toast.error(res?.errMessage || intl.formatMessage({ id: 'body_admin.announcement.update.error', defaultMessage: 'Không thể cập nhật thông báo' }));
            }
        } catch (err) {
            console.error(err);
            toast.error(intl.formatMessage({ id: 'body_admin.announcement.update.server_error', defaultMessage: 'Lỗi server khi cập nhật thông báo' }));
        } finally {
            setLoading(false);
        }
    };

    if (!announcement) return (
        <div className="announcement-detail-loading">
            <FormattedMessage id="body_admin.announcement.update.loading_data" defaultMessage="Đang tải dữ liệu..." />
        </div>
    );

    return (
        <div className="announcement-create-container">
            <h1><FormattedMessage id="body_admin.announcement.update.title" defaultMessage="Cập Nhật Thông Báo" /></h1>
            <form onSubmit={handleSubmit} className="announcement-form">
                <div className="form-group">
                    <label><FormattedMessage id="body_admin.announcement.update.icon" defaultMessage="Biểu tượng:" /></label>
                    <select
                        value={announcement.icon || '📢'}
                        onChange={(e) => handleChange('icon', e.target.value)}
                        style={{ fontSize: '16px', padding: '8px' }}
                    >
                        {emojiIcons.map(iconOption => (
                            <option key={iconOption.value} value={iconOption.value}>
                                {iconOption.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label><FormattedMessage id="body_admin.announcement.update.title_label" defaultMessage="Tiêu đề:" /></label>
                    <input
                        type="text"
                        value={announcement.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label><FormattedMessage id="body_admin.announcement.update.content_label" defaultMessage="Nội dung:" /></label>
                    <textarea
                        value={announcement.content || ''}
                        onChange={(e) => handleChange('content', e.target.value)}
                        rows="4"
                    />
                </div>

                <div className="form-group">
                    <label><FormattedMessage id="body_admin.announcement.update.priority_label" defaultMessage="Độ ưu tiên:" /></label>
                    <select
                        value={announcement.priority || 1}
                        onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                        style={{ fontSize: '16px', padding: '8px' }}
                    >
                        {priorityOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label><FormattedMessage id="body_admin.announcement.update.end_date_label" defaultMessage="Ngày hết hạn:" /></label>
                    <input
                        type="datetime-local"
                        value={announcement.endDate ? new Date(announcement.endDate).toISOString().slice(0, 16) : ''}
                        onChange={(e) => handleChange('endDate', e.target.value || null)}
                    />
                </div>

                <div className="form-actions">
                    <button
                        className='btn-submit'
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <FormattedMessage id="body_admin.announcement.update.loading" defaultMessage="Đang cập nhật..." /> : <FormattedMessage id="body_admin.announcement.update.submit" defaultMessage="Cập Nhật" />}
                    </button>
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                    >
                        <FormattedMessage id="body_admin.announcement.update.cancel" defaultMessage="Hủy" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AnnouncementUpdate;
