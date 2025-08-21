import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useIntl, FormattedMessage } from 'react-intl';
import { createProduct } from '../../../../services/productService.js';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';
import './ProductCreate.scss';

const ProductCreate = () => {
   const [nameProduct, setNameProduct] = useState('');
   const [description, setDescription] = useState('');
   const [price, setPrice] = useState('');
   const [discountPrice, setDiscountPrice] = useState('');
   const [dimensions, setDimensions] = useState('');
   const [stock, setStock] = useState('');
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const intl = useIntl();

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      // Kiểm tra dữ liệu bắt buộc
      if (!nameProduct || !price || !stock) {
         showToast('error', intl.formatMessage({ id: 'product.create.missing_fields', defaultMessage: 'Vui lòng nhập đầy đủ các trường bắt buộc (tên, giá, số lượng tồn kho)' }));
         setLoading(false);
         return;
      }

      const data = {
         nameProduct,
         description: description || '',
         price,
         discountPrice: discountPrice || '',
         dimensions: dimensions || '',
         stock,
         isActive: false // Mặc định sản phẩm mới không active
      };

      try {
         const res = await createProduct(data);
         if (res && res.errCode === 0) {
            showToast('success', intl.formatMessage({ id: 'product.create.success', defaultMessage: 'Tạo sản phẩm thành công' }));
            navigate('/admin/product-category-management/product-management');
         } else {
            showToast('error', res.errMessage || intl.formatMessage({ id: 'product.create.error', defaultMessage: 'Không thể tạo sản phẩm' }));
         }
      } catch (err) {
         console.error('Create product error:', err);
         showToast('error', intl.formatMessage({ id: 'product.create.server_error', defaultMessage: 'Lỗi server khi tạo sản phẩm' }));
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
               titleId={type === 'success' ? 'product.create.create_success_title' : 'product.create.create_error_title'}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   return (
      <div className="product-create-container">
         <HintBox
            content={
               <div>
                  <p><FormattedMessage id="product.hint.title" defaultMessage="Hướng dẫn: Điền thông tin sản phẩm." /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="product.hint.name" defaultMessage="Tên sản phẩm là bắt buộc." /></li>
                     <li><FormattedMessage id="product.hint.price" defaultMessage="Giá và số lượng tồn kho là bắt buộc." /></li>
                     <li><FormattedMessage id="product.hint.optional" defaultMessage="Mô tả, giá khuyến mãi, kích thước là tùy chọn." /></li>
                  </ul>
               </div>
            }
         />

         <h1><FormattedMessage id="product.create.title" defaultMessage="Tạo sản phẩm mới" /></h1>
         <form onSubmit={handleSubmit} className="product-create-form">
            <div className="form-group">
               <label><FormattedMessage id="product.create.name" defaultMessage="Tên sản phẩm:" /> <span style={{ color: 'red' }}>*</span></label>
               <input
                  type="text"
                  value={nameProduct}
                  onChange={(e) => setNameProduct(e.target.value)}
                  required
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="product.create.description" defaultMessage="Mô tả:" /></label>
               <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="product.create.price" defaultMessage="Giá:" /> <span style={{ color: 'red' }}>*</span></label>
               <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  required
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="product.create.discountPrice" defaultMessage="Giá khuyến mãi:" /></label>
               <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  min="0"
                  step="0.01"
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="product.create.dimensions" defaultMessage="Kích thước:" /></label>
               <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="product.create.stock" defaultMessage="Số lượng tồn kho:" /> <span style={{ color: 'red' }}>*</span></label>
               <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  min="0"
                  step="1"
                  required
               />
            </div>
            <div className="form-actions">
               <button className="btn-submit" type="submit" disabled={loading}>
                  {loading ? <FormattedMessage id="product.create.loading" defaultMessage="Đang tạo..." /> : <FormattedMessage id="product.create.submit" defaultMessage="Tạo sản phẩm" />}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/admin/product-category-management/product-management')}
                  disabled={loading}
               >
                  <FormattedMessage id="product.create.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </form>
      </div>
   );
};

export default ProductCreate;