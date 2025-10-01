import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { getAllProducts } from '../../../../services/productService.js';
import ProductActive from './ProductActive';
import ProductDelete from './ProductDelete';
import CustomToast from '../../../CustomToast';
import HintBox from '../../../HintBox';
import './ProductManager.scss';


const ProductManager = () => {
   const [products, setProducts] = useState([]);
   const [filteredProducts, setFilteredProducts] = useState([]);
   const [search, setSearch] = useState('');
   const [loading, setLoading] = useState(true);
   const [filterStatus, setFilterStatus] = useState('all');
   const navigate = useNavigate();
   const intl = useIntl();

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === 'error' ? 'body_admin.product_management.error_title' : 'body_admin.product_management.success_title'}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const fetchProducts = useCallback(async () => {
      try {
         const res = await getAllProducts();
         setProducts(Array.isArray(res) ? res : []);
      } catch (err) {
         console.error('Fetch products error:', err);
         toast.error(intl.formatMessage({ id: 'body_admin.product_management.load_error', defaultMessage: 'Không thể tải danh sách sản phẩm' }));
      } finally {
         setLoading(false);
      }
   }, [intl]);

   useEffect(() => {
      fetchProducts();
   }, [fetchProducts]);

   useEffect(() => {
      const keyword = search.trim().toLowerCase();
      const filtered = products.filter((product) => {
         const matchSearch =
            (product.nameProduct || '').toLowerCase().includes(keyword) ||
            String(product.id).includes(keyword);

         const matchStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && product.isActive) ||
            (filterStatus === 'inactive' && !product.isActive) ||
            (filterStatus === 'out_of_stock' && (product.stock === 0 || product.stock === null));

         return matchSearch && matchStatus;
      });

      setFilteredProducts(filtered);
   }, [search, products, filterStatus]);

   const handleUpdateClick = (clickedProduct) => {
      const realProduct = products.find((p) => p.id === clickedProduct.id);
      if (realProduct?.isActive) {
         showToast('error', intl.formatMessage({
            id: 'body_admin.product_management.update_blocked',
            defaultMessage: 'Vui lòng ẩn sản phẩm trước khi cập nhật',
         }));
         return;
      }
      navigate(`/admin/product-category-management/product-management/product-update/${clickedProduct.id}`);
   };

   const handleDetailClick = (product) => {
      navigate(`/admin/product-category-management/product-management/product-detail/${product.id}`);
   };

   return (
      <div className="product-manager-container">
         <div className="product-manager-top">
            <h1 className="product-title">
               <FormattedMessage id="body_admin.product_management.title_head" defaultMessage="Quản lý sản phẩm" />
            </h1>
            <button
               className="btn-create-product"
               onClick={() => navigate('/admin/product-category-management/product-management/product-create')}
            >
               + <FormattedMessage id="body_admin.product_management.create_button" defaultMessage="Tạo sản phẩm" />
            </button>
         </div>

         <div className="product-filters">
            <HintBox
               theme="product"
               content={
                  <div>
                     <p><FormattedMessage id="body_admin.product_management.hint_title" defaultMessage="Hướng dẫn: Quản lý danh sách sản phẩm, bao gồm tạo, cập nhật, xóa và thay đổi trạng thái hiển thị." /></p>
                     <ul>
                        <li><FormattedMessage id="body_admin.product_management.hint_1" defaultMessage="Sử dụng nút 'Tạo sản phẩm' để thêm sản phẩm mới vào hệ thống." /></li>
                        <li><FormattedMessage id="body_admin.product_management.hint_2" defaultMessage="Chỉ có thể cập nhật sản phẩm khi đã ẩn khỏi trang chủ." /></li>
                        <li><FormattedMessage id="body_admin.product_management.hint_3" defaultMessage="Sử dụng bộ lọc để tìm sản phẩm theo trạng thái hiển thị." /></li>
                        <li><FormattedMessage id="body_admin.product_management.hint_4" defaultMessage="Chức năng tìm kiếm hỗ trợ tìm theo tên sản phẩm hoặc ID." /></li>
                        <li><FormattedMessage id="body_admin.product_management.hint_5" defaultMessage="Quản lý danh mục sản phẩm thông qua nút 'Danh mục'." /></li>
                     </ul>
                  </div>
               }
            />
            <label><FormattedMessage id="body_admin.product_management.filter_status" defaultMessage="Lọc trạng thái:" /></label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
               <option value="all"><FormattedMessage id="body_admin.product_management.filter_all" defaultMessage="Tất cả" /></option>
               <option value="active"><FormattedMessage id="body_admin.product_management.filter_active" defaultMessage="Đang hiển thị" /></option>
               <option value="inactive"><FormattedMessage id="body_admin.product_management.filter_inactive" defaultMessage="Đã ẩn" /></option>
               <option value="out_of_stock"><FormattedMessage id="body_admin.product_management.filter_out_of_stock" defaultMessage="Hết hàng" /></option>
            </select>
         </div>
         <div className="product-search-bar">
            <input
               type="text"
               placeholder={intl.formatMessage({ id: 'body_admin.product_management.search_placeholder', defaultMessage: 'Tìm theo tên sản phẩm, ID...' })}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         {loading ? (
            <p className="product-loading"><FormattedMessage id="body_admin.product_management.loading" defaultMessage="Đang tải sản phẩm..." /></p>
         ) : (
            <div className="product-table-wrapper">
               <table className="product-table">
                  <thead>
                     <tr>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>ID</th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.product_management.name" defaultMessage="Tên sản phẩm" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.product_management.stock" defaultMessage="Tồn kho" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.product_management.dimensions" defaultMessage="Kích thước" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.product_management.status" defaultMessage="Ẩn/Hiện" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.product_management.actions" defaultMessage="Hành động" /></th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredProducts.length === 0 ? (
                        <tr>
                           <td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>
                              <FormattedMessage id="body_admin.product_management.empty_body" defaultMessage="Không có sản phẩm nào phù hợp." />
                           </td>
                        </tr>
                     ) : (
                        filteredProducts.map((product) => (
                           <tr key={product.id}>
                              <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{product.id}</td>
                              <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                 <span
                                    className="product-name-link"
                                    onClick={() => handleDetailClick(product)}
                                    style={{
                                       cursor: 'pointer',
                                       color: '#2563eb',
                                       textDecoration: 'underline',
                                       transition: 'color 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
                                    onMouseLeave={(e) => e.target.style.color = '#2563eb'}
                                 >
                                    {product.nameProduct || ''}
                                 </span>
                              </td>
                              <td>
                                 <span style={{ fontSize: '1rem', fontWeight: 'bold', cursor: 'default' }} className={`stock-badge ${(product.stock === 0 || product.stock === null) ? 'out-of-stock' : 'in-stock'}`}>
                                    {product.stock || 0}
                                 </span>
                              </td>
                              <td style={{ fontSize: '1rem', fontWeight: 'bold' }}>{product.dimensions || intl.formatMessage({ id: 'body_admin.product_management.empty_dimensions', defaultMessage: 'Không có' })}</td>
                              <td className="status-cell" style={{ cursor: 'default' }}>{product.isActive ? '✅' : '❌'}</td>
                              <td>
                                 <div className="action-buttons">
                                    <button
                                       className="btn-action btn-detail"
                                       onClick={() => handleDetailClick(product)}
                                    >
                                       <FormattedMessage id="body_admin.product_management.detail" defaultMessage="Chi tiết" />
                                    </button>
                                    <button
                                       className="btn-action btn-update"
                                       onClick={() => handleUpdateClick(product)}
                                    >
                                       <FormattedMessage id="body_admin.product_management.update" defaultMessage="Cập nhật" />
                                    </button>
                                    <ProductActive
                                       product={product}
                                       onSuccess={(productId, updatedProduct) => {
                                          setProducts((prev) =>
                                             prev.map((p) => (p.id === productId ? updatedProduct : p))
                                          );
                                       }}
                                    />
                                    <button
                                       className="btn-action btn-add-category"
                                       onClick={() => navigate('/admin/product-category-management/product-management/info-category', { state: { productId: product.id } })}
                                    >
                                       <FormattedMessage id="body_admin.product_management.info_category" defaultMessage="Danh mục" />
                                    </button>
                                    <ProductDelete
                                       product={product}
                                       onSuccess={(deletedProductId) => {
                                          setProducts((prev) => prev.filter((p) => p.id !== deletedProductId));
                                       }}
                                    />
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
};

export default ProductManager;
