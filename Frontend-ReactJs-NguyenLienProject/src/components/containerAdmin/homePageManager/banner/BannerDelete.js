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
                    titleId={type === "success" ? "banner.delete.delete_success_title" : "banner.delete.delete_error_title"}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    };

    const handleDelete = async () => {
        if (!banner || !banner.id) {
            showToast("error", intl.formatMessage({ id: 'banner.delete.not_found' }));
            return;
        }

        if (banner.isActive) {
            showToast("error", intl.formatMessage({ id: 'banner.delete.blocked_active' }));
            return;
        }

        const confirmFirst = await Swal.fire({
            title: intl.formatMessage({ id: 'banner.delete.confirm_title_1' }),
            html: `<strong>${banner.title || intl.formatMessage({ id: 'banner.delete.no_title' })} (${banner.subtitle || 'N/A'})</strong><br>ID: ${banner.id}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: 'banner.delete.confirm_button_1' }),
            cancelButtonText: intl.formatMessage({ id: 'admin.delete.cancel_button' })
        });

        if (!confirmFirst.isConfirmed) return;

        const confirmSecond = await Swal.fire({
            title: intl.formatMessage({ id: 'banner.delete.confirm_title_2' }),
            text: intl.formatMessage({ id: 'banner.delete.confirm_text_2' }),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: 'banner.delete.confirm_button_2' }),
            cancelButtonText: intl.formatMessage({ id: 'admin.delete.cancel_button' })
        });

        if (!confirmSecond.isConfirmed) return;

        try {
            const res = await deleteBanner(banner.id);

            if (res.errCode === 0) {
                showToast("success", res.errMessage || intl.formatMessage({ id: 'banner.delete.success' }));
                setTimeout(() => navigate(0), 1500);
            } else {
                showToast("error", res.errMessage || intl.formatMessage({ id: 'banner.delete.failed' }));
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast("error", error.errMessage || intl.formatMessage({ id: 'banner.delete.error' }));
        }
    };


    return (
        <button className="btn-action btn-delete" onClick={handleDelete}>
            {intl.formatMessage({ id: 'banner.delete.button' })}
        </button>
    );
};

export default BannerDelete;