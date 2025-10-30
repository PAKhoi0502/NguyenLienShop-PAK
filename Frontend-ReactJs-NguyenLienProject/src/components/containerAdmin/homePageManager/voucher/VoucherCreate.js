import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomToast from '../../../../components/CustomToast';
import { createVoucher } from '../../../../services/voucherService';
import { useIntl, FormattedMessage } from 'react-intl';
import HintBox from '../../../../components/HintBox';
import './VoucherCreate.scss';

const VoucherCreate = () => {
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percent',
        discountValue: '',
        applicationType: 'order',
        conditionType: 'none',
        conditionValue: null,
        maxDiscountAmount: '',
        minOrderValue: '',
        expiryDate: '',
        isPublic: true,
        usageLimit: '',
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const intl = useIntl();

    const showToast = (type, message) => {
        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type={type}
                    titleId={type === "success" ? "voucher.create.success_title" : "voucher.create.error_title"}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.code.trim()) {
            showToast("error", 'Vui lòng nhập mã voucher');
            return;
        }

        if (!formData.discountValue || formData.discountValue <= 0) {
            showToast("error", 'Giá trị giảm giá phải lớn hơn 0');
            return;
        }

        if (formData.discountType === 'percent' && formData.discountValue > 100) {
            showToast("error", 'Giá trị phần trăm không được vượt quá 100%');
            return;
        }

        if (!formData.usageLimit || formData.usageLimit <= 0) {
            showToast("error", 'Giới hạn claim phải lớn hơn 0');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                code: formData.code.toUpperCase().trim(),
                discountValue: parseFloat(formData.discountValue),
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
                minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
                usageLimit: parseInt(formData.usageLimit),
                expiryDate: formData.expiryDate || null,
                conditionValue: formData.conditionValue || null
            };

            const res = await createVoucher(payload);

            if (res && res.errCode === 0) {
                showToast("success", 'Tạo voucher thành công!');
                setTimeout(() => {
                    navigate('/admin/homepage-management/voucher-management');
                }, 1500);
            } else {
                showToast("error", res.errMessage || 'Không thể tạo voucher');
            }
        } catch (err) {
            console.error('Create voucher error:', err);
            showToast("error", 'Lỗi server khi tạo voucher');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="voucher-create-container">
            <HintBox
                content={
                    <div>
                        <p><strong>💡 Hướng dẫn tạo Voucher</strong></p>
                        <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                            <li><strong>Mã voucher:</strong> Nên viết hoa, không dấu, ví dụ: WELCOME10</li>
                            <li><strong>Loại giảm:</strong> Phần trăm (%) hoặc số tiền cố định (đ)</li>
                            <li><strong>Áp dụng cho:</strong> Toàn đơn hàng, sản phẩm cụ thể, hoặc vận chuyển</li>
                            <li><strong>Điều kiện:</strong> Có thể thêm điều kiện như đơn đầu tiên, địa điểm, v.v.</li>
                            <li><strong>Công khai:</strong> Nếu bật, user có thể tự claim voucher này</li>
                        </ul>
                    </div>
                }
            />

            <h1><FormattedMessage id="voucher.create.title" defaultMessage="Tạo Voucher Mới" /></h1>

            <form onSubmit={handleSubmit} className="voucher-create-form">
                {/* Thông tin cơ bản */}
                <div className="form-section">
                    <h3>Thông tin cơ bản</h3>

                    <div className="form-group">
                        <label>
                            Mã voucher: <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="VD: WELCOME10, FREESHIP, SALE50"
                            required
                            style={{ textTransform: 'uppercase' }}
                        />
                        <small>Mã voucher sẽ tự động chuyển thành chữ hoa</small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                Loại giảm giá: <span className="required">*</span>
                            </label>
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleChange}
                                required
                            >
                                <option value="percent">Phần trăm (%)</option>
                                <option value="fixed">Số tiền cố định (đ)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                Giá trị giảm: <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleChange}
                                placeholder={formData.discountType === 'percent' ? '10' : '50000'}
                                min="0"
                                step={formData.discountType === 'percent' ? '1' : '1000'}
                                required
                            />
                            <small>
                                {formData.discountType === 'percent' ? 'Giá trị từ 1-100%' : 'Giá trị bằng đồng (VNĐ)'}
                            </small>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Giảm tối đa:</label>
                            <input
                                type="number"
                                name="maxDiscountAmount"
                                value={formData.maxDiscountAmount}
                                onChange={handleChange}
                                placeholder="VD: 100000"
                                min="0"
                                step="1000"
                            />
                            <small>Chỉ áp dụng cho loại phần trăm. Để trống = không giới hạn</small>
                        </div>

                        <div className="form-group">
                            <label>Giá trị đơn tối thiểu:</label>
                            <input
                                type="number"
                                name="minOrderValue"
                                value={formData.minOrderValue}
                                onChange={handleChange}
                                placeholder="VD: 200000"
                                min="0"
                                step="1000"
                            />
                            <small>Để trống hoặc 0 = không yêu cầu tối thiểu</small>
                        </div>
                    </div>
                </div>

                {/* Phạm vi áp dụng */}
                <div className="form-section">
                    <h3>Phạm vi áp dụng</h3>

                    <div className="form-group">
                        <label>
                            Áp dụng cho: <span className="required">*</span>
                        </label>
                        <select
                            name="applicationType"
                            value={formData.applicationType}
                            onChange={handleChange}
                            required
                        >
                            <option value="order">Toàn đơn hàng</option>
                            <option value="product">Sản phẩm cụ thể</option>
                            <option value="shipping">Phí vận chuyển</option>
                        </select>
                        <small>
                            {formData.applicationType === 'order' && 'Giảm giá cho tổng giá trị đơn hàng'}
                            {formData.applicationType === 'product' && 'Giảm giá cho sản phẩm cụ thể'}
                            {formData.applicationType === 'shipping' && 'Miễn phí hoặc giảm phí vận chuyển'}
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Điều kiện áp dụng:</label>
                        <select
                            name="conditionType"
                            value={formData.conditionType}
                            onChange={handleChange}
                        >
                            <option value="none">Không có điều kiện</option>
                            <option value="first_order">Chỉ đơn hàng đầu tiên</option>
                            <option value="location">Theo địa điểm</option>
                            <option value="user_segment">Theo phân khúc khách hàng</option>
                            <option value="specific_category">Theo danh mục sản phẩm</option>
                            <option value="min_items">Số lượng sản phẩm tối thiểu</option>
                        </select>
                        <small>Bổ sung điều kiện đặc biệt để sử dụng voucher</small>
                    </div>
                </div>

                {/* Cài đặt sử dụng */}
                <div className="form-section">
                    <h3>Cài đặt sử dụng</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                Giới hạn số lần claim: <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleChange}
                                placeholder="VD: 100"
                                min="1"
                                required
                            />
                            <small>Tổng số lần voucher có thể được claim bởi tất cả users</small>
                        </div>

                        <div className="form-group">
                            <label>Hạn sử dụng:</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <small>Để trống = không giới hạn thời gian</small>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isPublic"
                                    checked={formData.isPublic}
                                    onChange={handleChange}
                                />
                                <span>Công khai (User có thể tự claim)</span>
                            </label>
                            <small>Nếu tắt, chỉ admin có thể gán voucher cho user</small>
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                <span>Kích hoạt ngay</span>
                            </label>
                            <small>Voucher có thể được claim/sử dụng ngay sau khi tạo</small>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="form-actions">
                    <button className="btn-submit" type="submit" disabled={loading}>
                        {loading ? 'Đang tạo...' : 'Tạo Voucher'}
                    </button>
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate('/admin/homepage-management/voucher-management')}
                        disabled={loading}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VoucherCreate;

