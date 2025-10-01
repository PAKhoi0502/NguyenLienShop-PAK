import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import { getProductById } from '../../../../services/productService.js';
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
            setLoading(true);
            setError(null);

            const res = await getProductById(id);

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
            if (res.errCode === -1) {
               setError(res.errMessage || 'Lỗi server');
               return;
            }

            if (res.errCode === 0 && res.product) {
               setProduct(res.product);
            } else {
               setError('Không tìm thấy thông tin sản phẩm');
            }

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
            id: 'body_admin.product_management.detail_product.update_blocked',
            defaultMessage: 'Vui lòng ẩn sản phẩm trước khi cập nhật',
         }));
         return;
      }

      navigate(`/admin/product-category-management/product-management/product-update/${id}`);
   };

   const handleCategoryClick = (categoryId) => {
      if (!categoryId) return;

      navigate(`/admin/product-category-management/category-management/category-detail/${categoryId}`);
   };


   if (loading) {
      return (
         <div className="product-detail-container">
            <div className="loading-state">
               <div className="loading-spinner"></div>
               <p><FormattedMessage id="body_admin.product_management.detail_product.loading" defaultMessage="Đang tải thông tin sản phẩm..." /></p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="product-detail-container">
            <div className="error-state">
               <div className="error-icon">❌</div>
               <h2><FormattedMessage id="body_admin.product_management.detail_product.error_title" defaultMessage="Lỗi tải dữ liệu" /></h2>
               <p>{error}</p>
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

   if (!product) {
      return (
         <div className="product-detail-container">
            <div className="error-state">
               <div className="error-icon">❓</div>
               <h2><FormattedMessage id="body_admin.product_management.detail_product.not_found_title" defaultMessage="Không tìm thấy sản phẩm" /></h2>
               <p><FormattedMessage id="product.detail.not_found" defaultMessage="Sản phẩm không tồn tại hoặc đã bị xóa" /></p>
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
      <div className="product-detail-container">
         <h1>
            <FormattedMessage id="body_admin.product_management.detail_product.title" defaultMessage="Thông tin sản phẩm" />
         </h1>

         <div className="product-detail-card">
            <div className="card-header">
               <h2>{product.nameProduct || intl.formatMessage({ id: 'body_admin.product_management.detail_product.no_name', defaultMessage: 'Không có tên sản phẩm' })}</h2>
               <div className="product-id">ID: {product.id}</div>
            </div>

            <div className="card-body">
               <div className="detail-grid">
                  <div className="detail-section">
                     <h3 className="basic-info"><FormattedMessage id="body_admin.product_management.detail_product.basic_info" defaultMessage="Thông tin cơ bản" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.name" defaultMessage="Tên sản phẩm" />:</span>
                        <span className="value">{product.nameProduct || intl.formatMessage({ id: 'body_admin.product_management.detail_product.empty', defaultMessage: 'Không có' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.description" defaultMessage="Mô tả" />:</span>
                        <span className="value description">{product.description || intl.formatMessage({ id: 'body_admin.product_management.detail_product.empty', defaultMessage: 'Không có' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.dimensions" defaultMessage="Kích thước" />:</span>
                        <span className="value">{product.dimensions || intl.formatMessage({ id: 'body_admin.product_management.detail_product.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                  </div>

                  <div className="detail-section">
                     <h3 className="pricing"><FormattedMessage id="body_admin.product_management.detail_product.pricing" defaultMessage="Thông tin giá" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.price" defaultMessage="Giá" />:</span>
                        <span className="value price">{product.price ? `${product.price.toLocaleString()} VNĐ` : intl.formatMessage({ id: 'body_admin.product_management.detail_product.empty', defaultMessage: 'Không có' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.discountPrice" defaultMessage="Giá khuyến mãi" />:</span>
                        <span className="value discount-price">{product.discountPrice ? `${product.discountPrice.toLocaleString()} VNĐ` : intl.formatMessage({ id: 'body_admin.product_management.detail_product.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                  </div>

                  <div className="detail-section">
                     <h3 className="inventory"><FormattedMessage id="body_admin.product_management.detail_product.inventory" defaultMessage="Tồn kho" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.stock" defaultMessage="Số lượng tồn kho" />:</span>
                        <span className="value stock">{product.stock || intl.formatMessage({ id: 'body_admin.product_management.detail_product.out_of_stock', defaultMessage: 'Hết hàng' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.isActive" defaultMessage="Trạng thái" />:</span>
                        <span className="value">
                           <span className={`badge ${product.isActive ? 'active' : 'inactive'}`}>
                              {product.isActive ? intl.formatMessage({ id: 'body_admin.product_management.detail_product.active', defaultMessage: 'Đang hiển thị' }) : intl.formatMessage({ id: 'body_admin.product_management.detail_product.inactive', defaultMessage: 'Đã ẩn' })}
                           </span>
                        </span>
                     </div>
                  </div>

                  <div className="detail-section">
                     <h3 className="features"><FormattedMessage id="body_admin.product_management.detail_product.features" defaultMessage="Đặc điểm" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.isNew" defaultMessage="Sản phẩm mới" />:</span>
                        <span className="value">
                           <span className={`badge ${product.isNew ? 'new' : 'inactive'}`}>
                              {product.isNew ? intl.formatMessage({ id: 'body_admin.product_management.detail_product.yes', defaultMessage: 'Có' }) : intl.formatMessage({ id: 'body_admin.product_management.detail_product.no', defaultMessage: 'Không' })}
                           </span>
                        </span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.isBestSeller" defaultMessage="Bán chạy" />:</span>
                        <span className="value">
                           <span className={`badge ${product.isBestSeller ? 'bestseller' : 'inactive'}`}>
                              {product.isBestSeller ? intl.formatMessage({ id: 'body_admin.product_management.detail_product.yes', defaultMessage: 'Có' }) : intl.formatMessage({ id: 'body_admin.product_management.detail_product.no', defaultMessage: 'Không' })}
                           </span>
                        </span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.createdAt" defaultMessage="Ngày tạo" />:</span>
                        <span className="value">{product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.updatedAt" defaultMessage="Ngày cập nhật" />:</span>
                        <span className="value">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('vi-VN') : intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                  </div>

                  <div className="detail-section">
                     <h3 className="categories"><FormattedMessage id="body_admin.product_management.detail_product.categories" defaultMessage="Danh mục" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.in_categories" defaultMessage="Có trong danh mục" />:</span>
                        <span className="value categories-value">
                           {(() => {
                              const categoriesData = product.categories || product.ProductCategories || product.CategoryProducts || [];

                              if (categoriesData && categoriesData.length > 0) {
                                 return (
                                    <div className="categories-info">
                                       <span className="badge category-count">
                                          {categoriesData.length} <FormattedMessage id="body_admin.product_management.detail_product.categories_count" defaultMessage="danh mục" />
                                       </span>
                                       <div className="categories-list">
                                          {categoriesData.map((item, index) => {
                                             const categoryId = item.id || item.category?.id || item.Category?.id;
                                             const categoryName = item.nameCategory ||
                                                item.category?.nameCategory ||
                                                item.name ||
                                                item.Category?.nameCategory ||
                                                intl.formatMessage({ id: 'body_admin.product_management.detail_product.unknown_category', defaultMessage: 'Sản phẩm không có danh mục' });

                                             return (
                                                <span
                                                   key={index}
                                                   className="badge category-name clickable"
                                                   onClick={() => handleCategoryClick(categoryId)}
                                                   title="Nhấp để xem chi tiết danh mục"
                                                >
                                                   {categoryName}
                                                </span>
                                             );
                                          })}
                                       </div>
                                    </div>
                                 );
                              } else {
                                 return (
                                    <span className="badge inactive">
                                       <FormattedMessage id="body_admin.product_management.detail_product.no_categories" defaultMessage="Không có danh mục" />
                                    </span>
                                 );
                              }
                           })()}
                        </span>
                     </div>
                  </div>

                  <div className="detail-section">
                     <h3 className="images"><FormattedMessage id="body_admin.product_management.detail_product.images" defaultMessage="Hình ảnh" /></h3>

                     <div className="detail-item">
                     </div>
                  </div>

                  <div className="detail-section">
                     <h3 className="product-statistics"><FormattedMessage id="body_admin.product_management.detail_product.product_statistics" defaultMessage="Thống kê sản phẩm" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.products_out" defaultMessage="Bán ra" />:</span>
                     </div>
                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.products_out_date" defaultMessage="Ngày bán ra" />:</span>
                     </div>
                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.products_in" defaultMessage="Nhập vào" />:</span>
                     </div>
                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.products_in_date" defaultMessage="Ngày nhập vào" />:</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="card-footer">
               <button className="btn-edit" onClick={handleEdit}>
                  <FormattedMessage id="body_admin.product_management.detail_product.edit_button" defaultMessage="Cập nhật sản phẩm" />
               </button>
               <button className="btn-back" onClick={() => navigate(-1)}>
                  <FormattedMessage id="body_admin.product_management.detail_product.back_button" defaultMessage="Quay lại" />
               </button>
            </div>
         </div>
      </div>
   );
};

export default ProductDetail;