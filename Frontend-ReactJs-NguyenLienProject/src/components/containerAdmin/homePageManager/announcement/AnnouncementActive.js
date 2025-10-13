import React from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import { toggleAnnouncementStatus, updateAnnouncement, getAnnouncements } from '../../../../services/announcementService';
import CustomToast from '../../../../components/CustomToast';

const AnnouncementActive = ({ announcement, onSuccess }) => {
    const intl = useIntl();

    const showToast = (type, message) => {
        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type={type}
                    titleId={intl.formatMessage({
                        id: type === "success"
                            ? "body_admin.announcement.activate.activate_success_title"
                            : "body_admin.announcement.activate.activate_error_title"
                    })}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    };

    const handleToggleActive = async () => {
        if (!announcement || !announcement.id) {
            showToast("error", intl.formatMessage({ id: 'admin.delete.not_found' }));
            return;
        }

        if (announcement.isActive) {
            const confirmFirst = await Swal.fire({
                title: intl.formatMessage({
                    id: 'body_admin.announcement.deactivate.confirm_title_1',
                    defaultMessage: 'Xác nhận ẩn thông báo'
                }),
                html: `<strong>${announcement.title || intl.formatMessage({ id: 'body_admin.announcement.deactivate.no_title', defaultMessage: 'Không có tiêu đề' })}</strong><br>ID: ${announcement.id}<br><br>
                       <span style="color: #f59e0b;">⚠️ Thông báo sẽ không hiển thị trên giao diện người dùng</span>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: intl.formatMessage({
                    id: 'body_admin.announcement.deactivate.confirm_button_1',
                    defaultMessage: 'Xác nhận ẩn'
                }),
                cancelButtonText: intl.formatMessage({
                    id: 'body_admin.announcement.deactivate.cancel_button',
                    defaultMessage: 'Hủy'
                }),
                confirmButtonColor: '#f59e0b',
                cancelButtonColor: '#6b7280'
            });

            if (!confirmFirst.isConfirmed) return;

            const confirmSecond = await Swal.fire({
                title: intl.formatMessage({
                    id: 'body_admin.announcement.deactivate.confirm_title_2',
                    defaultMessage: 'Lần xác nhận cuối'
                }),
                text: intl.formatMessage({
                    id: 'body_admin.announcement.deactivate.confirm_text_2',
                    defaultMessage: 'Bạn có chắc chắn muốn ẩn thông báo này không?'
                }),
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: intl.formatMessage({
                    id: 'body_admin.announcement.deactivate.confirm_button_2',
                    defaultMessage: 'Có, ẩn thông báo'
                }),
                cancelButtonText: intl.formatMessage({
                    id: 'body_admin.announcement.deactivate.cancel_button',
                    defaultMessage: 'Hủy'
                }),
                confirmButtonColor: '#f59e0b',
                cancelButtonColor: '#6b7280'
            });

            if (!confirmSecond.isConfirmed) return;

            try {
                const res = await toggleAnnouncementStatus(announcement.id);

                if (res.errCode === 0) {
                    showToast("success", res.errMessage || intl.formatMessage({
                        id: 'body_admin.announcement.deactivate.success',
                        defaultMessage: 'Thông báo đã được ẩn thành công'
                    }));
                    if (typeof onSuccess === 'function') {
                        onSuccess(announcement.id, res.announcement);
                    }
                } else {
                    showToast("error", res.errMessage || intl.formatMessage({
                        id: 'body_admin.announcement.deactivate.failed',
                        defaultMessage: 'Không thể ẩn thông báo'
                    }));
                }
            } catch (error) {
                console.error('Deactivate error:', error);
                showToast("error", error.errMessage || intl.formatMessage({
                    id: 'body_admin.announcement.deactivate.error',
                    defaultMessage: 'Lỗi khi ẩn thông báo'
                }));
            }
        } else {
            // Xác nhận kích hoạt thông báo và nhập độ ưu tiên
            const { value: priority } = await Swal.fire({
                title: intl.formatMessage({
                    id: 'body_admin.announcement.activate.confirm_title_1',
                    defaultMessage: 'Xác nhận kích hoạt thông báo'
                }),
                html: `<strong>${announcement.title || intl.formatMessage({ id: 'body_admin.announcement.activate.no_title', defaultMessage: 'Không có tiêu đề' })}</strong><br>ID: ${announcement.id}<br><br>
                       ${intl.formatMessage({ id: 'body_admin.announcement.activate.priority_input', defaultMessage: 'Nhập độ ưu tiên cho thông báo (1 = cao nhất, 5 = thấp nhất):' })}`,
                input: 'number',
                inputLabel: intl.formatMessage({ id: 'body_admin.announcement.activate.priority_label', defaultMessage: 'Độ ưu tiên' }),
                inputPlaceholder: intl.formatMessage({ id: 'body_admin.announcement.activate.priority_placeholder', defaultMessage: 'Nhập số từ 1-5' }),
                inputAttributes: { min: 1, max: 5, step: 1 },
                showCancelButton: true,
                confirmButtonText: intl.formatMessage({
                    id: 'body_admin.announcement.activate.confirm_button_1',
                    defaultMessage: 'Kích hoạt thông báo'
                }),
                cancelButtonText: intl.formatMessage({
                    id: 'body_admin.announcement.deactivate.cancel_button',
                    defaultMessage: 'Hủy'
                }),
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280',
                inputValidator: async (value) => {
                    if (!value || value < 1 || value > 5) {
                        return intl.formatMessage({
                            id: 'body_admin.announcement.activate.priority_invalid',
                            defaultMessage: 'Độ ưu tiên phải từ 1-5'
                        });
                    }
                    try {
                        const activeAnnouncements = await getAnnouncements();
                        if (activeAnnouncements.errCode === 0) {
                            const activeList = activeAnnouncements.announcements.filter(ann => ann.isActive);
                            if (activeList.some(ann => ann.priority === parseInt(value))) {
                                return intl.formatMessage({
                                    id: 'body_admin.announcement.activate.priority_duplicate',
                                    defaultMessage: 'Độ ưu tiên này đã được sử dụng bởi thông báo khác'
                                });
                            }
                        }
                    } catch (error) {
                        return intl.formatMessage({
                            id: 'body_admin.announcement.activate.priority_error',
                            defaultMessage: 'Lỗi khi kiểm tra độ ưu tiên'
                        });
                    }
                }
            });

            if (!priority) return;

            try {
                const res = await updateAnnouncement(announcement.id, {
                    title: announcement.title || null,
                    content: announcement.content || null,
                    icon: announcement.icon || null,
                    priority: parseInt(priority),
                    isActive: true,
                    endDate: announcement.endDate || null
                });

                if (res.errCode === 0) {
                    showToast("success", res.errMessage || intl.formatMessage({
                        id: 'body_admin.announcement.activate.success',
                        defaultMessage: 'Thông báo đã được kích hoạt thành công'
                    }));
                    if (typeof onSuccess === 'function') {
                        onSuccess(announcement.id, res.announcement);
                    }
                } else {
                    showToast("error", res.errMessage || intl.formatMessage({
                        id: 'body_admin.announcement.activate.failed',
                        defaultMessage: 'Không thể kích hoạt thông báo'
                    }));
                }
            } catch (error) {
                console.error('Activate error:', error);
                showToast("error", error.errMessage || intl.formatMessage({
                    id: 'body_admin.announcement.activate.error',
                    defaultMessage: 'Lỗi khi kích hoạt thông báo'
                }));
            }
        }
    };

    return (
        <div className="action-buttons">
            <button
                className={`btn-action ${announcement.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                onClick={handleToggleActive}
                title={announcement.isActive
                    ? intl.formatMessage({
                        id: 'body_admin.announcement.active.deactivate_tooltip',
                        defaultMessage: 'Click để ẩn thông báo'
                    })
                    : intl.formatMessage({
                        id: 'body_admin.announcement.active.activate_tooltip',
                        defaultMessage: 'Click để hiển thị thông báo'
                    })
                }
            >
                {announcement.isActive
                    ? intl.formatMessage({
                        id: 'body_admin.announcement.deactivate.button',
                        defaultMessage: 'Ẩn thông báo'
                    })
                    : intl.formatMessage({
                        id: 'body_admin.announcement.activate.button',
                        defaultMessage: 'Hiển thị thông báo'
                    })}
            </button>
        </div>
    );
};

export default AnnouncementActive;

