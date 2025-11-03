import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { getAllVouchers } from '../../../../services/voucherService';
import VoucherToggle from './VoucherToggle';
import VoucherDelete from './VoucherDelete';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';
import './VoucherManager.scss';

const VoucherManager = () => {
    const [vouchers, setVouchers] = useState([]);
    const [filteredVouchers, setFilteredVouchers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterApplication, setFilterApplication] = useState('all');
    const navigate = useNavigate();
    const intl = useIntl();

    const showToast = (type, message) => {
        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type={type}
                    titleId={type === "error" ? "voucher.manager.error_title" : "voucher.manager.success_title"}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    };

    const fetchVouchers = async () => {
        try {
            const filters = {};
            if (filterStatus !== 'all') {
                filters.isActive = filterStatus === 'active' ? 'true' : 'false';
            }
            if (filterApplication !== 'all') {
                filters.applicationType = filterApplication;
            }

            const res = await getAllVouchers(filters);
            if (res.errCode === 0) {
                setVouchers(Array.isArray(res.vouchers) ? res.vouchers : []);
            } else {
                showToast("error", res.errMessage || 'Không thể tải danh sách voucher');
            }
        } catch (err) {
            console.error('Fetch vouchers error:', err);
            showToast("error", 'Không thể tải danh sách voucher');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, [filterStatus, filterApplication]);

    useEffect(() => {
        const keyword = search.trim().toLowerCase();
        const filtered = vouchers.filter(voucher => {
            const matchSearch =
                (voucher.code || '').toLowerCase().includes(keyword) ||
                String(voucher.id).includes(keyword);

            return matchSearch;
        });

        setFilteredVouchers(filtered);
    }, [search, vouchers]);

    const handleDetailClick = (voucher) => {
        navigate(`/admin/homepage-management/voucher-management/voucher-detail/${voucher.id}`);
    };

    const handleUpdateClick = (clickedVoucher) => {
        const realVoucher = vouchers.find(v => v.id === clickedVoucher.id);
        if (realVoucher?.isActive) {
            showToast("error", 'Vui lòng tắt voucher trước khi cập nhật');
            return;
        }
        navigate(`/admin/homepage-management/voucher-management/voucher-update/${clickedVoucher.id}`);
    };

    const getApplicationTypeLabel = (type) => {
        const labels = {
            'order': 'Toàn đơn',
            'product': 'Sản phẩm',
            'shipping': 'Vận chuyển'
        };
        return labels[type] || type;
    };

    return (
        <div className="voucher-manager-container">
            <div className="voucher-manager-top">
                <h1 className="voucher-title">
                    <FormattedMessage id="voucher.manager.title_head" defaultMessage="Quản lý Voucher" />
                </h1>
                <button
                    className="btn-create-voucher"
                    onClick={() => navigate('/admin/homepage-management/voucher-management/voucher-create')}
                >
                    + <FormattedMessage id="voucher.manager.create_button" defaultMessage="Tạo voucher" />
                </button>
            </div>

            <div className="voucher-filters">
                <HintBox
                    content={
                        <div>
                            <p><strong>💡 Hướng dẫn quản lý Voucher</strong></p>
                            <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                                <li>Voucher có thể áp dụng cho toàn đơn, sản phẩm hoặc vận chuyển</li>
                                <li>Cẩn thận khi sửa voucher đang có người dùng sử dụng</li>
                                <li>Không thể xóa voucher đã được sử dụng trong đơn hàng</li>
                                <li>Tắt voucher để ngừng cho phép người dùng claim</li>
                            </ul>
                        </div>
                    }
                />

                <div className="filter-row">
                    <div className="filter-group">
                        <label><FormattedMessage id="voucher.manager.filter_status" defaultMessage="Trạng thái:" /></label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">Tất cả</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Đã tắt</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Áp dụng cho:</label>
                        <select value={filterApplication} onChange={(e) => setFilterApplication(e.target.value)}>
                            <option value="all">Tất cả</option>
                            <option value="order">Toàn đơn hàng</option>
                            <option value="product">Sản phẩm</option>
                            <option value="shipping">Vận chuyển</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="voucher-search-bar">
                <input
                    type="text"
                    placeholder="Tìm theo mã voucher, ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <p className="voucher-loading">
                    <FormattedMessage id="voucher.manager.loading" defaultMessage="Đang tải voucher..." />
                </p>
            ) : (
                <div className="voucher-table-wrapper">
                    <table className="voucher-table">
                        <thead>
                            <tr>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>ID</th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>Mã voucher</th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>Áp dụng</th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>Đã claim/Giới hạn</th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>Công khai</th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>Trạng thái</th>
                                <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVouchers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', color: '#888' }}>
                                        <FormattedMessage id="voucher.manager.empty_body" defaultMessage="Không có voucher nào phù hợp." />
                                    </td>
                                </tr>
                            ) : (
                                filteredVouchers.map((voucher) => (
                                    <tr key={voucher.id}>
                                        <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{voucher.id}</td>
                                        <td>
                                            <span
                                                className="voucher-code-link"
                                                onClick={() => handleDetailClick(voucher)}
                                                style={{
                                                    cursor: 'pointer',
                                                    color: '#2563eb',
                                                    textDecoration: 'underline',
                                                    fontWeight: 'bold',
                                                    fontFamily: 'monospace',
                                                    fontSize: '1.1rem'
                                                }}
                                            >
                                                {voucher.code}
                                            </span>
                                        </td>
                                        <td>{getApplicationTypeLabel(voucher.applicationType)}</td>
                                        <td>
                                            <span style={{
                                                color: voucher.usedCount >= voucher.usageLimit ? '#ef4444' : '#10b981'
                                            }}>
                                                {voucher.usedCount} / {voucher.usageLimit}
                                            </span>
                                        </td>
                                        <td>
                                            {voucher.isPublic ? (
                                                <span style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: 'bold' }}>✓ Có</span>
                                            ) : (
                                                <span style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: 'bold' }}>✗ Không</span>
                                            )}
                                        </td>
                                        <td>
                                            {voucher.isActive ? (
                                                <span style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                    ✅ Hoạt động
                                                </span>
                                            ) : (
                                                <span style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                    ❌ Đã tắt
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action btn-detail"
                                                    onClick={() => handleDetailClick(voucher)}
                                                >
                                                    Chi tiết
                                                </button>
                                                <button
                                                    className="btn-action btn-update"
                                                    onClick={() => handleUpdateClick(voucher)}
                                                >
                                                    Cập nhật
                                                </button>
                                                <VoucherToggle
                                                    voucher={voucher}
                                                    onSuccess={(voucherId, updatedVoucher) => {
                                                        setVouchers(prev => prev.map(v => v.id === voucherId ? updatedVoucher : v));
                                                    }}
                                                />
                                                <VoucherDelete
                                                    voucher={voucher}
                                                    onSuccess={(deletedVoucherId) => {
                                                        setVouchers(prev => prev.filter(v => v.id !== deletedVoucherId));
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VoucherManager;

