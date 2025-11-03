import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useIntl, FormattedMessage } from 'react-intl';
import Swal from 'sweetalert2';
import { getProductById, updateProduct } from '../../../../services/productService.js';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';
import ProductImageManager from './ProductImageManager';
import './ProductUpdate.scss';

const ProductUpdate = () => {
   const [nameProduct, setNameProduct] = useState('');
   const [description, setDescription] = useState('');
   const [price, setPrice] = useState('');
   const [discountPrice, setDiscountPrice] = useState('');
   const [length, setLength] = useState('');
   const [width, setWidth] = useState('');
   const [stock, setStock] = useState('');
   const [saleQuantity, setSaleQuantity] = useState('1');
   const [isNew, setIsNew] = useState(false);
   const [isBestSeller, setIsBestSeller] = useState(false);
   const [loading, setLoading] = useState(false);
   const [fetching, setFetching] = useState(true);
   const navigate = useNavigate();
   const { id } = useParams();
   const intl = useIntl();

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === 'success' ? 'body_admin.product_management.update_product.success_title' : 'body_admin.product_management.update_product.error_title'}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const fetchProduct = async () => {
      try {
         const res = await getProductById(id);
         if (res && res.errCode === 0 && res.product) {
            const { nameProduct, description, price, discountPrice, dimensions, stock, saleQuantity, isNew, isBestSeller } = res.product;
            setNameProduct(nameProduct || '');
            setDescription(description || '');
            setPrice(price ? price.toString() : '');
            setDiscountPrice(discountPrice ? discountPrice.toString() : '');

            // Parse dimensions từ format "lengthxwidth" thành length và width riêng biệt
            if (dimensions && dimensions.includes('x')) {
               const [parsedLength, parsedWidth] = dimensions.split('x');
               setLength(parsedLength || '');
               setWidth(parsedWidth || '');
            } else {
               setLength('');
               setWidth('');
            }

            setStock(stock ? stock.toString() : '');
            setSaleQuantity(saleQuantity ? saleQuantity.toString() : '1');
            setIsNew(!!isNew);
            setIsBestSeller(!!isBestSeller);
         } else {
            const errorMessage = res.errMessage || intl.formatMessage({ id: 'body_admin.product_management.update_product.fetch_error', defaultMessage: 'Không thể tải thông tin sản phẩm' });
            showToast('error', errorMessage);
            navigate('/admin/product-category-management/product-management');
         }
      } catch (err) {
         console.error('Fetch product error:', err.response?.data, err.response?.status);

         // Xử lý lỗi 401 từ axios interceptor
         if (err.response?.status === 401) {
            showToast('error', intl.formatMessage({ id: 'body_admin.product_management.update_product.unauthorized', defaultMessage: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' }));
            // Không cần navigate, axios interceptor sẽ xử lý
         } else {
            const errorMessage = err.response?.data?.errMessage || intl.formatMessage({ id: 'body_admin.product_management.update_product.server_error', defaultMessage: 'Lỗi server khi tải sản phẩm' });
            showToast('error', errorMessage);
            navigate('/admin/product-category-management/product-management');
         }
      } finally {
         setFetching(false);
      }
   };

   useEffect(() => {
      fetchProduct();
   }, [id]);

   const handleSubmit = async (e) => {
      e.preventDefault();

      // Kiểm tra dữ liệu bắt buộc
      if (!nameProduct || !price || !stock || !saleQuantity) {
         showToast('error', intl.formatMessage({ id: 'body_admin.product_management.update_product.missing_fields', defaultMessage: 'Vui lòng nhập đầy đủ các trường bắt buộc (tên, giá, số lượng tồn kho, số lượng đơn vị bán)' }));
         return;
      }

      // Validation chi tiết cho Price
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
         showToast('error', intl.formatMessage({ id: 'body_admin.product_management.update_product.price_invalid', defaultMessage: 'Giá sản phẩm phải lớn hơn 0' }));
         return;
      }

      // Validation cho Discount Price
      if (discountPrice) {
         const discountValue = parseFloat(discountPrice);
         if (isNaN(discountValue) || discountValue < 0) {
            showToast('error', intl.formatMessage({ id: 'body_admin.product_management.update_product.discount_invalid', defaultMessage: 'Giá khuyến mãi phải lớn hơn hoặc bằng 0' }));
            return;
         }
         if (discountValue >= priceValue) {
            showToast('error', intl.formatMessage({ id: 'body_admin.product_management.update_product.discount_higher', defaultMessage: 'Giá khuyến mãi phải nhỏ hơn giá gốc' }));
            return;
         }
      }

      // Validation cho Stock
      const stockValue = parseInt(stock);
      if (isNaN(stockValue) || stockValue < 0 || !Number.isInteger(parseFloat(stock))) {
         showToast('error', intl.formatMessage({ id: 'body_admin.product_management.update_product.stock_invalid', defaultMessage: 'Số lượng tồn kho phải là số nguyên dương' }));
         return;
      }

      // Validation cho Sale Quantity
      const saleQuantityValue = parseInt(saleQuantity);
      if (isNaN(saleQuantityValue) || saleQuantityValue <= 0 || !Number.isInteger(parseFloat(saleQuantity))) {
         showToast('error', intl.formatMessage({ id: 'body_admin.product_management.update_product.saleQuantity_invalid', defaultMessage: 'Số lượng đơn vị bán phải là số nguyên dương' }));
         return;
      }

      // Step 1: Initial Confirmation
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.product_management.update_product.confirm_title_1', defaultMessage: 'Xác nhận cập nhật sản phẩm' }),
         html: `<strong>${nameProduct || intl.formatMessage({ id: 'body_admin.product_management.update_product.no_product_name', defaultMessage: 'Không có tên sản phẩm' })}</strong><br>ID: ${id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.product_management.update_product.confirm_button_1', defaultMessage: 'Tiếp tục' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.product_management.update_product.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Secondary Confirmation
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.product_management.update_product.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn cập nhật?' }),
         text: intl.formatMessage({ id: 'body_admin.product_management.update_product.confirm_text_2', defaultMessage: 'Thông tin sản phẩm sẽ được thay đổi!' }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.product_management.update_product.confirm_button_2', defaultMessage: 'Cập nhật' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.product_management.update_product.cancel_button', defaultMessage: 'Hủy' })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase
      const confirmText = await Swal.fire({
         title: intl.formatMessage({ id: 'body_admin.product_management.update_product.security_title', defaultMessage: 'Xác nhận bảo mật' }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({ id: 'body_admin.product_management.update_product.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ cập nhật thông tin sản phẩm!' })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.product_management.update_product.security_confirm_text', defaultMessage: 'Sản phẩm cần cập nhật' })}: <strong style="color: #dc2626;">${nameProduct || intl.formatMessage({ id: 'body_admin.product_management.update_product.no_product_name', defaultMessage: 'Không có tên sản phẩm' })}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({ id: 'body_admin.product_management.update_product.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({ id: 'body_admin.product_management.update_product.security_phrase', defaultMessage: 'CẬP NHẬT SẢN PHẨM' })}</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({ id: 'body_admin.product_management.update_product.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({ id: 'body_admin.product_management.update_product.security_continue', defaultMessage: 'Tiếp tục cập nhật' }),
         cancelButtonText: intl.formatMessage({ id: 'body_admin.product_management.update_product.cancel_button', defaultMessage: 'Hủy' }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({ id: 'body_admin.product_management.update_product.security_phrase', defaultMessage: 'CẬP NHẬT SẢN PHẨM' });
            if (value !== expectedPhrase) {
               return intl.formatMessage({ id: 'body_admin.product_management.update_product.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' });
            }
         },
         customClass: {
            popup: 'swal-update-step3',
            input: 'swal-text-input'
         }
      });

      if (!confirmText.isConfirmed) return;

      setLoading(true);

      const data = {
         id,
         nameProduct,
         description: description || '',
         price: priceValue,
         discountPrice: discountPrice ? parseFloat(discountPrice) : null,
         dimensions: length && width ? `${length}x${width}` : '',
         stock: stockValue,
         saleQuantity: saleQuantityValue,
         isNew, // Thêm isNew vào dữ liệu
         isBestSeller // Thêm isBestSeller vào dữ liệu
      };

      try {
         const res = await updateProduct(data);
         if (res && res.errCode === 0) {
            showToast('success', intl.formatMessage({ id: 'body_admin.product_management.update_product.success', defaultMessage: 'Cập nhật sản phẩm thành công' }));
            navigate('/admin/product-category-management/product-management');
         } else if (res && res.errCode === 401) {
            // Xử lý lỗi 401 - không có quyền
            showToast('error', res.errMessage || intl.formatMessage({ id: 'body_admin.product_management.update_product.unauthorized', defaultMessage: 'Không có quyền cập nhật sản phẩm' }));
            // Không redirect về login, để axios interceptor xử lý
         } else {
            showToast('error', res.errMessage || intl.formatMessage({ id: 'body_admin.product_management.update_product.error', defaultMessage: 'Không thể cập nhật sản phẩm' }));
         }
      } catch (err) {
         console.error('Update product error:', err.response?.data, err.response?.status);

         // Xử lý lỗi 401 từ axios interceptor
         if (err.response?.status === 401) {
            showToast('error', intl.formatMessage({ id: 'body_admin.product_management.update_product.unauthorized', defaultMessage: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' }));
            // Không cần navigate, axios interceptor sẽ xử lý
         } else {
            showToast('error', intl.formatMessage({ id: 'body_admin.product_management.update_product.server_error', defaultMessage: 'Lỗi server khi cập nhật sản phẩm' }));
         }
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="product-update-container">
         <HintBox
            content={
               <div>
                  <p><FormattedMessage id="body_admin.product_management.update_product.hint.title" defaultMessage="Hướng dẫn: Cập nhật thông tin sản phẩm." /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="body_admin.product_management.update_product.hint.name" defaultMessage="Tên sản phẩm là bắt buộc." /></li>
                     <li><FormattedMessage id="body_admin.product_management.update_product.hint.price" defaultMessage="Giá phải lớn hơn 0, số lượng tồn kho phải là số nguyên dương." /></li>
                     <li><FormattedMessage id="body_admin.product_management.update_product.hint.discount" defaultMessage="Giá khuyến mãi phải nhỏ hơn giá gốc (nếu có)." /></li>
                     <li><FormattedMessage id="body_admin.product_management.update_product.hint.optional" defaultMessage="Mô tả, chiều dài và chiều rộng, sản phẩm mới, sản phẩm bán chạy là tùy chọn." /></li>
                  </ul>
               </div>
            }
         />

         <h1><FormattedMessage id="body_admin.product_management.update_product.title" defaultMessage="Cập nhật sản phẩm" /></h1>
         {fetching ? (
            <p className="product-loading"><FormattedMessage id="body_admin.product_management.update_product.loading" defaultMessage="Đang tải thông tin sản phẩm..." /></p>
         ) : (
            <form onSubmit={handleSubmit} className="product-update-form">
               <div className="form-group">
                  <label><FormattedMessage id="body_admin.product_management.update_product.name" defaultMessage="Tên sản phẩm:" /> <span style={{ color: 'red' }}>*</span></label>
                  <input
                     type="text"
                     value={nameProduct}
                     onChange={(e) => setNameProduct(e.target.value)}
                     required
                  />
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="body_admin.product_management.update_product.description" defaultMessage="Mô tả:" /></label>
                  <textarea
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                  />
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="body_admin.product_management.update_product.price" defaultMessage="Giá:" /> <span style={{ color: 'red' }}>*</span></label>
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
                  <label><FormattedMessage id="body_admin.product_management.update_product.discountPrice" defaultMessage="Giá khuyến mãi:" /></label>
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
                  <label><FormattedMessage id="body_admin.product_management.update_product.dimensions" defaultMessage="Kích thước:" /></label>
                  <div className="dimensions-inputs">
                     <div className="dimension-input">
                        <label><FormattedMessage id="body_admin.product_management.update_product.length" defaultMessage="Chiều dài (cm):" /></label>
                        <input
                           type="number"
                           value={length}
                           onChange={(e) => setLength(e.target.value)}
                           min="0"
                           step="0.1"
                           placeholder="VD: 2"
                        />
                     </div>
                     <div className="dimension-separator">x</div>
                     <div className="dimension-input">
                        <label><FormattedMessage id="body_admin.product_management.update_product.width" defaultMessage="Chiều rộng (cm):" /></label>
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
                  <label><FormattedMessage id="body_admin.product_management.update_product.stock" defaultMessage="Số lượng tồn kho:" /> <span style={{ color: 'red' }}>*</span></label>
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
                     <span className="unit">cái</span>
                  </div>
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="body_admin.product_management.update_product.saleQuantity" defaultMessage="Số lượng đơn vị bán:" /> <span style={{ color: 'red' }}>*</span></label>
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
                     <span className="unit">cái</span>
                  </div>
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="body_admin.product_management.update_product.isNew" defaultMessage="Sản phẩm mới:" /></label>
                  <input
                     type="checkbox"
                     checked={isNew}
                     onChange={(e) => setIsNew(e.target.checked)}
                  />
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="body_admin.product_management.update_product.isBestSeller" defaultMessage="Sản phẩm bán chạy:" /></label>
                  <input
                     type="checkbox"
                     checked={isBestSeller}
                     onChange={(e) => setIsBestSeller(e.target.checked)}
                  />
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="body_admin.product_management.update_product.images" defaultMessage="Hình ảnh sản phẩm:" /></label>
                  <ProductImageManager productId={id} mode="edit" />
               </div>
               <div className="form-actions">
                  <button className="btn-submit" type="submit" disabled={loading}>
                     {loading ? <FormattedMessage id="body_admin.product_management.update_product.loading_submit" defaultMessage="Đang cập nhật..." /> : <FormattedMessage id="body_admin.product_management.update_product.submit" defaultMessage="Cập nhật sản phẩm" />}
                  </button>
                  <button
                     type="button"
                     className="btn-cancel"
                     onClick={() => navigate(-1)}
                     disabled={loading}
                  >
                     <FormattedMessage id="body_admin.product_management.update_product.cancel" defaultMessage="Hủy" />
                  </button>
               </div>
            </form>
         )}
      </div>
   );
};

export default ProductUpdate;