import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useIntl, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../../../services/categoryService.js';
import CategoryDelete from './CategoryDelete.js';
import CategoryActive from './CategoryActive.js';
import CustomToast from '../../../CustomToast';
import HintBox from '../../../HintBox';

const CategoryManager = () => {
   const [categories, setCategories] = useState([]);
   const [filteredCategories, setFilteredCategories] = useState([]);
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
               titleId={type === 'error' ? 'category.manager.error_title' : 'category.manager.success_title'}
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
         toast.error(intl.formatMessage({ id: 'category.manager.load_error', defaultMessage: 'Không thể tải danh sách danh mục' }));
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchCategories();
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
            id: 'category.manager.update_blocked',
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
               <FormattedMessage id="category.manager.title_head" defaultMessage="Quản lý danh mục" />
            </h1>
            <button
               className="btn-create-category"
               onClick={() => navigate('/admin/product-category-management/category-management/category-create')}
            >
               + <FormattedMessage id="category.manager.create_button" defaultMessage="Tạo danh mục" />
            </button>
         </div>
         <div className="category-filters">
            <label><FormattedMessage id="category.manager.filter_status" defaultMessage="Lọc trạng thái:" /></label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
               <option value="all"><FormattedMessage id="category.manager.filter_all" defaultMessage="Tất cả" /></option>
               <option value="active"><FormattedMessage id="category.manager.filter_active" defaultMessage="Đang hiển thị" /></option>
               <option value="inactive"><FormattedMessage id="category.manager.filter_inactive" defaultMessage="Đã ẩn" /></option>
            </select>
         </div>
         <HintBox
            content={
               <div>
                  <p><FormattedMessage id="category.manager.hint_title" defaultMessage="Hướng dẫn: Quản lý danh sách danh mục, bao gồm tạo, cập nhật, xóa và thay đổi trạng thái hiển thị." /></p>
                  <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                     <li><FormattedMessage id="category.manager.hint_update" defaultMessage="Cần ẩn danh mục trước khi cập nhật hoặc xóa." /></li>
                     <li><FormattedMessage id="category.manager.hint_active" defaultMessage="Chỉ danh mục đã ẩn mới có thể cập nhật/xóa." /></li>
                  </ul>
               </div>
            }
         />
         <div className="category-search-bar">
            <input
               type="text"
               placeholder={intl.formatMessage({ id: 'category.manager.search_placeholder', defaultMessage: 'Tìm theo tên danh mục, ID...' })}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         {loading ? (
            <p className="category-loading"><FormattedMessage id="category.manager.loading" defaultMessage="Đang tải danh mục..." /></p>
         ) : (
            <div className="category-table-wrapper">
               <table className="category-table">
                  <thead>
                     <tr>
                        <th>ID</th>
                        <th><FormattedMessage id="category.manager.name" defaultMessage="Tên danh mục" /></th>
                        <th><FormattedMessage id="category.manager.status" defaultMessage="Hiển thị" /></th>
                        <th><FormattedMessage id="category.manager.actions" defaultMessage="Hành động" /></th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredCategories.length === 0 ? (
                        <tr>
                           <td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>
                              <FormattedMessage id="category.manager.empty_body" defaultMessage="Không có danh mục nào phù hợp." />
                           </td>
                        </tr>
                     ) : (
                        filteredCategories.map((category) => (
                           <tr key={category.id}>
                              <td>{category.id}</td>
                              <td>{category.nameCategory || ''}</td>
                              <td>{category.isActive ? '✅' : '❌'}</td>
                              <td>
                                 <div className="action-buttons">
                                    <button
                                       className="btn-action btn-detail"
                                       onClick={() => handleDetailClick(category)}
                                    >
                                       <FormattedMessage id="category.manager.detail" defaultMessage="Chi tiết" />
                                    </button>
                                    <button
                                       className="btn-action btn-update"
                                       onClick={() => handleUpdateClick(category)}
                                    >
                                       <FormattedMessage id="category.manager.update" defaultMessage="Cập nhật" />
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
                                       className="btn-action btn-info-product"
                                       onClick={() => navigate('/admin/product-category-management/category-management/info-product', {
                                          state: { categoryId: category.id }
                                       })}
                                    >
                                       Sản phẩm
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
