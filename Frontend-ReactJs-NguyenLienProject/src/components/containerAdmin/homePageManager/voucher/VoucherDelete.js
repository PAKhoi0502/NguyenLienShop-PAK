import React from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { deleteVoucher } from '../../../../services/voucherService';
import CustomToast from '../../../../components/CustomToast';
import './VoucherDelete.scss';

const VoucherDelete = ({ voucher, onSuccess }) => {
    const intl = useIntl();
    const navigate = useNavigate();

    const showToast = (type, message) => {
        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type={type}
                    titleId={type === "success" ? "voucher.delete.success_title" : "voucher.delete.error_title"}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    };

    const handleDelete = async () => {
        if (!voucher || !voucher.id) {
            showToast("error", 'Không tìm thấy voucher');
            return;
        }

        // Check if voucher is active - cannot delete active vouchers
        if (voucher.isActive) {
            showToast("error", 'Không thể xóa voucher đang hoạt động. Vui lòng tắt voucher trước khi xóa.');
            return;
        }

        // Bước 1: Xác nhận lần 1
        const confirmFirst = await Swal.fire({
            title: '⚠️ Xác nhận xóa Voucher',
            html: `
                <div style="text-align: left;">
                    <p><strong>Mã voucher:</strong> <code style="background: #fee; padding: 2px 6px; border-radius: 4px;">${voucher.code}</code></p>
                    <p><strong>ID:</strong> ${voucher.id}</p>
                    <p><strong>Đã claim:</strong> ${voucher.usedCount} / ${voucher.usageLimit}</p>
                    ${voucher.usedCount > 0 ? `<p style="color: #ef4444; font-weight: 600;">⚠️ Voucher này đã có ${voucher.usedCount} lượt claim!</p>` : ''}
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Tiếp tục xóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280'
        });

        if (!confirmFirst.isConfirmed) return;

        // Bước 2: Xác nhận lần 2 - Nghiêm trọng hơn
        const confirmSecond = await Swal.fire({
            title: '🚨 Cảnh báo nghiêm trọng!',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p style="color: #dc2626; font-weight: 600; font-size: 1.1em;">
                        Hành động này KHÔNG THỂ HOÀN TÁC!
                    </p>
                    <p style="margin-top: 10px;">
                        Voucher <strong>${voucher.code}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
                    </p>
                    ${voucher.usedCount > 0 ? `
                        <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 12px; margin-top: 15px;">
                            <p style="color: #991b1b; margin: 0; font-weight: 600;">
                                ⚠️ Lưu ý: Nếu voucher này đã được sử dụng trong đơn hàng, bạn sẽ KHÔNG THỂ xóa!
                            </p>
                        </div>
                    ` : ''}
                    <p style="margin-top: 15px;">
                        Bạn có chắc chắn muốn tiếp tục?
                    </p>
                </div>
            `,
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Vẫn xóa',
            cancelButtonText: 'Hủy bỏ',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280'
        });

        if (!confirmSecond.isConfirmed) return;

        // Bước 3: Nhập cụm từ xác nhận
        const confirmText = await Swal.fire({
            title: '🔐 Xác nhận bảo mật',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p style="margin-bottom: 15px; color: #dc2626; font-weight: 600;">
                        Để tiếp tục xóa, vui lòng nhập chính xác cụm từ bên dưới:
                    </p>
                    <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 15px 0;">
                        <code style="font-size: 1.2em; font-weight: bold; color: #dc2626;">XÓA VOUCHER</code>
                    </div>
                    <p style="color: #6b7280; font-size: 0.9em;">
                        Voucher: <strong>${voucher.code}</strong> (ID: ${voucher.id})
                    </p>
                </div>
            `,
            input: 'text',
            inputPlaceholder: 'Nhập cụm từ xác nhận...',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            inputValidator: (value) => {
                if (value !== 'XÓA VOUCHER') {
                    return 'Cụm từ không chính xác! Vui lòng nhập đúng "XÓA VOUCHER"';
                }
            },
            customClass: {
                popup: 'swal-delete-step3',
                input: 'swal-text-input'
            }
        });

        if (!confirmText.isConfirmed) return;

        // Thực hiện xóa
        try {
            const res = await deleteVoucher(voucher.id);

            if (res.errCode === 0) {
                showToast("success", res.errMessage || 'Xóa voucher thành công!');

                // Gọi callback nếu có
                if (typeof onSuccess === 'function') {
                    onSuccess(voucher.id);
                } else {
                    // Reload trang sau 1.5s nếu không có callback
                    setTimeout(() => navigate(0), 1500);
                }
            } else {
                showToast("error", res.errMessage || 'Không thể xóa voucher');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast("error", error.errMessage || 'Lỗi khi xóa voucher');
        }
    };

    return (
        <button className="btn-action btn-delete" onClick={handleDelete}>
            Xóa
        </button>
    );
};

export default VoucherDelete;

