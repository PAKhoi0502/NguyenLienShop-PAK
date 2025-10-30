import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomToast from '../../../../components/CustomToast';
import { getVoucherById, updateVoucher } from '../../../../services/voucherService';
import { useIntl, FormattedMessage } from 'react-intl';
import HintBox from '../../../../components/HintBox';
import './VoucherUpdate.scss';

const VoucherUpdate = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        id: '',
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
    const [fetching, setFetching] = useState(true);
    const [originalVoucher, setOriginalVoucher] = useState(null);
    const navigate = useNavigate();
    const intl = useIntl();

    const showToast = (type, message) => {
        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type={type}
                    titleId={type === "success" ? "voucher.update.success_title" : "voucher.update.error_title"}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    };

    useEffect(() => {
        const fetchVoucher = async () => {
            try {
                const res = await getVoucherById(id);
                if (res.errCode === 0 && res.voucher) {
                    const voucher = res.voucher;
                    setOriginalVoucher(voucher);
                    setFormData({
                        id: voucher.id,
                        code: voucher.code,
                        discountType: voucher.discountType,
                        discountValue: voucher.discountValue,
                        applicationType: voucher.applicationType,
                        conditionType: voucher.conditionType,
                        conditionValue: voucher.conditionValue,
                        maxDiscountAmount: voucher.maxDiscountAmount || '',
                        minOrderValue: voucher.minOrderValue || '',
                        expiryDate: voucher.expiryDate ? voucher.expiryDate.split('T')[0] : '',
                        isPublic: voucher.isPublic,
                        usageLimit: voucher.usageLimit,
                        isActive: voucher.isActive
                    });
                } else {
                    showToast("error", 'Không tìm thấy voucher');
                    navigate('/admin/homepage-management/voucher-management');
                }
            } catch (error) {
                console.error('Error fetching voucher:', error);
                showToast("error", 'Lỗi khi tải thông tin voucher');
                navigate('/admin/homepage-management/voucher-management');
            } finally {
                setFetching(false);
            }
        };

        fetchVoucher();
    }, [id, navigate]);

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
                id: formData.id,
                code: formData.code.toUpperCase().trim(),
                discountType: formData.discountType,
                discountValue: parseFloat(formData.discountValue),
                applicationType: formData.applicationType,
                conditionType: formData.conditionType,
                conditionValue: formData.conditionValue || null,
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
                minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
                expiryDate: formData.expiryDate || null,
                isPublic: formData.isPublic,
                usageLimit: parseInt(formData.usageLimit),
                isActive: formData.isActive
            };

            const res = await updateVoucher(payload);

            if (res && res.errCode === 0) {
                showToast("success", 'Cập nhật voucher thành công!');
                setTimeout(() => {
                    navigate('/admin/homepage-management/voucher-management');
                }, 1500);
            } else {
                showToast("error", res.errMessage || 'Không thể cập nhật voucher');
            }
        } catch (err) {
            console.error('Update voucher error:', err);
            showToast("error", 'Lỗi server khi cập nhật voucher');
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

    if (fetching) {
        return (
            <div className="voucher-update-container">
                <div className="loading-state">
                    <p>Đang tải thông tin voucher...</p>
                </div>
            </div>
        );
    }

    const hasUsedCount = originalVoucher && originalVoucher.usedCount > 0;
    const isSensitiveField = (fieldName) => {
        return hasUsedCount && ['discountType', 'discountValue', 'applicationType'].includes(fieldName);
    };

    return (
        <div className="voucher-update-container">
            <HintBox
                content={
                    <div>
                        <p><strong>⚠️ Lưu ý khi cập nhật Voucher</strong></p>
                        <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                            <li>Không thể sửa các trường nhạy cảm nếu voucher đã có người claim</li>
                            <li>Các trường bị khóa: Loại giảm giá, Giá trị giảm, Áp dụng cho</li>
                            <li>Bạn vẫn có thể sửa: Hạn sử dụng, Giới hạn claim, Trạng thái</li>
                            {hasUsedCount && (
                                <li style={{ color: '#ef4444', fontWeight: 'bold' }}>
                                    Voucher này đã có {originalVoucher.usedCount} lượt claim. Một số trường đã bị khóa!
                                </li>
                            )}
                        </ul>
                    </div>
                }
            />

            <h1><FormattedMessage id="voucher.update.title" defaultMessage="Cập nhật Voucher" /></h1>

            <form onSubmit={handleSubmit} className="voucher-update-form">
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
                            required
                            style={{ textTransform: 'uppercase' }}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                Loại giảm giá: <span className="required">*</span>
                                {isSensitiveField('discountType') && <span style={{ color: '#ef4444' }}> [Đã khóa]</span>}
                            </label>
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleChange}
                                disabled={isSensitiveField('discountType')}
                                required
                            >
                                <option value="percent">Phần trăm (%)</option>
                                <option value="fixed">Số tiền cố định (đ)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                Giá trị giảm: <span className="required">*</span>
                                {isSensitiveField('discountValue') && <span style={{ color: '#ef4444' }}> [Đã khóa]</span>}
                            </label>
                            <input
                                type="number"
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleChange}
                                min="0"
                                step={formData.discountType === 'percent' ? '1' : '1000'}
                                disabled={isSensitiveField('discountValue')}
                                required
                            />
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
                                min="0"
                                step="1000"
                            />
                        </div>

                        <div className="form-group">
                            <label>Giá trị đơn tối thiểu:</label>
                            <input
                                type="number"
                                name="minOrderValue"
                                value={formData.minOrderValue}
                                onChange={handleChange}
                                min="0"
                                step="1000"
                            />
                        </div>
                    </div>
                </div>

                {/* Phạm vi áp dụng */}
                <div className="form-section">
                    <h3>Phạm vi áp dụng</h3>

                    <div className="form-group">
                        <label>
                            Áp dụng cho: <span className="required">*</span>
                            {isSensitiveField('applicationType') && <span style={{ color: '#ef4444' }}> [Đã khóa]</span>}
                        </label>
                        <select
                            name="applicationType"
                            value={formData.applicationType}
                            onChange={handleChange}
                            disabled={isSensitiveField('applicationType')}
                            required
                        >
                            <option value="order">Toàn đơn hàng</option>
                            <option value="product">Sản phẩm cụ thể</option>
                            <option value="shipping">Phí vận chuyển</option>
                        </select>
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
                                min="1"
                                required
                            />
                            {originalVoucher && (
                                <small>
                                    Đã claim: {originalVoucher.usedCount} / {originalVoucher.usageLimit}
                                </small>
                            )}
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
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                <span>Kích hoạt</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="form-actions">
                    <button className="btn-submit" type="submit" disabled={loading}>
                        {loading ? 'Đang cập nhật...' : 'Cập nhật Voucher'}
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

export default VoucherUpdate;

