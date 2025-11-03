import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomToast from '../../../../components/CustomToast';
import { createVoucher } from '../../../../services/voucherService';
import { getAllCategories } from '../../../../services/categoryService';
import { getProvinces } from '../../../../services/vietnamLocationService';
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
        isActive: false  // Mặc định ẩn voucher khi tạo mới
    });

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [selectedProvinces, setSelectedProvinces] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
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

    // Helper: Format số với dấu chấm phân cách hàng nghìn (100000 -> 100.000)
    const formatNumber = (value) => {
        if (!value) return '';
        // Bỏ tất cả ký tự không phải số
        const numericValue = value.toString().replace(/\D/g, '');
        if (!numericValue) return '';
        // Thêm dấu chấm phân cách hàng nghìn
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Helper: Parse số từ string có dấu chấm thành số (100.000 -> 100000)
    const parseNumber = (value) => {
        if (!value) return '';
        return value.toString().replace(/\./g, '');
    };

    // Fetch categories khi component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const res = await getAllCategories();
                if (res && res.errCode === 0) {
                    setCategories(Array.isArray(res.categories) ? res.categories : []);
                } else if (Array.isArray(res)) {
                    setCategories(res);
                } else {
                    console.error('Fetch categories error:', res);
                    setCategories([]);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setCategories([]);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Fetch provinces khi component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProvinces(true);
            try {
                const res = await getProvinces();
                if (res && res.errCode === 0) {
                    setProvinces(Array.isArray(res.provinces) ? res.provinces : []);
                } else {
                    console.error('Fetch provinces error:', res);
                    setProvinces([]);
                }
            } catch (err) {
                console.error('Error fetching provinces:', err);
                setProvinces([]);
            } finally {
                setLoadingProvinces(false);
            }
        };

        fetchProvinces();
    }, []);

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

        // Validation cho conditionValue
        if (formData.conditionType === 'min_items') {
            if (!formData.conditionValue || formData.conditionValue <= 0) {
                showToast("error", 'Vui lòng nhập số lượng sản phẩm tối thiểu');
                return;
            }
        }

        if (formData.conditionType === 'specific_category') {
            if (selectedCategories.length === 0) {
                showToast("error", 'Vui lòng chọn ít nhất một danh mục sản phẩm');
                return;
            }
        }

        setLoading(true);

        try {
            // Xử lý conditionValue cho specific_category và location
            let conditionValueToSend = formData.conditionValue;
            if (formData.conditionType === 'specific_category' && selectedCategories.length > 0) {
                conditionValueToSend = selectedCategories.join(',');
            } else if (formData.conditionType === 'location' && selectedProvinces.length > 0) {
                conditionValueToSend = selectedProvinces.join(',');
            }

            const payload = {
                ...formData,
                code: formData.code.toUpperCase().trim(),
                discountValue: parseFloat(parseNumber(formData.discountValue)),
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(parseNumber(formData.maxDiscountAmount)) : null,
                minOrderValue: formData.minOrderValue ? parseFloat(parseNumber(formData.minOrderValue)) : 0,
                usageLimit: parseInt(formData.usageLimit),
                expiryDate: formData.expiryDate || null,
                conditionValue: conditionValueToSend || null
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

        // Nếu thay đổi conditionType, reset selections
        if (name === 'conditionType') {
            if (value !== 'specific_category') {
                setSelectedCategories([]);
            }
            if (value !== 'location') {
                setSelectedProvinces([]);
            }
        }

        // Auto-format số tiền cho các trường số
        let finalValue = type === 'checkbox' ? checked : value;

        // Format số tiền với dấu chấm
        if (name === 'discountValue' && formData.discountType === 'fixed') {
            finalValue = formatNumber(value);
        } else if (name === 'maxDiscountAmount' || name === 'minOrderValue') {
            finalValue = formatNumber(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    // Toggle category selection
    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    // Select all categories
    const handleSelectAllCategories = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(categories.map(cat => cat.id));
        }
    };

    // Toggle province selection
    const handleProvinceToggle = (provinceName) => {
        setSelectedProvinces(prev => {
            if (prev.includes(provinceName)) {
                return prev.filter(name => name !== provinceName);
            } else {
                return [...prev, provinceName];
            }
        });
    };

    // Select all provinces
    const handleSelectAllProvinces = () => {
        if (selectedProvinces.length === provinces.length) {
            setSelectedProvinces([]);
        } else {
            setSelectedProvinces(provinces.map(p => p.name));
        }
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
                            <li><strong>Chi tiết điều kiện:</strong> Sẽ xuất hiện khi bạn chọn điều kiện cụ thể:
                                <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem' }}>
                                    <li>📍 <em>Địa điểm:</em> Chọn tỉnh/thành phố từ danh sách (có thể chọn nhiều)</li>
                                    <li>👥 <em>Phân khúc KH:</em> Chọn loại khách hàng (mới, thường xuyên, VIP)</li>
                                    <li>📁 <em>Danh mục:</em> Chọn danh mục sản phẩm từ danh sách (có thể chọn nhiều)</li>
                                    <li>🔢 <em>Số lượng tối thiểu:</em> Nhập số SP tối thiểu trong giỏ hàng</li>
                                </ul>
                            </li>
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
                                type={formData.discountType === 'fixed' ? 'text' : 'number'}
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleChange}
                                placeholder={formData.discountType === 'percent' ? 'VD: 10 (%)' : 'VD: 50.000 (VNĐ)'}
                                min={formData.discountType === 'percent' ? '0' : undefined}
                                step={formData.discountType === 'percent' ? '1' : undefined}
                                inputMode={formData.discountType === 'fixed' ? 'numeric' : 'decimal'}
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
                                type="text"
                                name="maxDiscountAmount"
                                value={formData.maxDiscountAmount}
                                onChange={handleChange}
                                placeholder="VD: 100.000 (VNĐ)"
                                inputMode="numeric"
                            />
                            <small>Chỉ áp dụng cho loại phần trăm. Để trống = không giới hạn</small>
                        </div>

                        <div className="form-group">
                            <label>Giá trị đơn tối thiểu:</label>
                            <input
                                type="text"
                                name="minOrderValue"
                                value={formData.minOrderValue}
                                onChange={handleChange}
                                placeholder="VD: 200.000 (VNĐ)"
                                inputMode="numeric"
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

                    {/* Chi tiết điều kiện - Hiển thị động dựa trên conditionType */}
                    {formData.conditionType !== 'none' && formData.conditionType !== 'first_order' && (
                        <div className="form-group condition-value-group">
                            <label>
                                Chi tiết điều kiện:
                                {(formData.conditionType === 'min_items' || formData.conditionType === 'specific_category') &&
                                    <span className="required"> *</span>
                                }
                            </label>

                            {/* Location - Chọn tỉnh/thành phố từ danh sách */}
                            {formData.conditionType === 'location' && (
                                <div className="province-selector">
                                    {loadingProvinces ? (
                                        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Đang tải danh sách tỉnh/thành phố...</p>
                                    ) : provinces.length === 0 ? (
                                        <p style={{ color: '#ef4444' }}>Không thể tải danh sách tỉnh/thành phố.</p>
                                    ) : (
                                        <>
                                            <div className="province-header">
                                                <small>Chọn tỉnh/thành phố áp dụng voucher (có thể chọn nhiều)</small>
                                                <button
                                                    type="button"
                                                    className="btn-select-all"
                                                    onClick={handleSelectAllProvinces}
                                                >
                                                    {selectedProvinces.length === provinces.length ? '❌ Bỏ chọn tất cả' : '✅ Chọn tất cả'}
                                                </button>
                                            </div>
                                            <div className="province-list">
                                                {provinces.map(province => (
                                                    <label key={province.code} className="province-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedProvinces.includes(province.name)}
                                                            onChange={() => handleProvinceToggle(province.name)}
                                                        />
                                                        <span className="province-name">
                                                            {province.name}
                                                        </span>
                                                        <span className="province-code">Code: {province.code}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {selectedProvinces.length > 0 && (
                                                <div className="selected-summary">
                                                    <strong>Đã chọn:</strong> {selectedProvinces.length} tỉnh/thành phố
                                                    <span className="selected-names">
                                                        {selectedProvinces.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* User Segment - Chọn phân khúc KH */}
                            {formData.conditionType === 'user_segment' && (
                                <>
                                    <select
                                        name="conditionValue"
                                        value={formData.conditionValue || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            conditionValue: e.target.value
                                        }))}
                                    >
                                        <option value="">-- Chọn phân khúc --</option>
                                        <option value="new">Khách hàng mới</option>
                                        <option value="regular">Khách hàng thường xuyên</option>
                                        <option value="vip">Khách hàng VIP</option>
                                    </select>
                                    <small>Chọn phân khúc khách hàng được áp dụng voucher</small>
                                </>
                            )}

                            {/* Specific Category - Chọn danh mục từ danh sách */}
                            {formData.conditionType === 'specific_category' && (
                                <div className="category-selector">
                                    {loadingCategories ? (
                                        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Đang tải danh mục...</p>
                                    ) : categories.length === 0 ? (
                                        <p style={{ color: '#ef4444' }}>Không có danh mục nào. Vui lòng tạo danh mục trước.</p>
                                    ) : (
                                        <>
                                            <div className="category-header">
                                                <small>Chọn danh mục sản phẩm áp dụng voucher (có thể chọn nhiều)</small>
                                                <button
                                                    type="button"
                                                    className="btn-select-all"
                                                    onClick={handleSelectAllCategories}
                                                >
                                                    {selectedCategories.length === categories.length ? '❌ Bỏ chọn tất cả' : '✅ Chọn tất cả'}
                                                </button>
                                            </div>
                                            <div className="category-list">
                                                {categories.map(category => (
                                                    <label key={category.id} className="category-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(category.id)}
                                                            onChange={() => handleCategoryToggle(category.id)}
                                                        />
                                                        <span className="category-name">
                                                            {category.name || category.categoryName}
                                                        </span>
                                                        <span className="category-id">ID: {category.id}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {selectedCategories.length > 0 && (
                                                <div className="selected-summary">
                                                    <strong>Đã chọn:</strong> {selectedCategories.length} danh mục
                                                    <span className="selected-ids">
                                                        (ID: {selectedCategories.join(', ')})
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Min Items - Nhập số lượng tối thiểu */}
                            {formData.conditionType === 'min_items' && (
                                <>
                                    <input
                                        type="number"
                                        name="conditionValue"
                                        value={typeof formData.conditionValue === 'number' ? formData.conditionValue : ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            conditionValue: parseInt(e.target.value) || 0
                                        }))}
                                        placeholder="VD: 3"
                                        min="1"
                                        required
                                    />
                                    <small>Số lượng sản phẩm tối thiểu trong đơn hàng</small>
                                </>
                            )}
                        </div>
                    )}
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
                            <small>Nếu tắt, chỉ admin có thể gán voucher cho user. Voucher sẽ ẩn mặc định, bật sau khi kiểm tra.</small>
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

