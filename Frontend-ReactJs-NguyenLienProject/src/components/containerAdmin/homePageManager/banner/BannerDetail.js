import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { getBannerById } from '../../../../services/bannerService';
import BannerDelete from './BannerDelete';
import BannerActive from './BannerActive';
import './BannerDetail.scss';

const BannerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const intl = useIntl();
    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await getBannerById(id);
                if (res.errCode === 0 && res.banner) {
                    setBanner(res.banner);
                } else {
                    navigate('/admin/homepage-management/banner-management');
                }
            } catch (error) {
                console.error('Error fetching banner:', error);
                navigate('/admin/homepage-management/banner-management');
            } finally {
                setLoading(false);
            }
        };
        fetchBanner();
    }, [id, navigate]);

    const handleEdit = () => {
        navigate(`/admin/homepage-management/banner-management/banner-update/${id}`);
    };

    const handleDeleteSuccess = () => {
        // Navigate back to banner management after successful deletion
        navigate('/admin/homepage-management/banner-management');
    };

    const handleActiveSuccess = (bannerId, updatedBanner) => {
        // Update local banner state after successful activate/deactivate
        setBanner(updatedBanner);
    };

    if (loading) {
        return (
            <div className="banner-detail-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p><FormattedMessage id="body_admin.banner.detail.loading" defaultMessage="Đang tải thông tin banner..." /></p>
                </div>
            </div>
        );
    }

    if (!banner) {
        return (
            <div className="banner-detail-container">
                <div className="error-state">
                    <div className="error-icon">❓</div>
                    <h2><FormattedMessage id="body_admin.banner.detail.not_found_title" defaultMessage="Không tìm thấy banner" /></h2>
                    <p><FormattedMessage id="banner.detail.not_found" defaultMessage="Banner không tồn tại hoặc đã bị xóa" /></p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(-1)}
                    >
                        <FormattedMessage id="common.backToList" defaultMessage="Quay lại danh sách" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="banner-detail-container">
            <h1>
                <FormattedMessage id="body_admin.banner.detail.title" defaultMessage="Thông tin banner" />
            </h1>

            <div className="banner-detail-card">
                <div className="card-header">
                    <h2>{banner.title || intl.formatMessage({ id: 'body_admin.banner.detail.no_title', defaultMessage: 'Không có tiêu đề' })}</h2>
                    <div className="banner-id">ID: {banner.id}</div>
                </div>

                <div className="card-body">
                    <div className="detail-grid">
                        <div className="detail-section">
                            <h3 className="basic-info"><FormattedMessage id="body_admin.banner.detail.basic_info" defaultMessage="Thông tin cơ bản" /></h3>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.banner.detail.title_label" defaultMessage="Tiêu đề" />:</span>
                                <span className="value">{banner.title || intl.formatMessage({ id: 'body_admin.banner.detail.empty', defaultMessage: 'Không có' })}</span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.banner.detail.subtitle_label" defaultMessage="Phụ đề" />:</span>
                                <span className="value description">{banner.subtitle || intl.formatMessage({ id: 'body_admin.banner.detail.empty', defaultMessage: 'Không có' })}</span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.banner.detail.link_label" defaultMessage="Liên kết" />:</span>
                                <span className="value">
                                    {banner.link ? (
                                        <a href={banner.link} target="_blank" rel="noopener noreferrer" className="banner-link">
                                            {banner.link}
                                        </a>
                                    ) : (
                                        intl.formatMessage({ id: 'body_admin.banner.detail.empty', defaultMessage: 'Không có' })
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3 className="display-info"><FormattedMessage id="body_admin.banner.detail.display_info" defaultMessage="Thông tin hiển thị" /></h3>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.banner.detail.order_label" defaultMessage="Thứ tự" />:</span>
                                <span className="value order">{banner.order || 0}</span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.banner.detail.status_label" defaultMessage="Trạng thái" />:</span>
                                <span className="value">
                                    <span className={`badge ${banner.isActive ? 'active' : 'inactive'}`}>
                                        {banner.isActive ? (
                                            <FormattedMessage id="body_admin.banner.detail.status_active" defaultMessage="Đang hiển thị" />
                                        ) : (
                                            <FormattedMessage id="body_admin.banner.detail.status_inactive" defaultMessage="Đã ẩn" />
                                        )}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3 className="timestamps"><FormattedMessage id="body_admin.banner.detail.timestamps" defaultMessage="Thời gian" /></h3>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.banner.detail.created_at" defaultMessage="Ngày tạo" />:</span>
                                <span className="value">{banner.createdAt ? new Date(banner.createdAt).toLocaleDateString('vi-VN') : intl.formatMessage({ id: 'banner.detail.empty', defaultMessage: 'Không có' })}</span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.banner.detail.updated_at" defaultMessage="Ngày cập nhật" />:</span>
                                <span className="value">{banner.updatedAt ? new Date(banner.updatedAt).toLocaleDateString('vi-VN') : intl.formatMessage({ id: 'banner.detail.empty', defaultMessage: 'Không có' })}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3 className="images"><FormattedMessage id="body_admin.banner.detail.images" defaultMessage="Hình ảnh" /></h3>

                            <div className="detail-item">
                                <span className="value">
                                    <div className="banner-image-container">
                                        <img
                                            src={`http://localhost:8080${banner.imageUrl}`}
                                            alt={banner.title || 'Banner'}
                                            className="banner-detail-img"
                                        />
                                    </div>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="action-buttons">
                        <button className="btn-action btn-update" onClick={handleEdit}>
                            <FormattedMessage id="body_admin.banner.detail.edit_button" defaultMessage="Cập nhật thông tin" />
                        </button>

                        <BannerActive banner={banner} onSuccess={handleActiveSuccess} />

                        <BannerDelete banner={banner} onSuccess={handleDeleteSuccess} />

                        <button className="btn-action btn-back" onClick={() => navigate(-1)}>
                            <FormattedMessage id="body_admin.banner.detail.back_button" defaultMessage="Quay lại" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerDetail;
