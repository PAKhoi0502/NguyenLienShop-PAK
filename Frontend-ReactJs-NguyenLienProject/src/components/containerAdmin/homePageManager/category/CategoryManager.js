import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useIntl, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { getAllCategories, getProductCountForAllCategories } from '../../../../services/categoryService.js';
import CategoryDelete from './CategoryDelete.js';
import CategoryActive from './CategoryActive.js';
import CustomToast from '../../../CustomToast';
import HintBox from '../../../HintBox';
import './CategoryManager.scss';

const CategoryManager = () => {
   const [categories, setCategories] = useState([]);
   const [filteredCategories, setFilteredCategories] = useState([]);
   const [productCounts, setProductCounts] = useState({});
   const [search, setSearch] = useState('');
   const [filterStatus, setFilterStatus] = useState('all');
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();
   const intl = useIntl();

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === 'error' ? 'body_admin.category_management.error_title' : 'body_admin.category_management.success_title'}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const fetchCategories = async () => {
      try {
         const res = await getAllCategories();
         setCategories(Array.isArray(res) ? res : []);
      } catch (err) {
         console.error('Fetch categories error:', err);
         toast.error(intl.formatMessage({ id: 'body_admin.category_management.load_error', defaultMessage: 'Không thể tải danh sách danh mục' }));
      } finally {
         setLoading(false);
      }
   };

   const fetchProductCounts = async () => {
      try {
         const res = await getProductCountForAllCategories();
         if (res.errCode === 0 && res.data) {
            const countsMap = {};
            res.data.forEach(item => {
               countsMap[item.categoryId] = item.productCount;
            });
            setProductCounts(countsMap);
         }
      } catch (err) {
         console.error('Fetch product counts error:', err);
         // Không hiển thị toast error cho product counts để không làm phiền user
      }
   };

   useEffect(() => {
      fetchCategories();
      fetchProductCounts();
   }, []);

   useEffect(() => {
      const keyword = search.trim().toLowerCase();
      const filtered = categories.filter((category) => {
         const matchSearch =
            (category.nameCategory || '').toLowerCase().includes(keyword) ||
            String(category.id).includes(keyword);
         const matchStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && category.isActive) ||
            (filterStatus === 'inactive' && !category.isActive);
         return matchSearch && matchStatus;
      });
      setFilteredCategories(filtered);
   }, [search, categories, filterStatus]);

   const handleDetailClick = (category) => {
      navigate(`/admin/product-category-management/category-management/category-detail/${category.id}`);
   };

   const handleUpdateClick = (clickedCategory) => {
      const realCategory = categories.find((c) => c.id === clickedCategory.id);
      if (realCategory?.isActive) {
         showToast('error', intl.formatMessage({
            id: 'body_admin.category_management.update_blocked',
            defaultMessage: 'Vui lòng ẩn danh mục trước khi cập nhật',
         }));
         return;
      }
      navigate(`/admin/product-category-management/category-management/category-update/${clickedCategory.id}`);
   };

   return (
      <div className="category-manager-container">
         <div className="category-manager-top">
            <h1 className="category-title">
               <FormattedMessage id="body_admin.category_management.title_head" defaultMessage="Quản lý danh mục" />
            </h1>
            <button
               className="btn-create-category"
               onClick={() => navigate('/admin/product-category-management/category-management/category-create')}
            >
               + <FormattedMessage id="body_admin.category_management.create_button" defaultMessage="Tạo danh mục" />
            </button>
         </div>
         <div className="category-filters">
            <HintBox
               theme="category"
               content={
                  <div>
                     <p><FormattedMessage id="body_admin.category_management.hint_title" defaultMessage="Hướng dẫn: Quản lý danh sách danh mục, bao gồm tạo, cập nhật, xóa và thay đổi trạng thái hiển thị." /></p>
                     <ul>
                        <li><FormattedMessage id="body_admin.category_management.hint_1" defaultMessage="Sử dụng nút 'Tạo danh mục' để thêm danh mục mới vào hệ thống." /></li>
                        <li><FormattedMessage id="body_admin.category_management.hint_2" defaultMessage="Cần ẩn danh mục trước khi cập nhật hoặc xóa." /></li>
                        <li><FormattedMessage id="body_admin.category_management.hint_3" defaultMessage="Chỉ danh mục đã ẩn mới có thể cập nhật hoặc xóa." /></li>
                        <li><FormattedMessage id="body_admin.category_management.hint_4" defaultMessage="Sử dụng bộ lọc để tìm danh mục theo trạng thái hiển thị." /></li>
                        <li><FormattedMessage id="body_admin.category_management.hint_5" defaultMessage="Chức năng tìm kiếm hỗ trợ tìm theo tên danh mục hoặc ID." /></li>
                        <li><FormattedMessage id="body_admin.category_management.hint_6" defaultMessage="Xem sản phẩm trong danh mục thông qua nút 'Sản phẩm'." /></li>
                     </ul>
                  </div>
               }
            />
            <label><FormattedMessage id="body_admin.category_management.filter_status" defaultMessage="Lọc trạng thái:" /></label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
               <option value="all"><FormattedMessage id="body_admin.category_management.filter_all" defaultMessage="Tất cả" /></option>
               <option value="active"><FormattedMessage id="body_admin.category_management.filter_active" defaultMessage="Đang hiển thị" /></option>
               <option value="inactive"><FormattedMessage id="body_admin.category_management.filter_inactive" defaultMessage="Đã ẩn" /></option>
            </select>
         </div>
         <div className="category-search-bar">
            <input
               type="text"
               placeholder={intl.formatMessage({ id: 'body_admin.category_management.search_placeholder', defaultMessage: 'Tìm theo tên danh mục, ID...' })}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         {loading ? (
            <p className="category-loading"><FormattedMessage id="body_admin.category_management.loading" defaultMessage="Đang tải danh mục..." /></p>
         ) : (
            <div className="category-table-wrapper">
               <table className="category-table">
                  <thead>
                     <tr>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>ID</th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.category_management.name" defaultMessage="Tên danh mục" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.category_management.product_count" defaultMessage="Số lượng loại sản phẩm trong danh mục" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.category_management.status" defaultMessage="Hiển thị" /></th>
                        <th style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}><FormattedMessage id="body_admin.category_management.actions" defaultMessage="Hành động" /></th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredCategories.length === 0 ? (
                        <tr>
                           <td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>
                              <FormattedMessage id="body_admin.category_management.empty_body" defaultMessage="Không có danh mục nào phù hợp." />
                           </td>
                        </tr>
                     ) : (
                        filteredCategories.map((category) => (
                           <tr key={category.id}>
                              <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{category.id}</td>
                              <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                 <span
                                    className="category-name-link"
                                    onClick={() => handleDetailClick(category)}
                                    style={{
                                       cursor: 'pointer',
                                       color: '#2563eb',
                                       textDecoration: 'underline',
                                       transition: 'color 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
                                    onMouseLeave={(e) => e.target.style.color = '#2563eb'}
                                 >
                                    {category.nameCategory || ''}
                                 </span>
                              </td>
                              <td className="product-count-cell">
                                 <span className="product-count-badge" style={{ fontSize: '1rem', fontWeight: 'bold', cursor: 'default' }}>
                                    {productCounts[category.id] || 0}
                                 </span>
                              </td>
                              <td className="status-cell" style={{ cursor: 'default' }}>
                                 {category.isActive ? (
                                    <FormattedMessage id="body_admin.category_management.status_active" defaultMessage="Đang hiển thị ✅" />
                                 ) : (
                                    <FormattedMessage id="body_admin.category_management.status_inactive" defaultMessage="Đã ẩn ❌" />
                                 )}
                              </td>
                              <td>
                                 <div className="action-buttons">
                                    <button
                                       className="btn-action btn-detail"
                                       onClick={() => handleDetailClick(category)}
                                    >
                                       <FormattedMessage id="body_admin.category_management.detail" defaultMessage="Chi tiết" />
                                    </button>
                                    <button
                                       className="btn-action btn-update"
                                       onClick={() => handleUpdateClick(category)}
                                    >
                                       <FormattedMessage id="body_admin.category_management.update" defaultMessage="Cập nhật" />
                                    </button>
                                    <CategoryActive
                                       category={category}
                                       onSuccess={(categoryId, updatedCategory) => {
                                          setCategories((prev) =>
                                             prev.map((c) => (c.id === categoryId ? updatedCategory : c))
                                          );
                                       }}
                                    />
                                    <button
                                       className="btn-action btn-info-product btn-add-product"
                                       onClick={() => navigate(`/admin/product-category-management/category-management/info-product/${category.id}`)}
                                    >
                                       <FormattedMessage id="body_admin.category_management.product" defaultMessage="Sản phẩm" />
                                    </button>
                                    <CategoryDelete
                                       category={category}
                                       onSuccess={(deletedCategoryId) => {
                                          setCategories((prev) => prev.filter((c) => c.id !== deletedCategoryId));
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

export default CategoryManager;
