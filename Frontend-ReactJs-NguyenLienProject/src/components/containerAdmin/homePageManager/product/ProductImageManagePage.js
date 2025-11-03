import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useIntl, FormattedMessage } from 'react-intl';
import { getProductById } from '../../../../services/productService';
import CustomToast from '../../../CustomToast';
import {
    getImagesByProductId,
    createProductImage,
    setThumbnail,
    deleteProductImage
} from '../../../../services/productImageService';
import './ProductImageManagePage.scss';

const ProductImageManagePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const intl = useIntl();
    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (id) {
            loadProductInfo();
            loadImages();
        }
    }, [id]);

    const loadProductInfo = async () => {
        try {
            const result = await getProductById(id);
            if (result.errCode === 0) {
                setProduct(result.product);
            } else {
                showToast('error', result.errMessage || 'Không thể tải thông tin sản phẩm');
                navigate(-1);
            }
        } catch (error) {
            console.error('Load product error:', error);
            showToast('error', 'Lỗi khi tải thông tin sản phẩm');
            navigate(-1);
        }
    };

    const loadImages = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const result = await getImagesByProductId(id);
            if (result.errCode === 0) {
                setImages(result.images || []);
                if (result.images && result.images.length > 0 && !selectedImage) {
                    const thumbnail = result.images.find(img => img.isThumbnail) || result.images[0];
                    setSelectedImage(thumbnail);
                }
            } else {
                showToast('error', result.errMessage || 'Không thể tải danh sách ảnh');
            }
        } catch (error) {
            console.error('Load images error:', error);
            showToast('error', 'Lỗi khi tải danh sách ảnh');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showToast('error', intl.formatMessage({
                id: 'body_admin.product_management.images.invalid_file_type',
                defaultMessage: 'Chỉ chấp nhận file ảnh (JPG, PNG, WebP)'
            }));
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            showToast('error', intl.formatMessage({
                id: 'body_admin.product_management.images.file_too_large',
                defaultMessage: 'Kích thước file không được vượt quá 5MB'
            }));
            return;
        }

        await uploadImage(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadImage = async (file, isThumbnail = false) => {
        setUploading(true);
        try {
            const result = await createProductImage(id, file, isThumbnail);
            if (result.errCode === 0) {
                showToast('success', result.message || 'Thêm ảnh thành công');
                await loadImages();
            } else {
                showToast('error', result.errMessage || 'Không thể thêm ảnh');
            }
        } catch (error) {
            console.error('Upload image error:', error);
            showToast('error', 'Lỗi khi upload ảnh');
        } finally {
            setUploading(false);
        }
    };

    const handleSetThumbnail = async (imageId) => {
        setLoading(true);
        try {
            const result = await setThumbnail(id, imageId);
            if (result.errCode === 0) {
                showToast('success', result.message || 'Đặt làm ảnh chính thành công');
                await loadImages();
            } else {
                showToast('error', result.errMessage || 'Không thể đặt làm ảnh chính');
            }
        } catch (error) {
            console.error('Set thumbnail error:', error);
            showToast('error', 'Lỗi khi đặt làm ảnh chính');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm(intl.formatMessage({
            id: 'body_admin.product_management.images.confirm_delete',
            defaultMessage: 'Bạn có chắc chắn muốn xóa ảnh này?'
        }))) {
            return;
        }

        setLoading(true);
        try {
            const result = await deleteProductImage(imageId);
            if (result.errCode === 0) {
                showToast('success', result.message || 'Xóa ảnh thành công');
                await loadImages();
                if (selectedImage?.id === imageId) {
                    const remainingImages = images.filter(img => img.id !== imageId);
                    if (remainingImages.length > 0) {
                        setSelectedImage(remainingImages[0]);
                    } else {
                        setSelectedImage(null);
                    }
                }
            } else {
                showToast('error', result.errMessage || 'Không thể xóa ảnh');
            }
        } catch (error) {
            console.error('Delete image error:', error);
            showToast('error', 'Lỗi khi xóa ảnh');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, message) => {
        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type={type}
                    titleId={type === 'success' ? 'body_admin.product_management.images.success_title' : 'body_admin.product_management.images.error_title'}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `http://localhost:8080/uploads/${imageUrl}`;
    };

    const thumbnailImage = images.find(img => img.isThumbnail) || images[0];

    if (loading && !product) {
        return (
            <div className="product-image-page">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p><FormattedMessage id="body_admin.product_management.images.loading" defaultMessage="Đang tải thông tin sản phẩm..." /></p>
                </div>
            </div>
        );
    }

    return (
        <div className="product-image-page">
            <div className="page-container">
                {/* Header Card */}
                <div className="header-card">
                    <div className="header-content">
                        <div className="product-info">
                            <h2>{product?.nameProduct || 'Sản phẩm'}</h2>
                            <p className="product-id">ID: {id}</p>
                        </div>
                        <div className="header-actions">
                            <button
                                className="btn-action btn-back"
                                onClick={() => navigate(`/admin/product-category-management/product-management/product-detail/${id}`)}
                            >
                                <FormattedMessage id="body_admin.product_management.image_page.back_to_detail" defaultMessage="Quay lại chi tiết" />
                            </button>
                            <button
                                className="btn-action btn-back"
                                onClick={() => navigate(-1)}
                            >
                                <FormattedMessage id="body_admin.product_management.image_page.back" defaultMessage="Quay lại" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Image Manager Card */}
                <div className="content-card">
                    <div className="content-header">
                        <h3>
                            <FormattedMessage id="body_admin.product_management.images.title" defaultMessage="Hình ảnh sản phẩm" />
                        </h3>
                        <button
                            type="button"
                            className="btn-add-image"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || !id}
                        >
                            {uploading ? (
                                <FormattedMessage id="body_admin.product_management.images.uploading" defaultMessage="Đang tải..." />
                            ) : (
                                <>
                                    + <FormattedMessage id="body_admin.product_management.images.add_image" defaultMessage="Thêm ảnh" />
                                </>
                            )}
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    {images.length === 0 ? (
                        <div className="no-images">
                            <p><FormattedMessage id="body_admin.product_management.images.no_images" defaultMessage="Chưa có ảnh nào" /></p>
                            <button
                                type="button"
                                className="btn-add-image"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading || !id}
                            >
                                + <FormattedMessage id="body_admin.product_management.images.add_first_image" defaultMessage="Thêm ảnh đầu tiên" />
                            </button>
                        </div>
                    ) : (
                        <div className="image-gallery">
                            {/* Main Image Display */}
                            <div className="main-image-container">
                                {selectedImage ? (
                                    <img
                                        src={getImageUrl(selectedImage.imageUrl)}
                                        alt={intl.formatMessage({ id: 'body_admin.product_management.images.product_image', defaultMessage: 'Ảnh sản phẩm' })}
                                        className="main-image"
                                    />
                                ) : thumbnailImage ? (
                                    <img
                                        src={getImageUrl(thumbnailImage.imageUrl)}
                                        alt={intl.formatMessage({ id: 'body_admin.product_management.images.product_image', defaultMessage: 'Ảnh sản phẩm' })}
                                        className="main-image"
                                    />
                                ) : null}
                                {selectedImage?.isThumbnail && (
                                    <div className="thumbnail-badge">
                                        <FormattedMessage id="body_admin.product_management.images.thumbnail" defaultMessage="Ảnh chính" />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            <div className="thumbnail-gallery">
                                {images.map((image) => (
                                    <div
                                        key={image.id}
                                        className={`thumbnail-item ${selectedImage?.id === image.id ? 'active' : ''} ${image.isThumbnail ? 'is-thumbnail' : ''}`}
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <img
                                            src={getImageUrl(image.imageUrl)}
                                            alt={`Thumbnail ${image.id}`}
                                        />
                                        {image.isThumbnail && (
                                            <span className="thumbnail-star">⭐</span>
                                        )}
                                        <div className="thumbnail-actions">
                                            {!image.isThumbnail && (
                                                <button
                                                    className="btn-set-thumbnail"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSetThumbnail(image.id);
                                                    }}
                                                    title={intl.formatMessage({ id: 'body_admin.product_management.images.set_thumbnail', defaultMessage: 'Đặt làm ảnh chính' })}
                                                >
                                                    ⭐
                                                </button>
                                            )}
                                            <button
                                                className="btn-delete-image"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteImage(image.id);
                                                }}
                                                title={intl.formatMessage({ id: 'body_admin.product_management.images.delete', defaultMessage: 'Xóa ảnh' })}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductImageManagePage;
