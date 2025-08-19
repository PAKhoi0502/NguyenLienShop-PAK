import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import { getProductById } from '../../../../services/productService.js';

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
      return <div className="product-detail-loading">{intl.formatMessage({ id: 'product.detail.loading', defaultMessage: 'Đang tải thông tin sản phẩm...' })}</div>;
   }

   if (error) {
      return (
         <div className="product-detail-error">
            <div className="error-message">{error}</div>
            <button
               className="btn btn-primary"
               onClick={() => navigate('/admin/product-category-management/product-management')}
            >
               {intl.formatMessage({ id: 'common.backToList', defaultMessage: 'Quay lại danh sách' })}
            </button>
         </div>
      );
   }

   if (!product) {
      return <div className="product-detail-error">{intl.formatMessage({ id: 'product.detail.not_found', defaultMessage: 'Không tìm thấy sản phẩm' })}</div>;
   }

   return (
      <div className="product-detail-container">
         <h2 className="product-detail-title">
            <FormattedMessage id="product.detail.title" defaultMessage="Thông tin sản phẩm" />
         </h2>
         <div className="product-detail-content">
            <div><strong>ID:</strong> {product.id}</div>
            <div>
               <strong><FormattedMessage id="product.detail.name" defaultMessage="Tên sản phẩm" />:</strong> {product.nameProduct || intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}
            </div>
            <div>
               <strong><FormattedMessage id="product.detail.description" defaultMessage="Mô tả" />:</strong> {product.description || intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}
            </div>
            <div>
               <strong><FormattedMessage id="product.detail.price" defaultMessage="Giá" />:</strong> {product.price ? `${product.price} VNĐ` : intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}
            </div>
            <div>
               <strong><FormattedMessage id="product.detail.discountPrice" defaultMessage="Giá khuyến mãi" />:</strong> {product.discountPrice ? `${product.discountPrice} VNĐ` : intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}
            </div>
            <div>
               <strong><FormattedMessage id="product.detail.dimensions" defaultMessage="Kích thước" />:</strong> {product.dimensions || intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}
            </div>
            <div>
               <strong><FormattedMessage id="product.detail.stock" defaultMessage="Số lượng tồn kho" />:</strong> {product.stock || 0}
            </div>
            <div>
               <strong><FormattedMessage id="product.detail.isNew" defaultMessage="Sản phẩm mới" />:</strong> {product.isNew ? intl.formatMessage({ id: 'product.detail.yes', defaultMessage: 'Có' }) : intl.formatMessage({ id: 'product.detail.no', defaultMessage: 'Không' })}
            </div>
            <div>
               <strong><FormattedMessage id="product.detail.isBestSeller" defaultMessage="Sản phẩm bán chạy" />:</strong> {product.isBestSeller ? intl.formatMessage({ id: 'product.detail.yes', defaultMessage: 'Có' }) : intl.formatMessage({ id: 'product.detail.no', defaultMessage: 'Không' })}
            </div>
            <div>
               <strong><FormattedMessage id="product.detail.isActive" defaultMessage="Trạng thái hoạt động" />:</strong> {product.isActive ? intl.formatMessage({ id: 'product.detail.active', defaultMessage: 'Hoạt động' }) : intl.formatMessage({ id: 'product.detail.inactive', defaultMessage: 'Không hoạt động' })}
            </div>
            <div>
               <strong><FormattedMessage id="product.detail.createdAt" defaultMessage="Ngày tạo" />:</strong> {product.createdAt ? new Date(product.createdAt).toLocaleString() : intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}
            </div>
            <div>
               <strong><FormattedMessage id="product.detail.updatedAt" defaultMessage="Ngày cập nhật" />:</strong> {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}
            </div>
         </div>

         <div className="product-detail-actions">
            <button className="btn-edit" onClick={handleEdit}>
               <FormattedMessage id="product.detail.edit_button" defaultMessage="Cập nhật sản phẩm" />
            </button>
            <button className="btn-back" onClick={() => navigate('/admin/product-category-management/product-management')}>
               <FormattedMessage id="product.detail.back_button" defaultMessage="Quay lại" />
            </button>
         </div>
      </div>
   );
};

export default ProductDetail;