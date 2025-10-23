import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getCategoryById, getProductsByCategoryId, deleteCategory, getActiveCategories } from '../../../../services/categoryService.js';
import CustomToast from '../../../CustomToast';
import './CategoryDetail.scss';

const CategoryDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const intl = useIntl();
   const [category, setCategory] = useState(null);
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [isUpdating, setIsUpdating] = useState(false);
   const [showDescriptionModal, setShowDescriptionModal] = useState(false);

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

   const toggleDescriptionModal = () => {
      setShowDescriptionModal(!showDescriptionModal);
   };

   // Handle ESC key to close modal
   useEffect(() => {
      const handleEscKey = (event) => {
         if (event.key === 'Escape' && showDescriptionModal) {
            setShowDescriptionModal(false);
         }
      };

      if (showDescriptionModal) {
         document.addEventListener('keydown', handleEscKey);
         document.body.style.overflow = 'hidden'; // Prevent background scroll
      }

      return () => {
         document.removeEventListener('keydown', handleEscKey);
         document.body.style.overflow = 'unset';
      };
   }, [showDescriptionModal]);

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
         showToast('error', intl.formatMessage({
            id: 'body_admin.category_management.detail_category.update_blocked',
            defaultMessage: 'Vui lòng ẩn danh mục trước khi cập nhật',
         }));
         return;
      }

      navigate(`/admin/product-category-management/category-management/category-update/${id}`);
   };

   const handleToggleActive = async () => {
      if (!category?.id) {
         showToast('error', intl.formatMessage({
            id: 'body_admin.category_management.detail_category.not_found',
            defaultMessage: 'Danh mục không được tìm thấy'
         }));
         return;
      }

      const newActiveStatus = !category.isActive;
      const actionText = newActiveStatus ? 'hiện' : 'ẩn';
      const actionTextUpper = newActiveStatus ? 'HIỆN' : 'ẨN';

      // Step 1: Basic confirmation
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({
            id: `body_admin.category_management.detail_category.toggle_confirm_title_1`,
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_confirm_title_1', defaultMessage: `Xác nhận ${actionText} danh mục` })
         }),
         html: `<strong>${category.nameCategory || intl.formatMessage({ id: 'body_admin.category_management.detail_category.no_name', defaultMessage: 'Không có tên danh mục' })}</strong><br>ID: ${category.id}<br><br>
         <div style="color: ${newActiveStatus ? '#16a34a' : '#dc2626'}; font-weight: 600;">
            ${newActiveStatus ? intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_security_warning_1_text', defaultMessage: 'Danh mục sẽ được hiển thị trên trang chủ' }) : intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_security_warning_2_text', defaultMessage: 'Danh mục sẽ bị ẩn khỏi trang chủ' })}
         </div>`,
         icon: newActiveStatus ? 'success' : 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.toggle_confirm_button_1',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_confirm_button_1', defaultMessage: 'Tiếp tục' })
         }),
         cancelButtonText: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.cancel_button',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.cancel_button', defaultMessage: 'Hủy' })
         })
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Second confirmation
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({
            id: `body_admin.category_management.detail_category.toggle_confirm_title_2`,
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_confirm_title_2', defaultMessage: `Are you sure you want to ${actionText}?` })
         }),
         text: intl.formatMessage({
            id: `body_admin.category_management.detail_category.toggle_confirm_text_2`,
            defaultMessage: newActiveStatus
               ? intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_security_warning_1_text', defaultMessage: 'Danh mục sẽ được hiển thị trên trang chủ' })
               : intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_security_warning_2_text', defaultMessage: 'Danh mục sẽ bị ẩn khỏi trang chủ' })
         }),
         icon: newActiveStatus ? 'question' : 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({
            id: `body_admin.category_management.detail_category.toggle_confirm_button_2`,
            defaultMessage: newActiveStatus ? intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_confirm_button_1', defaultMessage: 'Hiển thị' }) : intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_confirm_button_2', defaultMessage: 'Ẩn' })
         }),
         cancelButtonText: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.cancel_button',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.cancel_button', defaultMessage: 'Cancel' })
         })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase
      const confirmText = await Swal.fire({
         title: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.toggle_security_title',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_security_title', defaultMessage: 'Xác nhận bảo mật' })
         }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: ${newActiveStatus ? '#16a34a' : '#ef4444'}; font-weight: 600;">
                  ${intl.formatMessage({
            id: `body_admin.category_management.detail_category.toggle_security_warning`,
            defaultMessage: newActiveStatus
               ? intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_security_warning_1_text', defaultMessage: 'Danh mục sẽ được hiển thị trên trang chủ' })
               : intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_security_warning_2_text', defaultMessage: 'Danh mục sẽ bị ẩn khỏi trang chủ' })
         })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({
            id: 'body_admin.category_management.detail_category.toggle_security_confirm_text',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_security_confirm_text', defaultMessage: 'Danh mục' })
         })}: <strong style="color: #dc2626;">${category.nameCategory || 'Không có tên danh mục'}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({
            id: 'body_admin.category_management.detail_category.toggle_security_type_exact',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })
         })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${actionTextUpper} DANH MỤC</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.toggle_security_placeholder',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' })
         }),
         icon: newActiveStatus ? 'success' : 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.toggle_security_continue',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_security_continue', defaultMessage: `Tiếp tục ${actionText}` })
         }),
         cancelButtonText: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.cancel_button',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.cancel_button', defaultMessage: 'Hủy' })
         }),
         inputValidator: (value) => {
            const expectedPhrase = `${actionTextUpper} DANH MỤC`;
            if (value !== expectedPhrase) {
               return intl.formatMessage({
                  id: 'body_admin.category_management.detail_category.toggle_security_error',
                  defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' })
               });
            }
         },
         customClass: {
            popup: 'swal-toggle-step3',
            input: 'swal-text-input'
         }
      });

      if (!confirmText.isConfirmed) return;

      setIsUpdating(true);
      try {
         const result = await getActiveCategories(category.id, newActiveStatus);

         if (result.errCode === 0) {
            setCategory({ ...category, isActive: newActiveStatus });
            showToast('success',
               result.errMessage || intl.formatMessage({
                  id: `body_admin.category_management.detail_category.${newActiveStatus ? 'activated' : 'deactivated'}`,
                  defaultMessage: newActiveStatus ? intl.formatMessage({ id: 'body_admin.category_management.detail_category.activated', defaultMessage: 'Hiện danh mục thành công' }) : intl.formatMessage({ id: 'body_admin.category_management.detail_category.deactivated', defaultMessage: 'Ẩn danh mục thành công' })
               })
            );
         } else {
            showToast('error', result.errMessage || intl.formatMessage({
               id: `body_admin.category_management.detail_category.toggle_failed`,
               defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_failed', defaultMessage: `${newActiveStatus ? 'Hiện' : 'Ẩn'} danh mục thất bại` })
            }));
         }
      } catch (error) {
         console.error('Toggle active error:', error);
         showToast('error', intl.formatMessage({
            id: 'body_admin.category_management.detail_category.toggle_error',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.toggle_error', defaultMessage: 'Có lỗi xảy ra khi cập nhật trạng thái' })
         }));
      } finally {
         setIsUpdating(false);
      }
   };

   const handleDelete = async () => {
      if (!category || !category.id) {
         showToast('error', intl.formatMessage({
            id: 'body_admin.category_management.detail_category.not_found',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.not_found', defaultMessage: 'Danh mục không được tìm thấy' })
         }));
         return;
      }

      if (category.isActive) {
         showToast('error', intl.formatMessage({
            id: 'body_admin.category_management.detail_category.blocked_active',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.blocked_active', defaultMessage: 'Không thể xóa danh mục đang hoạt động' })
         }));
         return;
      }

      // Step 1: Basic confirmation
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.confirm_title_1',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.confirm_title_1', defaultMessage: 'Xác nhận xóa danh mục' })
         }),
         html: `<strong>${category.nameCategory || intl.formatMessage({ id: 'body_admin.category_management.detail_category.no_name', defaultMessage: 'Không có tên danh mục' })}</strong><br>ID: ${category.id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.confirm_button_1',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.confirm_button_1', defaultMessage: 'Tiếp tục' })
         }),
         cancelButtonText: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.cancel_button',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.cancel_button', defaultMessage: 'Hủy' })
         })
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Second confirmation
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.confirm_title_2',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.confirm_title_2', defaultMessage: 'Bạn chắc chắn muốn xóa?' })
         }),
         text: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.confirm_text_2',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.confirm_text_2', defaultMessage: 'Hành động này không thể hoàn tác!' })
         }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.confirm_button_2',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.confirm_button_2', defaultMessage: 'Xóa' })
         }),
         cancelButtonText: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.cancel_button',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.cancel_button', defaultMessage: 'Hủy' })
         })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase
      const confirmText = await Swal.fire({
         title: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.security_title',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.security_title', defaultMessage: 'Xác nhận bảo mật' })
         }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({
            id: 'body_admin.category_management.detail_category.security_warning',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.security_warning', defaultMessage: 'Cảnh báo: Hành động này sẽ xóa vĩnh viễn danh mục!' })
         })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({
            id: 'body_admin.category_management.detail_category.security_confirm_text',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.security_confirm_text', defaultMessage: 'Danh mục cần xóa' })
         })}: <strong style="color: #dc2626;">${category.nameCategory || 'Không có tên danh mục'}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({
            id: 'body_admin.category_management.detail_category.security_type_exact',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.security_type_exact', defaultMessage: 'Nhập chính xác cụm từ' })
         })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">XÓA DANH MỤC</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.security_placeholder',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.security_placeholder', defaultMessage: 'Nhập cụm từ xác nhận...' })
         }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.security_continue',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.security_continue', defaultMessage: 'Tiếp tục xóa' })
         }),
         cancelButtonText: intl.formatMessage({
            id: 'body_admin.category_management.detail_category.cancel_button',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.cancel_button', defaultMessage: 'Hủy' })
         }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({ id: 'body_admin.category_management.detail_category.security_phrase', defaultMessage: 'XÓA DANH MỤC' });
            if (value !== expectedPhrase) {
               return intl.formatMessage({
                  id: 'body_admin.category_management.detail_category.security_error',
                  defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.security_error', defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.' })
               });
            }
         },
         customClass: {
            popup: 'swal-delete-step3',
            input: 'swal-text-input'
         }
      });

      if (!confirmText.isConfirmed) return;

      setIsUpdating(true);
      try {
         const result = await deleteCategory(category.id);

         if (result.errCode === 0) {
            showToast('success',
               result.errMessage || intl.formatMessage({
                  id: 'body_admin.category_management.detail_category.success',
                  defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.success', defaultMessage: 'Xóa danh mục thành công' })
               })
            );
            setTimeout(() => navigate('/admin/product-category-management/category-management'), 1500);
         } else {
            showToast('error', result.errMessage || intl.formatMessage({
               id: 'body_admin.category_management.detail_category.failed',
               defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.failed', defaultMessage: 'Xóa danh mục thất bại' })
            }));
         }
      } catch (error) {
         console.error('Delete category error:', error);
         showToast('error', error.response?.data?.errMessage || intl.formatMessage({
            id: 'body_admin.category_management.detail_category.error',
            defaultMessage: intl.formatMessage({ id: 'body_admin.category_management.detail_category.error', defaultMessage: 'Lỗi khi xóa danh mục' })
         }));
      } finally {
         setIsUpdating(false);
      }
   };

   const handleManageProducts = () => {
      navigate(`/admin/product-category-management/category-management/info-product/${id}`);
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
                        <span className="value">
                           {category.description ? (
                              <span
                                 className="description-link"
                                 onClick={toggleDescriptionModal}
                                 title={intl.formatMessage({ id: 'body_admin.category_management.detail_category.description_tooltip', defaultMessage: 'Click để xem mô tả đầy đủ' })}
                              >
                                 <FormattedMessage id="body_admin.category_management.detail_category.view_description" defaultMessage="Xem!" />
                              </span>
                           ) : (
                              intl.formatMessage({ id: 'body_admin.category_management.detail_category.empty', defaultMessage: 'Không có' })
                           )}
                        </span>
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
                        <span className="value product-count">{products.length}<span className="product-count-text"><FormattedMessage id="body_admin.category_management.detail_category.products_count_text" defaultMessage=" sản phẩm" /></span></span>
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
               <div className="action-buttons">
                  <button
                     className={`btn-action ${category.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                     onClick={handleToggleActive}
                     disabled={isUpdating}
                  >
                     {category.isActive ? (
                        <FormattedMessage id="body_admin.category_management.detail_category.hide_category" defaultMessage="Ẩn danh mục" />
                     ) : (
                        <FormattedMessage id="body_admin.category_management.detail_category.show_category" defaultMessage="Hiện danh mục" />
                     )}
                  </button>

                  <button
                     className="btn-action btn-add-category"
                     onClick={handleManageProducts}
                     disabled={isUpdating}
                  >
                     <FormattedMessage id="body_admin.category_management.detail_category.manage_products" defaultMessage="Quản lý sản phẩm" />
                  </button>

                  <button
                     className="btn-action btn-delete"
                     onClick={handleDelete}
                     disabled={isUpdating}
                  >
                     <FormattedMessage id="body_admin.category_management.detail_category.detail_category" defaultMessage="Xóa danh mục" />
                  </button>

                  <button
                     className="btn-action btn-update"
                     onClick={handleEdit}
                     disabled={isUpdating}
                  >
                     <FormattedMessage id="body_admin.category_management.detail_category.edit_button" defaultMessage="Cập nhật danh mục" />
                  </button>

                  <button
                     className="btn-action btn-back"
                     onClick={() => navigate(-1)}
                     disabled={isUpdating}
                  >
                     <FormattedMessage id="body_admin.category_management.detail_category.back_button" defaultMessage="Quay lại" />
                  </button>
               </div>
            </div>
         </div>

         {/* Description Modal */}
         {showDescriptionModal && (
            <div className="description-modal">
               <div className="modal-overlay" onClick={toggleDescriptionModal}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                     <div className="modal-header">
                        <h3>
                           <FormattedMessage
                              id="body_admin.category_management.detail_category.title_description"
                              defaultMessage="Mô tả danh mục"
                           />
                        </h3>
                        <button className="close-btn" onClick={toggleDescriptionModal}>
                           ×
                        </button>
                     </div>
                     <div className="modal-body">
                        <div className="description-content">
                           {category.description || intl.formatMessage({
                              id: 'body_admin.category_management.detail_category.no_description',
                              defaultMessage: 'Không có mô tả'
                           })}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default CategoryDetail;
