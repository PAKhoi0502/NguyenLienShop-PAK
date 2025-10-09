import React from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { deleteBanner } from '../../../../services/bannerService';
import CustomToast from '../../../../components/CustomToast';

const BannerDelete = ({ banner }) => {
    const intl = useIntl();
    const navigate = useNavigate();

    const showToast = (type, message) => {
        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type={type}
                    titleId={type === "success" ? "body_admin.banner.delete.delete_success_title" : "body_admin.banner.delete.delete_error_title"}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    };

    const handleDelete = async () => {
        if (!banner || !banner.id) {
            showToast("error", intl.formatMessage({ id: 'body_admin.banner.delete.not_found' }));
            return;
        }

        if (banner.isActive) {
            showToast("error", intl.formatMessage({ id: 'body_admin.banner.delete.blocked_active' }));
            return;
        }

        const confirmFirst = await Swal.fire({
            title: intl.formatMessage({ id: 'body_admin.banner.delete.confirm_title_1' }),
            html: `<strong>${banner.title || intl.formatMessage({ id: 'body_admin.banner.delete.no_title' })} (${banner.subtitle || 'N/A'})</strong><br>ID: ${banner.id}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: 'body_admin.banner.delete.confirm_button_1' }),
            cancelButtonText: intl.formatMessage({ id: 'body_admin.banner.delete.cancel_button' })
        });

        if (!confirmFirst.isConfirmed) return;

        const confirmSecond = await Swal.fire({
            title: intl.formatMessage({ id: 'body_admin.banner.delete.confirm_title_2' }),
            text: intl.formatMessage({ id: 'body_admin.banner.delete.confirm_text_2' }),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: 'body_admin.banner.delete.confirm_button_2' }),
            cancelButtonText: intl.formatMessage({ id: 'body_admin.banner.delete.cancel_button' })
        });

        if (!confirmSecond.isConfirmed) return;

        // Step 3: Text confirmation - Type exact phrase (Banner specific)
        const confirmText = await Swal.fire({
            title: intl.formatMessage({ id: 'body_admin.banner.delete.security_title', defaultMessage: 'Xác nhận bảo mật' }),
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                        ${intl.formatMessage({ id: 'body_admin.banner.delete.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ xóa vĩnh viễn banner!' })}
                    </p>
                    <p style="margin-bottom: 10px; color: #374151;">
                        ${intl.formatMessage({ id: 'body_admin.banner.delete.security_confirm_text', defaultMessage: 'Banner cần xóa' })}: <strong style="color: #dc2626;">${banner.title || intl.formatMessage({ id: 'body_admin.banner.delete.no_title', defaultMessage: 'Không có tiêu đề' })}</strong>
                    </p>
                    <p style="margin-bottom: 15px; color: #374151;">
                        ${intl.formatMessage({ id: 'body_admin.banner.delete.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.banner.delete.security_phrase', defaultMessage: 'XÓA BANNER' })}</code>
                    </p>
                </div>
            `,
            input: 'text',
            inputPlaceholder: intl.formatMessage({ id: 'body_admin.banner.delete.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' }),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: 'body_admin.banner.delete.security_continue', defaultMessage: 'Tiếp tục xóa' }),
            cancelButtonText: intl.formatMessage({ id: 'body_admin.banner.delete.cancel_button', defaultMessage: 'Hủy' }),
            inputValidator: (value) => {
                const expectedPhrase = intl.formatMessage({ id: 'body_admin.banner.delete.security_phrase', defaultMessage: 'XÓA BANNER' });
                if (value !== expectedPhrase) {
                    return intl.formatMessage({ id: 'body_admin.banner.delete.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' });
                }
            },
            customClass: {
                popup: 'swal-delete-step3',
                input: 'swal-text-input'
            }
        });

        if (!confirmText.isConfirmed) return;

        try {
            const res = await deleteBanner(banner.id);

            if (res.errCode === 0) {
                showToast("success", res.errMessage || intl.formatMessage({ id: 'body_admin.banner.delete.success' }));
                setTimeout(() => navigate(0), 1500);
            } else {
                showToast("error", res.errMessage || intl.formatMessage({ id: 'body_admin.banner.delete.failed' }));
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast("error", error.errMessage || intl.formatMessage({ id: 'body_admin.banner.delete.error' }));
        }
    };


    return (
        <button className="btn-action btn-delete" onClick={handleDelete}>
            {intl.formatMessage({ id: 'body_admin.banner.delete.button' })}
        </button>
    );
};

export default BannerDelete;