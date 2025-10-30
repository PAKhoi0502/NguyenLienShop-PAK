import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { getVoucherById } from '../../../../services/voucherService';
import VoucherDelete from './VoucherDelete';
import VoucherToggle from './VoucherToggle';
import './VoucherDetail.scss';

const VoucherDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const intl = useIntl();
    const [voucher, setVoucher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVoucher = async () => {
            try {
                const res = await getVoucherById(id);
                if (res.errCode === 0 && res.voucher) {
                    setVoucher(res.voucher);
                } else {
                    navigate('/admin/homepage-management/voucher-management');
                }
            } catch (error) {
                console.error('Error fetching voucher:', error);
                navigate('/admin/homepage-management/voucher-management');
            } finally {
                setLoading(false);
            }
        };
        fetchVoucher();
    }, [id, navigate]);

    const handleEdit = () => {
        navigate(`/admin/homepage-management/voucher-management/voucher-update/${id}`);
    };

    const handleDeleteSuccess = () => {
        navigate('/admin/homepage-management/voucher-management');
    };

    const handleToggleSuccess = (voucherId, updatedVoucher) => {
        setVoucher(updatedVoucher);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Không giới hạn';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDiscountValue = (voucher) => {
        if (!voucher) return '';
        if (voucher.discountType === 'percent') {
            return `${voucher.discountValue}%`;
        }
        return `${voucher.discountValue.toLocaleString('vi-VN')}đ`;
    };

    const getApplicationTypeLabel = (type) => {
        const labels = {
            'order': 'Toàn đơn hàng',
            'product': 'Sản phẩm cụ thể',
            'shipping': 'Phí vận chuyển'
        };
        return labels[type] || type;
    };

    const getConditionTypeLabel = (type) => {
        const labels = {
            'none': 'Không có điều kiện',
            'first_order': 'Chỉ đơn hàng đầu tiên',
            'location': 'Theo địa điểm',
            'user_segment': 'Theo phân khúc khách hàng',
            'specific_category': 'Theo danh mục sản phẩm',
            'min_items': 'Số lượng sản phẩm tối thiểu'
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <div className="voucher-detail-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Đang tải thông tin voucher...</p>
                </div>
            </div>
        );
    }

    if (!voucher) {
        return (
            <div className="voucher-detail-container">
                <div className="error-state">
                    <div className="error-icon">❓</div>
                    <h2>Không tìm thấy voucher</h2>
                    <p>Voucher không tồn tại hoặc đã bị xóa</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(-1)}
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="voucher-detail-container">
            <h1>Chi tiết Voucher</h1>

            <div className="voucher-detail-card">
                <div className="card-header">
                    <div className="header-content">
                        <h2 style={{ fontFamily: 'monospace', color: '#2563eb' }}>{voucher.code}</h2>
                        <div className="voucher-id">ID: {voucher.id}</div>
                    </div>
                    <div className="header-badges">
                        <span className={`badge ${voucher.isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {voucher.isActive ? '✅ Đang hoạt động' : '❌ Đã tắt'}
                        </span>
                        <span className={`badge ${voucher.isPublic ? 'badge-public' : 'badge-private'}`}>
                            {voucher.isPublic ? '🌐 Công khai' : '🔒 Riêng tư'}
                        </span>
                    </div>
                </div>

                <div className="card-body">
                    <div className="detail-grid">
                        {/* Thông tin giảm giá */}
                        <div className="detail-section">
                            <h3 className="section-title">💰 Thông tin giảm giá</h3>

                            <div className="detail-item">
                                <span className="label">Loại giảm giá:</span>
                                <span className="value">
                                    {voucher.discountType === 'percent' ? (
                                        <span style={{ color: '#10b981' }}>📊 Phần trăm (%)</span>
                                    ) : (
                                        <span style={{ color: '#f59e0b' }}>💵 Số tiền cố định</span>
                                    )}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label">Giá trị giảm:</span>
                                <span className="value" style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ef4444' }}>
                                    {formatDiscountValue(voucher)}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label">Giảm tối đa:</span>
                                <span className="value">
                                    {voucher.maxDiscountAmount ?
                                        `${voucher.maxDiscountAmount.toLocaleString('vi-VN')}đ` :
                                        'Không giới hạn'
                                    }
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label">Giá trị đơn tối thiểu:</span>
                                <span className="value">
                                    {voucher.minOrderValue > 0 ?
                                        `${voucher.minOrderValue.toLocaleString('vi-VN')}đ` :
                                        'Không yêu cầu'
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Phạm vi áp dụng */}
                        <div className="detail-section">
                            <h3 className="section-title">🎯 Phạm vi áp dụng</h3>

                            <div className="detail-item">
                                <span className="label">Áp dụng cho:</span>
                                <span className="value" style={{ fontWeight: '600' }}>
                                    {getApplicationTypeLabel(voucher.applicationType)}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label">Điều kiện:</span>
                                <span className="value">
                                    {getConditionTypeLabel(voucher.conditionType)}
                                </span>
                            </div>

                            {voucher.conditionValue && (
                                <div className="detail-item">
                                    <span className="label">Chi tiết điều kiện:</span>
                                    <span className="value">
                                        <pre style={{
                                            background: '#f3f4f6',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            fontSize: '0.85em',
                                            overflow: 'auto'
                                        }}>
                                            {JSON.stringify(voucher.conditionValue, null, 2)}
                                        </pre>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Thông tin sử dụng */}
                        <div className="detail-section">
                            <h3 className="section-title">📊 Thông tin sử dụng</h3>

                            <div className="detail-item">
                                <span className="label">Số lượng đã claim:</span>
                                <span className="value" style={{
                                    fontSize: '1.1em',
                                    fontWeight: 'bold',
                                    color: voucher.usedCount >= voucher.usageLimit ? '#ef4444' : '#10b981'
                                }}>
                                    {voucher.usedCount} / {voucher.usageLimit}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label">Tỷ lệ sử dụng:</span>
                                <span className="value">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            flex: 1,
                                            height: '8px',
                                            background: '#e5e7eb',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${(voucher.usedCount / voucher.usageLimit) * 100}%`,
                                                height: '100%',
                                                background: voucher.usedCount >= voucher.usageLimit ? '#ef4444' : '#10b981',
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                        <span style={{ fontWeight: '600', fontSize: '0.9em' }}>
                                            {((voucher.usedCount / voucher.usageLimit) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label">Hạn sử dụng:</span>
                                <span className="value" style={{
                                    color: voucher.expiryDate && new Date(voucher.expiryDate) < new Date() ? '#ef4444' : 'inherit'
                                }}>
                                    {formatDate(voucher.expiryDate)}
                                    {voucher.expiryDate && new Date(voucher.expiryDate) < new Date() && (
                                        <span style={{ marginLeft: '8px', color: '#ef4444', fontWeight: 'bold' }}>
                                            ⚠️ Đã hết hạn
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Thời gian */}
                        <div className="detail-section">
                            <h3 className="section-title">🕒 Thời gian</h3>

                            <div className="detail-item">
                                <span className="label">Ngày tạo:</span>
                                <span className="value">
                                    {voucher.createdAt ? formatDate(voucher.createdAt) : 'N/A'}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label">Cập nhật lần cuối:</span>
                                <span className="value">
                                    {voucher.updatedAt ? formatDate(voucher.updatedAt) : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Danh sách users đã claim (nếu có) */}
                        {voucher.users && voucher.users.length > 0 && (
                            <div className="detail-section full-width">
                                <h3 className="section-title">👥 Người dùng đã claim ({voucher.users.length})</h3>
                                <div className="users-table-wrapper">
                                    <table className="users-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Tên đăng nhập</th>
                                                <th>Email</th>
                                                <th>Đã dùng/Giới hạn</th>
                                                <th>Ngày claim</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {voucher.users.map(user => (
                                                <tr key={user.id}>
                                                    <td>{user.id}</td>
                                                    <td>{user.userName}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        {user.UserDiscount?.usedCount || 0} / {user.UserDiscount?.usageLimit || 0}
                                                    </td>
                                                    <td>
                                                        {user.UserDiscount?.collectedAt ?
                                                            formatDate(user.UserDiscount.collectedAt) :
                                                            'N/A'
                                                        }
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${user.UserDiscount?.status || 'unknown'}`}>
                                                            {user.UserDiscount?.status || 'N/A'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card-footer">
                    <div className="action-buttons">
                        <button className="btn-action btn-update" onClick={handleEdit}>
                            Cập nhật thông tin
                        </button>

                        <VoucherToggle voucher={voucher} onSuccess={handleToggleSuccess} />

                        <VoucherDelete voucher={voucher} onSuccess={handleDeleteSuccess} />

                        <button className="btn-action btn-back" onClick={() => navigate(-1)}>
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherDetail;

