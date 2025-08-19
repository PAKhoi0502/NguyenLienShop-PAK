import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useIntl, FormattedMessage } from 'react-intl';
import { getProductById, updateProduct } from '../../../../services/productService.js';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';

const ProductUpdate = () => {
   const [nameProduct, setNameProduct] = useState('');
   const [description, setDescription] = useState('');
   const [price, setPrice] = useState('');
   const [discountPrice, setDiscountPrice] = useState('');
   const [dimensions, setDimensions] = useState('');
   const [stock, setStock] = useState('');
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
               titleId={type === 'success' ? 'product.update.success_title' : 'product.update.error_title'}
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
         console.log('Fetch product response:', res);
         if (res && res.errCode === 0 && res.product) {
            const { nameProduct, description, price, discountPrice, dimensions, stock, isNew, isBestSeller } = res.product;
            setNameProduct(nameProduct || '');
            setDescription(description || '');
            setPrice(price ? price.toString() : '');
            setDiscountPrice(discountPrice ? discountPrice.toString() : '');
            setDimensions(dimensions || '');
            setStock(stock ? stock.toString() : '');
            setIsNew(!!isNew);
            setIsBestSeller(!!isBestSeller);
         } else {
            const errorMessage = res.errMessage || intl.formatMessage({ id: 'product.update.fetch_error', defaultMessage: 'Không thể tải thông tin sản phẩm' });
            showToast('error', errorMessage);
            navigate('/admin/product-category-management/product-management');
         }
      } catch (err) {
         console.error('Fetch product error:', err.response?.data, err.response?.status);
         const errorMessage = err.response?.data?.errMessage || intl.formatMessage({ id: 'product.update.server_error', defaultMessage: 'Lỗi server khi tải sản phẩm' });
         showToast('error', errorMessage);
         navigate('/admin/product-category-management/product-management');
      } finally {
         setFetching(false);
      }
   };

   useEffect(() => {
      fetchProduct();
   }, [id]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
         showToast('error', intl.formatMessage({ id: 'product.update.no_token', defaultMessage: 'Vui lòng đăng nhập lại' }));
         navigate('/login');
         setLoading(false);
         return;
      }

      if (!nameProduct || !price || !stock) {
         showToast('error', intl.formatMessage({ id: 'product.update.missing_fields', defaultMessage: 'Vui lòng nhập đầy đủ các trường bắt buộc (tên, giá, số lượng tồn kho)' }));
         setLoading(false);
         return;
      }

      const parsedPrice = parseFloat(price);
      const parsedStock = parseInt(stock);
      const parsedDiscountPrice = discountPrice ? parseFloat(discountPrice) : null;

      if (isNaN(parsedPrice) || isNaN(parsedStock)) {
         showToast('error', intl.formatMessage({ id: 'product.update.invalid_number', defaultMessage: 'Giá và số lượng tồn kho phải là số hợp lệ' }));
         setLoading(false);
         return;
      }

      const data = {
         id,
         nameProduct,
         description: description || '',
         price: parsedPrice,
         discountPrice: parsedDiscountPrice,
         dimensions: dimensions || '',
         stock: parsedStock,
         isNew, // Thêm isNew vào dữ liệu
         isBestSeller // Thêm isBestSeller vào dữ liệu
      };

      try {
         const res = await updateProduct(data);
         if (res && res.errCode === 0) {
            showToast('success', intl.formatMessage({ id: 'product.update.success', defaultMessage: 'Cập nhật sản phẩm thành công' }));
            navigate('/admin/product-category-management/product-management');
         } else {
            showToast('error', res.errMessage || intl.formatMessage({ id: 'product.update.error', defaultMessage: 'Không thể cập nhật sản phẩm' }));
         }
      } catch (err) {
         console.error('Update product error:', err.response?.data, err.response?.status);
         showToast('error', intl.formatMessage({ id: 'product.update.server_error', defaultMessage: 'Lỗi server khi cập nhật sản phẩm' }));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="product-update-container">
         <HintBox
            content={
               <div>
                  <p><FormattedMessage id="product.hint.title" defaultMessage="Hướng dẫn: Cập nhật thông tin sản phẩm." /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="product.hint.name" defaultMessage="Tên sản phẩm là bắt buộc." /></li>
                     <li><FormattedMessage id="product.hint.price" defaultMessage="Giá và số lượng tồn kho là bắt buộc." /></li>
                     <li><FormattedMessage id="product.hint.optional" defaultMessage="Mô tả, giá khuyến mãi, kích thước, sản phẩm mới, sản phẩm bán chạy là tùy chọn." /></li>
                  </ul>
               </div>
            }
         />

         <h1><FormattedMessage id="product.update.title" defaultMessage="Cập nhật sản phẩm" /></h1>
         {fetching ? (
            <p className="product-loading"><FormattedMessage id="product.update.loading" defaultMessage="Đang tải thông tin sản phẩm..." /></p>
         ) : (
            <form onSubmit={handleSubmit} className="product-update-form">
               <div className="form-group">
                  <label><FormattedMessage id="product.update.name" defaultMessage="Tên sản phẩm:" /> <span style={{ color: 'red' }}>*</span></label>
                  <input
                     type="text"
                     value={nameProduct}
                     onChange={(e) => setNameProduct(e.target.value)}
                     required
                  />
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="product.update.description" defaultMessage="Mô tả:" /></label>
                  <textarea
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                  />
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="product.update.price" defaultMessage="Giá:" /> <span style={{ color: 'red' }}>*</span></label>
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
                  <label><FormattedMessage id="product.update.discountPrice" defaultMessage="Giá khuyến mãi:" /></label>
                  <input
                     type="number"
                     value={discountPrice}
                     onChange={(e) => setDiscountPrice(e.target.value)}
                     min="0"
                     step="0.01"
                  />
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="product.update.dimensions" defaultMessage="Kích thước:" /></label>
                  <input
                     type="text"
                     value={dimensions}
                     onChange={(e) => setDimensions(e.target.value)}
                  />
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="product.update.stock" defaultMessage="Số lượng tồn kho:" /> <span style={{ color: 'red' }}>*</span></label>
                  <input
                     type="number"
                     value={stock}
                     onChange={(e) => setStock(e.target.value)}
                     min="0"
                     step="1"
                     required
                  />
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="product.update.isNew" defaultMessage="Sản phẩm mới:" /></label>
                  <input
                     type="checkbox"
                     checked={isNew}
                     onChange={(e) => setIsNew(e.target.checked)}
                  />
               </div>
               <div className="form-group">
                  <label><FormattedMessage id="product.update.isBestSeller" defaultMessage="Sản phẩm bán chạy:" /></label>
                  <input
                     type="checkbox"
                     checked={isBestSeller}
                     onChange={(e) => setIsBestSeller(e.target.checked)}
                  />
               </div>
               <div className="form-actions">
                  <button className="btn-submit" type="submit" disabled={loading}>
                     {loading ? <FormattedMessage id="product.update.loading_submit" defaultMessage="Đang cập nhật..." /> : <FormattedMessage id="product.update.submit" defaultMessage="Cập nhật sản phẩm" />}
                  </button>
                  <button
                     type="button"
                     className="btn-cancel"
                     onClick={() => navigate('/admin/product-category-management/product-management')}
                     disabled={loading}
                  >
                     <FormattedMessage id="product.update.cancel" defaultMessage="Hủy" />
                  </button>
               </div>
            </form>
         )}
      </div>
   );
};

export default ProductUpdate;