import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { deleteAnnouncement } from '../../../../services/announcementService';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CustomToast from '../../../../components/CustomToast';
import './AnnouncementDelete.scss';

const AnnouncementDelete = ({ announcement, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const intl = useIntl();
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (loading) return;

        // Validate announcement data
        if (!announcement || !announcement.id) {
            showToast('error', intl.formatMessage({
                id: 'body_admin.announcement.delete.invalid_data',
                defaultMessage: 'Dữ liệu thông báo không hợp lệ'
            }));
            return;
        }

        // Check if announcement is active - cannot delete active announcements (same logic as Product)
        if (announcement.isActive) {
            showToast('error', intl.formatMessage({
                id: 'body_admin.announcement.delete.blocked_active',
                defaultMessage: 'Không thể xóa thông báo đang hiển thị. Vui lòng ẩn thông báo trước khi xóa.'
            }));
            return;
        }

        // Step 1: Initial confirmation
        const confirmResult = await Swal.fire({
            icon: 'warning',
            title: intl.formatMessage({
                id: 'body_admin.announcement.delete.confirm_title',
                defaultMessage: 'Xác nhận xóa thông báo'
            }),
            html: `
                <div style="text-align: left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="background: #fef3cd; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                        <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ ${intl.formatMessage({
                id: 'body_admin.announcement.delete.confirm_message',
                defaultMessage: 'Bạn có chắc chắn muốn xóa thông báo này?'
            })}</p>
                    </div>
                    <div style="background: #f8f9fa; border-radius: 6px; padding: 12px; border-left: 4px solid #dc2626;">
                        <p style="margin: 4px 0; color: #374151;"><strong>${intl.formatMessage({
                id: 'body_admin.announcement.delete.id_label',
                defaultMessage: 'ID:'
            })}</strong> <span style="color: #dc2626; font-weight: 600;">#${announcement.id}</span></p>
                        <p style="margin: 4px 0; color: #374151;"><strong>${intl.formatMessage({
                id: 'body_admin.announcement.delete.title_label',
                defaultMessage: 'Tiêu đề:'
            })}</strong> ${announcement.title || 'N/A'}</p>
                        <p style="margin: 4px 0; color: #374151;"><strong>${intl.formatMessage({
                id: 'body_admin.announcement.delete.icon_label',
                defaultMessage: 'Icon:'
            })}</strong> <span style="font-size: 1.2rem;">${announcement.icon || '📢'}</span></p>
                        ${announcement.isActive ? '<p style="margin: 4px 0; color: #059669;"><strong>Trạng thái:</strong> <span style="background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 4px; font-size: 0.85em;">Đang hoạt động</span></p>' : '<p style="margin: 4px 0; color: #6b7280;"><strong>Trạng thái:</strong> <span style="background: #f3f4f6; color: #6b7280; padding: 2px 8px; border-radius: 4px; font-size: 0.85em;">Đã ẩn</span></p>'}
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({
                id: 'body_admin.announcement.delete.confirm_button',
                defaultMessage: 'Có, xóa thông báo!'
            }),
            cancelButtonText: intl.formatMessage({
                id: 'body_admin.announcement.delete.cancel_button',
                defaultMessage: 'Hủy'
            }),
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            customClass: {
                popup: 'swal-wide',
                confirmButton: 'swal-confirm-danger',
                cancelButton: 'swal-cancel'
            },
            buttonsStyling: true,
            focusConfirm: false,
            allowOutsideClick: false
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        // Step 2: Secondary confirmation
        const secondConfirmResult = await Swal.fire({
            icon: 'error',
            title: intl.formatMessage({
                id: 'body_admin.announcement.delete.second_confirm_title',
                defaultMessage: 'Xác nhận lần cuối'
            }),
            html: `
                <div style="text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <div style="font-size: 48px; margin-bottom: 8px;">🚨</div>
                        <p style="margin: 0; color: #dc2626; font-weight: 600; font-size: 16px;">${intl.formatMessage({
                id: 'body_admin.announcement.delete.second_confirm_message',
                defaultMessage: 'Hành động này không thể hoàn tác!'
            })}</p>
                        <p style="margin: 8px 0 0 0; color: #7f1d1d; font-size: 14px;">${intl.formatMessage({
                id: 'body_admin.announcement.delete.second_confirm_detail',
                defaultMessage: 'Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống'
            })}</p>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({
                id: 'body_admin.announcement.delete.second_confirm_button',
                defaultMessage: 'Xóa vĩnh viễn'
            }),
            cancelButtonText: intl.formatMessage({
                id: 'body_admin.announcement.delete.second_cancel_button',
                defaultMessage: 'Không, hủy bỏ'
            }),
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            customClass: {
                popup: 'swal-wide',
                confirmButton: 'swal-confirm-danger',
                cancelButton: 'swal-cancel'
            },
            buttonsStyling: true,
            focusConfirm: false,
            allowOutsideClick: false
        });

        if (!secondConfirmResult.isConfirmed) {
            return;
        }

        // Step 3: Text confirmation for security
        const { value: securityText } = await Swal.fire({
            icon: 'warning',
            title: intl.formatMessage({
                id: 'body_admin.announcement.delete.security_title',
                defaultMessage: 'Xác nhận bảo mật cuối cùng'
            }),
            html: `
                <div style="text-align: left; margin-bottom: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                        <p style="margin: 0; color: #9a3412; font-weight: 600;">🔐 ${intl.formatMessage({
                id: 'body_admin.announcement.delete.security_message',
                defaultMessage: 'Để xóa thông báo này, vui lòng nhập:'
            })}</p>
                    </div>
                    <div style="background: #dc2626; color: white; padding: 8px 12px; border-radius: 6px; text-align: center; margin: 12px 0;">
                        <span style="font-weight: bold; font-size: 16px; letter-spacing: 1px;">XÓA THÔNG BÁO</span>
                    </div>
                    <div style="background: #f9fafb; border-radius: 6px; padding: 12px; border-left: 4px solid #dc2626;">
                        <p style="margin: 4px 0; color: #374151; font-weight: 600;">${intl.formatMessage({
                id: 'body_admin.announcement.delete.security_info',
                defaultMessage: 'Thông báo sẽ bị xóa:'
            })}</p>
                        <p style="margin: 4px 0; color: #6b7280;">• ID: <strong>#${announcement.id}</strong></p>
                        <p style="margin: 4px 0; color: #6b7280;">• ${intl.formatMessage({
                id: 'body_admin.announcement.delete.title_label',
                defaultMessage: 'Tiêu đề:'
            })} <strong>${announcement.title || 'N/A'}</strong></p>
                    </div>
                </div>
            `,
            input: 'text',
            inputPlaceholder: intl.formatMessage({
                id: 'body_admin.announcement.delete.security_placeholder',
                defaultMessage: 'Nhập "XÓA THÔNG BÁO" để xác nhận'
            }),
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({
                id: 'body_admin.announcement.delete.security_confirm_button',
                defaultMessage: 'Xóa thông báo'
            }),
            cancelButtonText: intl.formatMessage({
                id: 'body_admin.announcement.delete.security_cancel_button',
                defaultMessage: 'Hủy'
            }),
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            customClass: {
                popup: 'swal-wide',
                input: 'swal-input',
                confirmButton: 'swal-confirm-danger',
                cancelButton: 'swal-cancel'
            },
            buttonsStyling: true,
            focusConfirm: false,
            allowOutsideClick: false,
            inputValidator: (value) => {
                if (!value || value.trim() !== 'XÓA THÔNG BÁO') {
                    return intl.formatMessage({
                        id: 'body_admin.announcement.delete.security_phrase',
                        defaultMessage: 'Vui lòng nhập chính xác "XÓA THÔNG BÁO"'
                    });
                }
            }
        });

        if (!securityText || securityText.trim() !== 'XÓA THÔNG BÁO') {
            return;
        }

        setLoading(true);

        try {
            const res = await deleteAnnouncement(announcement.id);

            if (res.errCode === 0) {
                // Show success message with toast
                showToast('success', intl.formatMessage({
                    id: 'body_admin.announcement.delete.success_message',
                    defaultMessage: 'Thông báo đã được xóa khỏi hệ thống'
                }));

                // Call success callback or navigate refresh (similar to Product logic)
                if (onSuccess) {
                    onSuccess(announcement.id);
                } else {
                    setTimeout(() => navigate(0), 1500);
                }
            } else {
                // Handle specific error codes
                let errorMessage = res.errMessage || intl.formatMessage({
                    id: 'body_admin.announcement.delete.error_message',
                    defaultMessage: 'Không thể xóa thông báo'
                });

                if (res.errCode === 404) {
                    errorMessage = intl.formatMessage({
                        id: 'body_admin.announcement.delete.not_found',
                        defaultMessage: 'Không tìm thấy thông báo'
                    });
                } else if (res.errCode === 403) {
                    errorMessage = intl.formatMessage({
                        id: 'body_admin.announcement.delete.no_permission',
                        defaultMessage: 'Bạn không có quyền xóa thông báo này'
                    });
                } else if (res.errCode === 409) {
                    errorMessage = intl.formatMessage({
                        id: 'body_admin.announcement.delete.in_use',
                        defaultMessage: 'Không thể xóa thông báo đang được sử dụng'
                    });
                }

                showToast('error', errorMessage);
            }
        } catch (err) {
            console.error('Delete announcement error:', err);

            // Handle network errors
            let errorMessage = intl.formatMessage({
                id: 'body_admin.announcement.delete.network_error',
                defaultMessage: 'Lỗi kết nối. Vui lòng thử lại'
            });

            if (err.response?.status === 401) {
                errorMessage = intl.formatMessage({
                    id: 'body_admin.announcement.delete.unauthorized',
                    defaultMessage: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại'
                });
            }

            showToast('error', errorMessage);
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
                    titleId={type === "success" ? "body_admin.announcement.delete.success_title" : "body_admin.announcement.delete.error_title"}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    };

    return (
        <button
            className={`btn-action btn-delete ${loading ? 'loading' : ''}`}
            onClick={handleDelete}
            disabled={loading || !announcement?.id}
            title={intl.formatMessage({
                id: 'body_admin.announcement.delete.tooltip',
                defaultMessage: 'Click để xóa thông báo'
            })}
        >
            {loading ? (
                <>
                    <span className="spinner"></span>
                    <FormattedMessage id="body_admin.announcement.delete.loading" defaultMessage="Đang xóa..." />
                </>
            ) : (
                <FormattedMessage id="body_admin.announcement.delete.button" defaultMessage="Xóa" />
            )}
        </button>
    );
};

export default AnnouncementDelete;

