import React from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import { toggleVoucherStatus } from '../../../../services/voucherService.js';
import CustomToast from '../../../../components/CustomToast';

const VoucherToggle = ({ voucher, onSuccess }) => {
    const intl = useIntl();

    const showToast = (type, message) => {
        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type={type}
                    titleId={type === "success" ? "voucher.toggle.success_title" : "voucher.toggle.error_title"}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    };

    const handleToggle = async () => {
        if (!voucher || !voucher.id) {
            showToast("error", 'Không tìm thấy voucher');
            return;
        }

        const isActivating = !voucher.isActive;

        if (isActivating) {
            // Kích hoạt voucher
            const confirm = await Swal.fire({
                title: '✅ Kích hoạt Voucher',
                html: `
               <div style="text-align: left;">
                  <p>Bạn muốn kích hoạt voucher:</p>
                  <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px; margin: 10px 0;">
                     <p style="margin: 0;"><strong>Mã:</strong> <code style="font-weight: bold;">${voucher.code}</code></p>
                     <p style="margin: 5px 0 0 0;"><strong>ID:</strong> ${voucher.id}</p>
                  </div>
                  ${voucher.expiryDate && new Date(voucher.expiryDate) < new Date() ? `
                     <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 10px 0;">
                        <p style="margin: 0; color: #dc2626;">⚠️ Voucher này đã hết hạn!</p>
                     </div>
                  ` : ''}
                  <p style="margin-top: 10px;">
                     Sau khi kích hoạt, ${voucher.isPublic ? 'người dùng có thể tự claim' : 'admin có thể gán voucher cho user'}.
                  </p>
               </div>
            `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Kích hoạt',
                cancelButtonText: 'Hủy',
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280'
            });

            if (!confirm.isConfirmed) return;

        } else {
            // Tắt voucher
            const confirm = await Swal.fire({
                title: '❌ Tắt Voucher',
                html: `
               <div style="text-align: left;">
                  <p>Bạn muốn tắt voucher:</p>
                  <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 10px 0;">
                     <p style="margin: 0;"><strong>Mã:</strong> <code style="font-weight: bold;">${voucher.code}</code></p>
                     <p style="margin: 5px 0 0 0;"><strong>ID:</strong> ${voucher.id}</p>
                     <p style="margin: 5px 0 0 0;"><strong>Đã claim:</strong> ${voucher.usedCount} / ${voucher.usageLimit}</p>
                  </div>
                  <p style="margin-top: 10px; color: #dc2626;">
                     ⚠️ Sau khi tắt, người dùng sẽ KHÔNG THỂ claim voucher này nữa.
                  </p>
                  ${voucher.usedCount > 0 ? `
                     <p style="color: #6b7280; font-size: 0.9em;">
                        💡 Lưu ý: User đã claim vẫn có thể sử dụng voucher này cho đến khi hết lượt.
                     </p>
                  ` : ''}
               </div>
            `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Tắt voucher',
                cancelButtonText: 'Hủy',
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280'
            });

            if (!confirm.isConfirmed) return;
        }

        // Thực hiện toggle
        try {
            const res = await toggleVoucherStatus(voucher.id);

            if (res.errCode === 0) {
                const newStatus = res.voucher?.isActive;
                showToast(
                    "success",
                    newStatus ?
                        `Voucher ${voucher.code} đã được kích hoạt!` :
                        `Voucher ${voucher.code} đã bị tắt!`
                );

                // Gọi callback để update state ở component cha
                if (typeof onSuccess === 'function') {
                    onSuccess(voucher.id, res.voucher);
                }
            } else {
                showToast("error", res.errMessage || 'Không thể thay đổi trạng thái voucher');
            }
        } catch (error) {
            console.error('Toggle error:', error);
            showToast("error", error.errMessage || 'Lỗi khi thay đổi trạng thái voucher');
        }
    };

    return (
        <button
            className={`btn-action ${voucher.isActive ? 'btn-deactivate' : 'btn-activate'}`}
            onClick={handleToggle}
        >
            {voucher.isActive ? 'Tắt' : 'Bật'}
        </button>
    );
};

export default VoucherToggle;


