import React, { useState, useEffect, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { getPublicVouchers } from '../../../services/voucherService';
import CustomToast from '../../CustomToast';
import VoucherCard from './VoucherCard';
import './VoucherList.scss';

const VoucherList = () => {
    const intl = useIntl();
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVouchers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getPublicVouchers();

            // Check if res exists and has valid structure
            if (!res) {
                console.error('getPublicVouchers returned undefined');
                setVouchers([]);
                setError(intl.formatMessage({ id: 'voucher.public.load_error', defaultMessage: 'Không thể tải danh sách voucher' }));
                return;
            }

            // Check if response is successful
            if (res.errCode === 0 && res.vouchers && Array.isArray(res.vouchers)) {
                // Filter only active and public vouchers
                const activeVouchers = res.vouchers.filter(voucher => {
                    if (!voucher.isActive) return false;
                    if (!voucher.isPublic) return false;
                    // Check expiry
                    if (voucher.expiryDate && new Date() > new Date(voucher.expiryDate)) {
                        return false;
                    }
                    return true;
                });
                setVouchers(activeVouchers);
            } else {
                // Handle error case
                setVouchers([]);
                const errorMsg = res.errMessage || res.errMsg || intl.formatMessage({ id: 'voucher.public.load_error', defaultMessage: 'Không thể tải danh sách voucher' });
                setError(errorMsg);

                // Only show toast if there's an actual error (not just empty list)
                if (res.errCode !== undefined && res.errCode !== 0) {
                    toast.error(
                        <CustomToast
                            type="error"
                            titleId="voucher.public.load_error_title"
                            message={errorMsg}
                            time={new Date()}
                        />,
                        { closeButton: false }
                    );
                }
            }
        } catch (err) {
            console.error('Fetch vouchers error:', err);
            const errorMsg = err?.response?.data?.errMessage || err?.message || intl.formatMessage({ id: 'voucher.public.load_error', defaultMessage: 'Không thể tải danh sách voucher' });
            setError(errorMsg);
            setVouchers([]);
            toast.error(
                <CustomToast
                    type="error"
                    titleId="voucher.public.load_error_title"
                    message={errorMsg}
                    time={new Date()}
                />,
                { closeButton: false }
            );
        } finally {
            setLoading(false);
        }
    }, [intl]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    const handleClaimSuccess = (voucherId) => {
        // Optional: Refresh vouchers after claim
        // fetchVouchers();
    };

    if (loading) {
        return (
            <div className="voucher-list-container">
                <div className="voucher-section-header">
                    <h2 className="section-title">
                        <FormattedMessage id="voucher.public.title" defaultMessage="Voucher khuyến mãi" />
                    </h2>
                </div>
                <div className="voucher-loading">
                    <FormattedMessage id="voucher.public.loading" defaultMessage="Đang tải voucher..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="voucher-list-container">
                <div className="voucher-section-header">
                    <h2 className="section-title">
                        <FormattedMessage id="voucher.public.title" defaultMessage="Voucher khuyến mãi" />
                    </h2>
                </div>
                <div className="voucher-error">
                    {error}
                </div>
            </div>
        );
    }

    if (vouchers.length === 0) {
        return (
            <div className="voucher-list-container">
                <div className="voucher-section-header">
                    <h2 className="section-title">
                        <FormattedMessage id="voucher.public.title" defaultMessage="Voucher khuyến mãi" />
                    </h2>
                </div>
                <div className="voucher-empty">
                    <FormattedMessage id="voucher.public.empty" defaultMessage="Hiện tại không có voucher nào" />
                </div>
            </div>
        );
    }

    return (
        <div className="voucher-list-container">
            <div className="voucher-section-header">
                <h2 className="section-title">
                    <FormattedMessage id="voucher.public.title" defaultMessage="Voucher khuyến mãi" />
                </h2>
                <p className="section-subtitle">
                    <FormattedMessage id="voucher.public.subtitle" defaultMessage="Lưu voucher ngay để nhận ưu đãi hấp dẫn" />
                </p>
            </div>

            <div className="voucher-grid">
                {vouchers.map((voucher) => (
                    <VoucherCard
                        key={voucher.id}
                        voucher={voucher}
                        onClaimSuccess={handleClaimSuccess}
                    />
                ))}
            </div>
        </div>
    );
};

export default VoucherList;

