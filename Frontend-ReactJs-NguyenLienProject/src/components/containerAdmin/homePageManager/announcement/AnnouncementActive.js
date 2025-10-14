import React from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import { updateAnnouncement, getAnnouncements } from '../../../../services/announcementService';
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
                            ? "body_admin.announcement_management.activate.activate_success_title"
                            : "body_admin.announcement_management.activate.activate_error_title"
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
            const hasExpiryDate = announcement.endDate && announcement.endDate !== null;

            const confirmFirst = await Swal.fire({
                title: intl.formatMessage({
                    id: 'body_admin.announcement.deactivate.confirm_title_1',
                    defaultMessage: 'Xác nhận ẩn thông báo'
                }),
                html: `<strong>${announcement.title || intl.formatMessage({ id: 'body_admin.announcement.deactivate.no_title', defaultMessage: 'Không có tiêu đề' })}</strong><br>ID: ${announcement.id}<br><br>
                       <span style="color: #f59e0b;">⚠️ Thông báo sẽ không hiển thị trên giao diện người dùng</span>
                       ${hasExpiryDate ? `<br><br><span style="color: #ef4444; font-weight: bold;">⚠️ CẢNH BÁO: Thông báo này có thiết lập thời gian hết hạn. Khi ẩn đi, thời gian hết hạn sẽ bị xóa và cần thiết lập lại khi hiển thị.</span>` : ''}`,
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
                html: `${intl.formatMessage({
                    id: 'body_admin.announcement.deactivate.confirm_text_2',
                    defaultMessage: 'Bạn có chắc chắn muốn ẩn thông báo này không?'
                })}
                ${hasExpiryDate ? `<br><br><span style="color: #ef4444; font-weight: bold;">Thời gian hết hạn hiện tại sẽ bị xóa!</span>` : ''}`,
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
                // Khi ẩn thông báo, xóa expiry date
                const res = await updateAnnouncement(announcement.id, {
                    title: announcement.title || null,
                    content: announcement.content || null,
                    icon: announcement.icon || null,
                    priority: announcement.priority || 1,
                    isActive: false,
                    endDate: null  // Xóa expiry date khi ẩn
                });

                if (res.errCode === 0) {
                    showToast("success", res.errMessage || intl.formatMessage({
                        id: 'body_admin.announcement.deactivate.success',
                        defaultMessage: 'Thông báo đã được ẩn thành công'
                    }) + (hasExpiryDate ? ' (Thời gian hết hạn đã bị xóa)' : ''));
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
            // Xác nhận kích hoạt thông báo và nhập độ ưu tiên + expiry date
            const { value: formData } = await Swal.fire({
                title: intl.formatMessage({
                    id: 'body_admin.announcement.activate.confirm_title_1',
                    defaultMessage: 'Xác nhận kích hoạt thông báo'
                }),
                html: `<strong>${announcement.title || intl.formatMessage({ id: 'body_admin.announcement.activate.no_title', defaultMessage: 'Không có tiêu đề' })}</strong><br>ID: ${announcement.id}<br><br>
                       <div style="text-align: left; margin: 15px 0;">
                           <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                               ${intl.formatMessage({ id: 'body_admin.announcement.activate.priority_label', defaultMessage: 'Độ ưu tiên' })} (1-5):
                           </label>
                           <input id="priority" type="number" min="1" max="5" step="1" placeholder="Nhập số từ 1-5" 
                                  style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;">
                           
                           <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                               ${intl.formatMessage({ id: 'body_admin.announcement.activate.expiry_date_label', defaultMessage: 'Thời gian hết hạn' })} (tùy chọn):
                           </label>
                           <input id="expiryDate" type="datetime-local" 
                                  style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                           <small style="color: #666; font-size: 0.85em; margin-top: 5px; display: block;">
                               ${intl.formatMessage({ id: 'body_admin.announcement.activate.expiry_date_help', defaultMessage: 'Để trống nếu muốn hiển thị vĩnh viễn' })}
                           </small>
                       </div>`,
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
                preConfirm: async () => {
                    const priority = document.getElementById('priority').value;
                    const expiryDate = document.getElementById('expiryDate').value;

                    if (!priority || priority < 1 || priority > 5) {
                        Swal.showValidationMessage(intl.formatMessage({
                            id: 'body_admin.announcement.activate.priority_invalid',
                            defaultMessage: 'Độ ưu tiên phải từ 1-5'
                        }));
                        return false;
                    }

                    // Kiểm tra expiry date không được ở quá khứ
                    if (expiryDate) {
                        const selectedDate = new Date(expiryDate);
                        const currentDate = new Date();
                        if (selectedDate <= currentDate) {
                            Swal.showValidationMessage(intl.formatMessage({
                                id: 'body_admin.announcement.activate.expiry_date_invalid',
                                defaultMessage: 'Thời gian hết hạn phải ở tương lai'
                            }));
                            return false;
                        }
                    }

                    try {
                        const activeAnnouncements = await getAnnouncements();
                        if (activeAnnouncements.errCode === 0) {
                            const activeList = activeAnnouncements.announcements.filter(ann => ann.isActive);
                            if (activeList.some(ann => ann.priority === parseInt(priority))) {
                                Swal.showValidationMessage(intl.formatMessage({
                                    id: 'body_admin.announcement.activate.priority_duplicate',
                                    defaultMessage: 'Độ ưu tiên này đã được sử dụng bởi thông báo khác'
                                }));
                                return false;
                            }
                        }
                    } catch (error) {
                        Swal.showValidationMessage(intl.formatMessage({
                            id: 'body_admin.announcement.activate.priority_error',
                            defaultMessage: 'Lỗi khi kiểm tra độ ưu tiên'
                        }));
                        return false;
                    }

                    return {
                        priority: parseInt(priority),
                        expiryDate: expiryDate || null
                    };
                }
            });

            if (!formData) return;

            try {
                const res = await updateAnnouncement(announcement.id, {
                    title: announcement.title || null,
                    content: announcement.content || null,
                    icon: announcement.icon || null,
                    priority: formData.priority,
                    isActive: true,
                    endDate: formData.expiryDate
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

