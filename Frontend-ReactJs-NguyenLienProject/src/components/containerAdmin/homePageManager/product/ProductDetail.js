import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import { getProductById } from '../../../../services/productService.js';
import './ProductDetail.scss';
import './ProductDetail.scss';

const ProductDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const intl = useIntl();
   const [product, setProduct] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchProduct = async () => {
         try {
            console.log('Fetching product with ID:', id);
            setLoading(true);
            setError(null);

            const res = await getProductById(id);
            console.log('API Response:', res);

            if (!res) {
               setError('Không thể kết nối với server');
               return;
            }

            if (res.errCode === 1) {
               setError('ID sản phẩm không hợp lệ');
               return;
            }

            if (res.errCode === 404 || !res.product) {
               setError('Không tìm thấy thông tin sản phẩm');
               return;
            }

            setProduct(res.product);

            // Debug: Log product data to check structure
            console.log('Product data:', res.product);
            console.log('ProductCategories:', res.product?.ProductCategories);
            console.log('Categories:', res.product?.categories);
            console.log('All keys:', Object.keys(res.product || {}));
         } catch (err) {
            console.error('Fetch product error:', err);
            setError('Có lỗi xảy ra khi tải thông tin sản phẩm');
         } finally {
            setLoading(false);
         }
      };

      if (id) {
         fetchProduct();
      }
   }, [id, navigate]);

   const handleEdit = () => {
      if (product?.isActive) {
         toast.error(intl.formatMessage({
            id: 'product.detail.update_blocked',
            defaultMessage: 'Vui lòng ẩn sản phẩm trước khi cập nhật',
         }));
         return;
      }

      navigate(`/admin/product-category-management/product-management/product-update/${id}`);
   };


   if (loading) {
      return (
         <div className="product-detail-container">
            <div className="loading-state">
               <div className="loading-spinner"></div>
               <p><FormattedMessage id="product.detail.loading" defaultMessage="Đang tải thông tin sản phẩm..." /></p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="product-detail-container">
            <div className="error-state">
               <div className="error-icon">❌</div>
               <h2><FormattedMessage id="product.detail.error_title" defaultMessage="Lỗi tải dữ liệu" /></h2>
               <p>{error}</p>
               <button
                  className="btn btn-primary"
                  onClick={() => navigate('/admin/product-category-management/product-management')}
               >
                  <FormattedMessage id="common.backToList" defaultMessage="Quay lại danh sách" />
               </button>
            </div>
         </div>
      );
   }

   if (!product) {
      return (
         <div className="product-detail-container">
            <div className="error-state">
               <div className="error-icon">❓</div>
               <h2><FormattedMessage id="product.detail.not_found_title" defaultMessage="Không tìm thấy sản phẩm" /></h2>
               <p><FormattedMessage id="product.detail.not_found" defaultMessage="Sản phẩm không tồn tại hoặc đã bị xóa" /></p>
               <button
                  className="btn btn-primary"
                  onClick={() => navigate('/admin/product-category-management/product-management')}
               >
                  <FormattedMessage id="common.backToList" defaultMessage="Quay lại danh sách" />
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="product-detail-container">
         <h1><FormattedMessage id="product.detail.title" defaultMessage="Thông tin sản phẩm" /></h1>

         <div className="product-detail-card">
            <div className="card-header">
               <h2>{product.nameProduct || intl.formatMessage({ id: 'product.detail.no_name', defaultMessage: 'Không có tên sản phẩm' })}</h2>
               <div className="product-id">ID: {product.id}</div>
            </div>

            <div className="card-body">
               <div className="detail-grid">
                  {/* Basic Information */}
                  <div className="detail-section">
                     <h3 className="basic-info"><FormattedMessage id="product.detail.basic_info" defaultMessage="Thông tin cơ bản" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="product.detail.name" defaultMessage="Tên sản phẩm" />:</span>
                        <span className="value">{product.nameProduct || intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="product.detail.description" defaultMessage="Mô tả" />:</span>
                        <span className="value description">{product.description || intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="product.detail.dimensions" defaultMessage="Kích thước" />:</span>
                        <span className="value">{product.dimensions || intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                  </div>

                  {/* Pricing Information */}
                  <div className="detail-section">
                     <h3 className="pricing"><FormattedMessage id="product.detail.pricing" defaultMessage="Thông tin giá" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="product.detail.price" defaultMessage="Giá" />:</span>
                        <span className="value price">{product.price ? `${product.price.toLocaleString()} VNĐ` : intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="product.detail.discountPrice" defaultMessage="Giá khuyến mãi" />:</span>
                        <span className="value discount-price">{product.discountPrice ? `${product.discountPrice.toLocaleString()} VNĐ` : intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                  </div>

                  {/* Inventory Information */}
                  <div className="detail-section">
                     <h3 className="inventory"><FormattedMessage id="product.detail.inventory" defaultMessage="Tồn kho" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="product.detail.stock" defaultMessage="Số lượng tồn kho" />:</span>
                        <span className="value stock">{product.stock || 0}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="product.detail.isActive" defaultMessage="Trạng thái" />:</span>
                        <span className="value">
                           <span className={`badge ${product.isActive ? 'active' : 'inactive'}`}>
                              {product.isActive ? intl.formatMessage({ id: 'product.detail.active', defaultMessage: 'Đang hiển thị' }) : intl.formatMessage({ id: 'product.detail.inactive', defaultMessage: 'Đã ẩn' })}
                           </span>
                        </span>
                     </div>
                  </div>

                  {/* Features Information */}
                  <div className="detail-section">
                     <h3 className="features"><FormattedMessage id="product.detail.features" defaultMessage="Đặc điểm" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="product.detail.isNew" defaultMessage="Sản phẩm mới" />:</span>
                        <span className="value">
                           <span className={`badge ${product.isNew ? 'new' : 'inactive'}`}>
                              {product.isNew ? intl.formatMessage({ id: 'product.detail.yes', defaultMessage: 'Có' }) : intl.formatMessage({ id: 'product.detail.no', defaultMessage: 'Không' })}
                           </span>
                        </span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="product.detail.isBestSeller" defaultMessage="Bán chạy" />:</span>
                        <span className="value">
                           <span className={`badge ${product.isBestSeller ? 'bestseller' : 'inactive'}`}>
                              {product.isBestSeller ? intl.formatMessage({ id: 'product.detail.yes', defaultMessage: 'Có' }) : intl.formatMessage({ id: 'product.detail.no', defaultMessage: 'Không' })}
                           </span>
                        </span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="product.detail.createdAt" defaultMessage="Ngày tạo" />:</span>
                        <span className="value">{product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="product.detail.updatedAt" defaultMessage="Ngày cập nhật" />:</span>
                        <span className="value">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('vi-VN') : intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                  </div>

                  {/* Categories Information */}
                  <div className="detail-section">
                     <h3 className="categories"><FormattedMessage id="product.detail.categories" defaultMessage="Danh mục" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="product.detail.in_categories" defaultMessage="Có trong danh mục" />:</span>
                        <span className="value">
                           {(() => {
                              // Backend returns 'categories' field from include
                              const categoriesData = product.categories || product.ProductCategories || product.CategoryProducts || [];

                              console.log('Categories data found:', categoriesData);

                              if (categoriesData && categoriesData.length > 0) {
                                 return (
                                    <div className="categories-info">
                                       <span className="badge category-count">
                                          {categoriesData.length} <FormattedMessage id="product.detail.categories_count" defaultMessage="danh mục" />
                                       </span>
                                       <div className="categories-list">
                                          {categoriesData.map((item, index) => (
                                             <span key={index} className="badge category-name">
                                                {item.nameCategory ||
                                                   item.category?.nameCategory ||
                                                   item.name ||
                                                   item.Category?.nameCategory ||
                                                   intl.formatMessage({ id: 'product.detail.unknown_category', defaultMessage: 'Danh mục không xác định' })}
                                             </span>
                                          ))}
                                       </div>
                                    </div>
                                 );
                              } else {
                                 return (
                                    <span className="badge inactive">
                                       <FormattedMessage id="product.detail.no_categories" defaultMessage="Không có danh mục" />
                                    </span>
                                 );
                              }
                           })()}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="card-footer">
               <button className="btn-edit" onClick={handleEdit}>
                  ✏️ <FormattedMessage id="product.detail.edit_button" defaultMessage="Cập nhật sản phẩm" />
               </button>
               <button className="btn-back" onClick={() => navigate('/admin/product-category-management/product-management')}>
                  ← <FormattedMessage id="product.detail.back_button" defaultMessage="Quay lại" />
               </button>
            </div>
         </div>
      </div>
   );
};

export default ProductDetail;