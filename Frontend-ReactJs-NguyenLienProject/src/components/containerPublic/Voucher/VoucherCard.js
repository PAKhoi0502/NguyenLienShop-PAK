import React, { useState } from 'react';
import { FaTicketAlt, FaPercent, FaTag, FaTruck, FaClock, FaCheckCircle } from 'react-icons/fa';
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { claimVoucher } from '../../../services/voucherService';
import useAuth from '../../../hooks/useAuth';
import CustomToast from '../../CustomToast';
import './VoucherCard.scss';

const VoucherCard = ({ voucher, onClaimSuccess }) => {
    const intl = useIntl();
    const navigate = useNavigate();
    const { isAuthenticated, isUser } = useAuth();
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);

    // Format discount value
    const formatDiscount = () => {
        if (voucher.discountType === 'percent') {
            return `${voucher.discountValue}%`;
        } else {
            return `${voucher.discountValue.toLocaleString('vi-VN')}đ`;
        }
    };

    // Format application type
    const getApplicationTypeLabel = () => {
        switch (voucher.applicationType) {
            case 'order':
                return intl.formatMessage({ id: 'voucher.public.type_order', defaultMessage: 'Giảm toàn đơn' });
            case 'product':
                return intl.formatMessage({ id: 'voucher.public.type_product', defaultMessage: 'Giảm sản phẩm' });
            case 'shipping':
                return intl.formatMessage({ id: 'voucher.public.type_shipping', defaultMessage: 'Miễn phí ship' });
            default:
                return voucher.applicationType;
        }
    };

    // Get application icon
    const getApplicationIcon = () => {
        switch (voucher.applicationType) {
            case 'order':
                return <FaPercent />;
            case 'product':
                return <FaTag />;
            case 'shipping':
                return <FaTruck />;
            default:
                return <FaTicketAlt />;
        }
    };

    // Format expiry date
    const formatExpiryDate = () => {
        if (!voucher.expiryDate) {
            return intl.formatMessage({ id: 'voucher.public.no_expiry', defaultMessage: 'Không giới hạn' });
        }
        const date = new Date(voucher.expiryDate);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Check if voucher is expired
    const isExpired = () => {
        if (!voucher.expiryDate) return false;
        return new Date() > new Date(voucher.expiryDate);
    };

    // Check if voucher is available
    const isAvailable = () => {
        if (!voucher.isActive) return false;
        if (isExpired()) return false;
        if (voucher.usedCount >= voucher.usageLimit) return false;
        return true;
    };

    // Handle claim voucher
    const handleClaim = async () => {
        if (!isAuthenticated || !isUser) {
            toast.info(
                <CustomToast
                    type="info"
                    titleId="voucher.public.login_required_title"
                    message={intl.formatMessage({ id: 'voucher.public.login_required', defaultMessage: 'Vui lòng đăng nhập để lưu voucher' })}
                    time={new Date()}
                />,
                { closeButton: false }
            );
            setTimeout(() => {
                navigate('/login');
            }, 1500);
            return;
        }

        setIsClaiming(true);
        try {
            const res = await claimVoucher(voucher.code);
            if (res.errCode === 0) {
                setClaimed(true);
                toast.success(
                    <CustomToast
                        type="success"
                        titleId="voucher.public.claim_success_title"
                        message={res.errMessage || intl.formatMessage({ id: 'voucher.public.claim_success', defaultMessage: 'Lưu voucher thành công!' })}
                        time={new Date()}
                    />,
                    { closeButton: false }
                );
                if (onClaimSuccess) {
                    onClaimSuccess(voucher.id);
                }
            } else {
                toast.error(
                    <CustomToast
                        type="error"
                        titleId="voucher.public.claim_error_title"
                        message={res.errMessage || intl.formatMessage({ id: 'voucher.public.claim_error', defaultMessage: 'Không thể lưu voucher' })}
                        time={new Date()}
                    />,
                    { closeButton: false }
                );
            }
        } catch (error) {
            console.error('Claim voucher error:', error);
            toast.error(
                <CustomToast
                    type="error"
                    titleId="voucher.public.claim_error_title"
                    message={intl.formatMessage({ id: 'voucher.public.claim_error', defaultMessage: 'Lỗi khi lưu voucher' })}
                    time={new Date()}
                />,
                { closeButton: false }
            );
        } finally {
            setIsClaiming(false);
        }
    };

    const available = isAvailable();
    const expired = isExpired();

    return (
        <div className={`voucher-card-wrapper ${!available ? 'disabled' : ''} ${expired ? 'expired' : ''}`}>
            <div className='coupon-wrapper'>
                <div className="coupon">
                    <div className="coupon-left">
                        <div className="coupon-left-content">
                            <div className="voucher-code-text">{voucher.code}</div>
                            <div className="discount-value">{formatDiscount()}</div>
                            <div className="discount-type">{getApplicationTypeLabel()}</div>
                        </div>
                    </div>
                    <div className="coupon-con">
                        <div className="coupon-content">
                            {voucher.maxDiscountAmount && voucher.discountType === 'percent' && (
                                <div className="detail-item">
                                    <span className="detail-label">
                                        <FormattedMessage id="voucher.public.max_discount" defaultMessage="Giảm tối đa:" />
                                    </span>
                                    <span className="detail-value">{voucher.maxDiscountAmount.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                            )}
                            {voucher.minOrderValue > 0 && (
                                <div className="detail-item">
                                    <span className="detail-label">
                                        <FormattedMessage id="voucher.public.min_order_short" defaultMessage="Cho đơn từ" />
                                    </span>
                                    <span className="detail-value">{voucher.minOrderValue.toLocaleString('vi-VN')}₫</span>
                                </div>
                            )}
                            <div className="detail-item">
                                <span className="detail-label">
                                    <FormattedMessage id="voucher.public.condition_label" defaultMessage="Điều kiện:" />
                                </span>
                                <span className="detail-value">
                                    {voucher.conditionType === 'none' ? (
                                        <FormattedMessage id="voucher.public.condition.none" defaultMessage="Không có điều kiện" />
                                    ) : voucher.conditionType === 'first_order' ? (
                                        <FormattedMessage id="voucher.public.condition.first_order" defaultMessage="Chỉ áp dụng cho đơn đầu tiên" />
                                    ) : voucher.conditionType === 'location' ? (
                                        <FormattedMessage id="voucher.public.condition.location" defaultMessage="Áp dụng theo khu vực" />
                                    ) : voucher.conditionType === 'specific_category' ? (
                                        <FormattedMessage id="voucher.public.condition.category" defaultMessage="Áp dụng cho sản phẩm cụ thể" />
                                    ) : (
                                        'Có điều kiện'
                                    )}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <FormattedMessage id="voucher.public.expiry_label" defaultMessage="HSD:" />
                                </span>
                                <span className="detail-value">{formatExpiryDate()}</span>
                            </div>
                            <div className="coupon-footer">
                                {expired ? (
                                    <button className="btn-claim expired" disabled>
                                        <FormattedMessage id="voucher.public.expired" defaultMessage="Đã hết hạn" />
                                    </button>
                                ) : !available ? (
                                    <button className="btn-claim disabled" disabled>
                                        <FormattedMessage id="voucher.public.unavailable" defaultMessage="Đã hết lượt" />
                                    </button>
                                ) : claimed ? (
                                    <button className="btn-claim claimed" disabled>
                                        <FaCheckCircle />
                                        <FormattedMessage id="voucher.public.claimed" defaultMessage="Đã lưu" />
                                    </button>
                                ) : (
                                    <button
                                        className="btn-claim"
                                        onClick={handleClaim}
                                        disabled={isClaiming}
                                    >
                                        {isClaiming ? (
                                            <FormattedMessage id="voucher.public.claiming" defaultMessage="Đang lưu..." />
                                        ) : (
                                            <FormattedMessage id="voucher.public.claim" defaultMessage="Lưu voucher" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherCard;

