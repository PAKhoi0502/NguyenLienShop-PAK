import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomToast from '../../../../components/CustomToast';
import { getVoucherById, updateVoucher } from '../../../../services/voucherService';
import { getAllCategories } from '../../../../services/categoryService';
import { getProvinces } from '../../../../services/vietnamLocationService';
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
                    titleId={type === "success" ? "voucher.update.success_title" : "voucher.update.error_title"}
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

    // Fetch categories
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

    // Fetch provinces
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

    // Fetch voucher
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
                        discountValue: voucher.discountType === 'fixed' ? formatNumber(voucher.discountValue) : voucher.discountValue,
                        applicationType: voucher.applicationType,
                        conditionType: voucher.conditionType,
                        conditionValue: voucher.conditionValue,
                        maxDiscountAmount: voucher.maxDiscountAmount ? formatNumber(voucher.maxDiscountAmount) : '',
                        minOrderValue: voucher.minOrderValue ? formatNumber(voucher.minOrderValue) : '',
                        expiryDate: voucher.expiryDate ? voucher.expiryDate.split('T')[0] : '',
                        isPublic: voucher.isPublic,
                        usageLimit: voucher.usageLimit,
                        isActive: voucher.isActive
                    });

                    // Parse conditionValue cho specific_category
                    if (voucher.conditionType === 'specific_category' && voucher.conditionValue) {
                        const categoryIds = voucher.conditionValue.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                        setSelectedCategories(categoryIds);
                    }

                    // Parse conditionValue cho location
                    if (voucher.conditionType === 'location' && voucher.conditionValue) {
                        const provinceNames = voucher.conditionValue.split(',').map(name => name.trim()).filter(name => name);
                        setSelectedProvinces(provinceNames);
                    }
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
                id: formData.id,
                code: formData.code.toUpperCase().trim(),
                discountType: formData.discountType,
                discountValue: parseFloat(parseNumber(formData.discountValue)),
                applicationType: formData.applicationType,
                conditionType: formData.conditionType,
                conditionValue: conditionValueToSend || null,
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(parseNumber(formData.maxDiscountAmount)) : null,
                minOrderValue: formData.minOrderValue ? parseFloat(parseNumber(formData.minOrderValue)) : 0,
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
                            <li>Bạn vẫn có thể sửa: Điều kiện, Chi tiết điều kiện, Hạn sử dụng, Giới hạn claim, Trạng thái</li>
                            <li><strong>Chi tiết điều kiện:</strong> Sẽ xuất hiện khi bạn chọn điều kiện cụ thể:
                                <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem' }}>
                                    <li>📍 <em>Địa điểm:</em> Chọn tỉnh/thành phố từ danh sách (có thể chọn nhiều)</li>
                                    <li>👥 <em>Phân khúc KH:</em> Chọn loại khách hàng (mới, thường xuyên, VIP)</li>
                                    <li>📁 <em>Danh mục:</em> Chọn danh mục sản phẩm từ danh sách (có thể chọn nhiều)</li>
                                    <li>🔢 <em>Số lượng tối thiểu:</em> Nhập số SP tối thiểu trong giỏ hàng</li>
                                </ul>
                            </li>
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
                                type={formData.discountType === 'fixed' ? 'text' : 'number'}
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleChange}
                                min={formData.discountType === 'percent' ? '0' : undefined}
                                step={formData.discountType === 'percent' ? '1' : undefined}
                                inputMode={formData.discountType === 'fixed' ? 'numeric' : 'decimal'}
                                disabled={isSensitiveField('discountValue')}
                                required
                            />
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
                                inputMode="numeric"
                            />
                        </div>

                        <div className="form-group">
                            <label>Giá trị đơn tối thiểu:</label>
                            <input
                                type="text"
                                name="minOrderValue"
                                value={formData.minOrderValue}
                                onChange={handleChange}
                                inputMode="numeric"
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

