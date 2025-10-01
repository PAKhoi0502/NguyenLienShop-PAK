import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import { getCategoryById, getProductsByCategoryId } from '../../../../services/categoryService.js';
import './CategoryDetail.scss';

const CategoryDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const intl = useIntl();
   const [category, setCategory] = useState(null);
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchCategoryData = async () => {
         try {
            setLoading(true);
            setError(null);

            // Fetch category info
            const categoryRes = await getCategoryById(id);

            if (!categoryRes) {
               setError('Không thể kết nối với server');
               return;
            }

            if (categoryRes.errCode === 1) {
               setError('ID danh mục không hợp lệ');
               return;
            }

            if (categoryRes.errCode === 404) {
               setError('Không tìm thấy thông tin danh mục');
               return;
            }

            if (categoryRes.errCode === -1) {
               setError(categoryRes.errMessage || 'Lỗi server');
               return;
            }

            if (categoryRes.errCode === 0 && categoryRes.category) {
               setCategory(categoryRes.category);

               // Fetch products for this category
               const productsRes = await getProductsByCategoryId(id);
               if (productsRes && productsRes.errCode === 0) {
                  setProducts(productsRes.products || []);
               } else {
                  // If failed to fetch products, set empty array
                  setProducts([]);
               }
            } else {
               setError('Không tìm thấy thông tin danh mục');
            }

         } catch (err) {
            console.error('Fetch category error:', err);
            setError('Có lỗi xảy ra khi tải thông tin danh mục');
         } finally {
            setLoading(false);
         }
      };

      if (id) {
         fetchCategoryData();
      }
   }, [id, navigate]);

   const handleEdit = () => {
      if (category?.isActive) {
         toast.error(intl.formatMessage({
            id: 'body_admin.category_management.detail_category.update_blocked',
            defaultMessage: 'Vui lòng ẩn danh mục trước khi cập nhật',
         }));
         return;
      }

      navigate(`/admin/product-category-management/category-management/category-update/${id}`);
   };

   const handleProductClick = (productId) => {
      if (!productId) return;

      navigate(`/admin/product-category-management/product-management/product-detail/${productId}`);
   };


   if (loading) {
      return (
         <div className="category-detail-container">
            <div className="loading-state">
               <div className="loading-spinner"></div>
               <p><FormattedMessage id="body_admin.category_management.detail_category.loading" defaultMessage="Đang tải thông tin danh mục..." /></p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="category-detail-container">
            <div className="error-state">
               <div className="error-icon">❌</div>
               <h2><FormattedMessage id="common.error" defaultMessage="Lỗi tải dữ liệu" /></h2>
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

   if (!category) {
      return (
         <div className="category-detail-container">
            <div className="error-state">
               <div className="error-icon">❓</div>
               <h2><FormattedMessage id="body_admin.category_management.detail_category.not_found_title" defaultMessage="Không tìm thấy danh mục" /></h2>
               <p><FormattedMessage id="body_admin.category_management.detail_category.not_found_message" defaultMessage="Danh mục không tồn tại hoặc đã bị xóa" /></p>
            </div>
            <button
               className="btn btn-primary"
               onClick={() => navigate(-1)}
            >
               <FormattedMessage id="common.backToList" defaultMessage="Quay lại danh sách" />
            </button>
         </div>
      );
   }

   return (
      <div className="category-detail-container">
         <h1>
            <FormattedMessage id="body_admin.category_management.detail_category.title" defaultMessage="Thông tin danh mục" />
         </h1>

         <div className="category-detail-card">
            <div className="card-header">
               <h2>{category.nameCategory || intl.formatMessage({ id: 'body_admin.category_management.detail_category.no_name', defaultMessage: 'Không có tên danh mục' })}</h2>
            </div>

            <div className="card-body">
               <div className="detail-grid">
                  <div className="detail-section">
                     <h3 className="basic-info"><FormattedMessage id="body_admin.category_management.detail_category.basic_info" defaultMessage="Thông tin cơ bản" /></h3>
                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.category_management.detail_category.name" defaultMessage="Tên danh mục" />:</span>
                        <span className="value">{category.nameCategory || intl.formatMessage({ id: 'body_admin.category_management.detail_category.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.category_management.detail_category.description" defaultMessage="Mô tả" />:</span>
                        <span className="value">{category.description || intl.formatMessage({ id: 'body_admin.category_management.detail_category.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                  </div>
                  <div className="detail-section">
                     <h3 className="status"><FormattedMessage id="body_admin.category_management.detail_category.status" defaultMessage="Trạng thái" /></h3>
                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.category_management.detail_category.status" defaultMessage="Trạng thái" />:</span>
                        <span className="value">
                           <span className={`badge ${category.isActive ? 'active' : 'inactive'}`}>
                              {category.isActive ? intl.formatMessage({ id: 'body_admin.category_management.detail_category.active', defaultMessage: 'Đang hiển thị' }) : intl.formatMessage({ id: 'body_admin.category_management.detail_category.inactive', defaultMessage: 'Đã ẩn' })}
                           </span>
                        </span>
                     </div>
                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.category_management.detail_category.createdAt" defaultMessage="Ngày tạo" />:</span>
                        <span className="value">{category.createdAt ? new Date(category.createdAt).toLocaleString() : intl.formatMessage({ id: 'body_admin.category_management.detail_category.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.category_management.detail_category.updatedAt" defaultMessage="Ngày cập nhật" />:</span>
                        <span className="value">{category.updatedAt ? new Date(category.updatedAt).toLocaleString() : intl.formatMessage({ id: 'body_admin.category_management.detail_category.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                  </div>
                  <div className="detail-section">
                     <h3 className="products"><FormattedMessage id="body_admin.category_management.detail_category.products" defaultMessage="Sản phẩm" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.category_management.detail_category.products_count" defaultMessage="Số sản phẩm" />:</span>
                        <span className="value product-count">{products.length}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.category_management.detail_category.products_list" defaultMessage="Danh sách sản phẩm" />:</span>
                        <div className="value">
                           {(() => {
                              if (products.length === 0) {
                                 return (
                                    <span className="badge inactive">
                                       <FormattedMessage id="body_admin.category_management.detail_category.no_products" defaultMessage="Không có sản phẩm nào" />
                                    </span>
                                 );
                              }

                              return (
                                 <div className="products-list">
                                    {products.map((product, index) => (
                                       <div key={product.id || index} className="product-item">
                                          <span
                                             className="product-name clickable"
                                             onClick={() => handleProductClick(product.id)}
                                             title={intl.formatMessage({ id: 'body_admin.category_management.detail_category.product_detail', defaultMessage: 'Nhấp để xem chi tiết sản phẩm' })}
                                          >
                                             {product.nameProduct || `Sản phẩm ${product.id}`}
                                          </span>
                                          <span
                                             className="product-id clickable"
                                             onClick={() => handleProductClick(product.id)}
                                             title={intl.formatMessage({ id: 'body_admin.category_management.detail_category.product_detail', defaultMessage: 'Nhấp để xem chi tiết sản phẩm' })}
                                          >
                                             ID: {product.id}
                                          </span>
                                       </div>
                                    ))}
                                 </div>
                              );
                           })()}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="card-footer">
               <button className="btn-edit" onClick={handleEdit}>
                  <FormattedMessage id="body_admin.category_management.detail_category.edit_button" defaultMessage="Cập nhật danh mục" />
               </button>
               <button className="btn-back" onClick={() => navigate(-1)}>
                  ← <FormattedMessage id="body_admin.category_management.detail_category.back_button" defaultMessage="Quay lại" />
               </button>
            </div>
         </div>
      </div>
   );
};

export default CategoryDetail;
