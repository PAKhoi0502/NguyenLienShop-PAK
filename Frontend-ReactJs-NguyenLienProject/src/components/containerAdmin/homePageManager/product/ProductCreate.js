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
   const [length, setLength] = useState('');
   const [width, setWidth] = useState('');
   const [stock, setStock] = useState('');
   const [saleQuantity, setSaleQuantity] = useState('1');
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const intl = useIntl();

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      if (!nameProduct || !price || !stock || !saleQuantity) {
         showToast('error', intl.formatMessage({ id: 'body_admin.product_management.create.create_blocked', defaultMessage: 'Vui lòng nhập đầy đủ các trường bắt buộc (tên, giá, số lượng tồn kho, số lượng đơn vị bán)' }));
         setLoading(false);
         return;
      }

      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
         showToast('error', intl.formatMessage({ id: 'body_admin.product_management.create.price_invalid', defaultMessage: 'Giá sản phẩm phải lớn hơn 0' }));
         setLoading(false);
         return;
      }

      if (discountPrice) {
         const discountValue = parseFloat(discountPrice);
         if (isNaN(discountValue) || discountValue < 0) {
            showToast('error', intl.formatMessage({ id: 'body_admin.product_management.create.discount_invalid', defaultMessage: 'Giá khuyến mãi phải lớn hơn hoặc bằng 0' }));
            setLoading(false);
            return;
         }
         if (discountValue >= priceValue) {
            showToast('error', intl.formatMessage({ id: 'body_admin.product_management.create.discount_higher', defaultMessage: 'Giá khuyến mãi phải nhỏ hơn giá gốc' }));
            setLoading(false);
            return;
         }
      }

      const stockValue = parseInt(stock);
      if (isNaN(stockValue) || stockValue < 0 || !Number.isInteger(parseFloat(stock))) {
         showToast('error', intl.formatMessage({ id: 'body_admin.product_management.create.stock_invalid', defaultMessage: 'Số lượng tồn kho phải là số nguyên dương' }));
         setLoading(false);
         return;
      }

      const saleQuantityValue = parseInt(saleQuantity);
      if (isNaN(saleQuantityValue) || saleQuantityValue <= 0 || !Number.isInteger(parseFloat(saleQuantity))) {
         showToast('error', intl.formatMessage({ id: 'body_admin.product_management.create.saleQuantity_invalid', defaultMessage: 'Số lượng đơn vị bán phải là số nguyên dương' }));
         setLoading(false);
         return;
      }

      const data = {
         nameProduct,
         description: description || '',
         price,
         discountPrice: discountPrice || '',
         dimensions: length && width ? `${length} x ${width}` : '',
         stock,
         saleQuantity: saleQuantity || 1,
         isActive: false
      };

      try {
         const res = await createProduct(data);
         if (res && res.errCode === 0) {
            showToast('success', intl.formatMessage({ id: 'body_admin.product_management.create.success', defaultMessage: 'Tạo sản phẩm thành công' }));
            setTimeout(() => {
               navigate('/admin/product-category-management/product-management');
            }, 1500);
         } else if (res && res.errCode === 401) {
            showToast('error', res.errMessage || intl.formatMessage({ id: 'body_admin.product_management.create.unauthorized', defaultMessage: 'Không có quyền tạo sản phẩm' }));
         } else {
            showToast('error', res.errMessage || intl.formatMessage({ id: 'body_admin.product_management.create.error', defaultMessage: 'Không thể tạo sản phẩm' }));
         }
      } catch (err) {
         console.error('Create product error:', err);

         if (err.response?.status === 401) {
            showToast('error', intl.formatMessage({ id: 'body_admin.product_management.create.unauthorized', defaultMessage: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' }));
         } else {
            showToast('error', intl.formatMessage({ id: 'body_admin.product_management.create.server_error', defaultMessage: 'Lỗi server khi tạo sản phẩm' }));
         }
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
               titleId={type === 'success' ? 'body_admin.product_management.create.create_success_title' : 'body_admin.product_management.create.create_error_title'}
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
                  <p><FormattedMessage id="body_admin.product_management.create.hint.title" defaultMessage="Hướng dẫn: Điền thông tin sản phẩm." /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="body_admin.product_management.create.hint.name" defaultMessage="Tên sản phẩm là bắt buộc." /></li>
                     <li><FormattedMessage id="body_admin.product_management.create.hint.price" defaultMessage="Giá phải lớn hơn 0, số lượng tồn kho phải là số nguyên dương." /></li>
                     <li><FormattedMessage id="body_admin.product_management.create.hint.discount" defaultMessage="Giá khuyến mãi phải nhỏ hơn giá gốc (nếu có)." /></li>
                     <li><FormattedMessage id="body_admin.product_management.create.hint.saleQuantity" defaultMessage="Số lượng đơn vị bán: số cái trong 1 combo/lần mua (VD: 50 cái/combo)." /></li>
                     <li><FormattedMessage id="body_admin.product_management.create.hint.optional" defaultMessage="Mô tả, chiều dài và chiều rộng là tùy chọn." /></li>
                  </ul>
               </div>
            }
         />

         <h1><FormattedMessage id="body_admin.product_management.create.title" defaultMessage="Tạo sản phẩm mới" /></h1>
         <form onSubmit={handleSubmit} className="product-create-form">
            <div className="form-group">
               <label><FormattedMessage id="body_admin.product_management.create.name" defaultMessage="Tên sản phẩm:" /> <span style={{ color: 'red' }}>*</span></label>
               <input
                  type="text"
                  value={nameProduct}
                  onChange={(e) => setNameProduct(e.target.value)}
                  required
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.product_management.create.description" defaultMessage="Mô tả:" /></label>
               <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
               />
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.product_management.create.saleQuantity" defaultMessage="Số lượng đơn vị bán:" /> <span style={{ color: 'red' }}>*</span></label>
               <div className="input-with-unit">
                  <input
                     type="number"
                     value={saleQuantity}
                     onChange={(e) => setSaleQuantity(e.target.value)}
                     min="1"
                     step="1"
                     required
                     placeholder="VD: 50"
                  />
                  <span className="unit">{intl.formatMessage({ id: 'body_admin.product_management.create.unit', defaultMessage: 'cái' })}</span>
               </div>
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.product_management.create.price" defaultMessage="Giá:" /> <span style={{ color: 'red' }}>*</span></label>
               <div className="input-with-unit">
                  <input
                     type="number"
                     value={price}
                     onChange={(e) => setPrice(e.target.value)}
                     min="0.01"
                     step="0.01"
                     required
                     placeholder="VD: 500"
                  />
                  <span className="unit">VNĐ</span>
               </div>
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.product_management.create.discountPrice" defaultMessage="Giá khuyến mãi:" /></label>
               <div className="input-with-unit">
                  <input
                     type="number"
                     value={discountPrice}
                     onChange={(e) => setDiscountPrice(e.target.value)}
                     min="0"
                     step="0.01"
                     placeholder="VD: 450"
                  />
                  <span className="unit">VNĐ</span>
               </div>
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.product_management.create.dimensions" defaultMessage="Kích thước:" /></label>
               <div className="dimensions-inputs">
                  <div className="dimension-input">
                     <label><FormattedMessage id="body_admin.product_management.create.length" defaultMessage="Chiều dài (cm):" /></label>
                     <input
                        type="number"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        min="0"
                        step="0.1"
                        placeholder="VD: 2"
                     />
                  </div>
                  <div className="dimension-separator"> x </div>
                  <div className="dimension-input">
                     <label><FormattedMessage id="body_admin.product_management.create.width" defaultMessage="Chiều rộng (cm):" /></label>
                     <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        min="0"
                        step="0.1"
                        placeholder="VD: 3"
                     />
                  </div>
               </div>
            </div>
            <div className="form-group">
               <label><FormattedMessage id="body_admin.product_management.create.stock" defaultMessage="Số lượng tồn kho:" /> <span style={{ color: 'red' }}>*</span></label>
               <div className="input-with-unit">
                  <input
                     type="number"
                     value={stock}
                     onChange={(e) => setStock(e.target.value)}
                     min="0"
                     step="1"
                     required
                     placeholder="VD: 5000"
                  />
                  <span className="unit">{intl.formatMessage({ id: 'body_admin.product_management.create.unit', defaultMessage: 'cái' })}</span>
               </div>
            </div>
            <div className="form-actions">
               <button className="btn-submit" type="submit" disabled={loading}>

                  {loading ? <FormattedMessage id="body_admin.product_management.create.loading" defaultMessage="Đang tạo..." /> : <FormattedMessage id="body_admin.product_management.create.submit" defaultMessage="Tạo sản phẩm" />}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate(-1)}
                  disabled={loading}
               >
                  <FormattedMessage id="body_admin.product_management.create.cancel" defaultMessage="Hủy" />
               </button>
            </div>
         </form>
      </div>
   );
};

export default ProductCreate;