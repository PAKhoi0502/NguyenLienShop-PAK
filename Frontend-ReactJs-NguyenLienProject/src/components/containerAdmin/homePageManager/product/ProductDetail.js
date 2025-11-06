import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getProductById, deleteProduct, getActiveProducts } from '../../../../services/productService.js';
import CustomToast from '../../../CustomToast';
import './ProductDetail.scss';

const ProductDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const intl = useIntl();
   const [product, setProduct] = useState(null);
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
               titleId={type === 'error' ? 'body_admin.product_management.error_title' : 'body_admin.product_management.success_title'}
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
      const fetchProduct = async () => {
         try {
            setLoading(true);
            setError(null);

            const res = await getProductById(id);

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
            if (res.errCode === -1) {
               setError(res.errMessage || 'Lỗi server');
               return;
            }

            if (res.errCode === 0 && res.product) {
               setProduct(res.product);
            } else {
               setError('Không tìm thấy thông tin sản phẩm');
            }

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
         showToast('error', intl.formatMessage({
            id: 'body_admin.product_management.detail_product.update_blocked',
            defaultMessage: 'Vui lòng ẩn sản phẩm trước khi cập nhật',
         }));
         return;
      }

      navigate(`/admin/product-category-management/product-management/product-update/${id}`);
   };

   const handleToggleActive = async () => {
      if (!product?.id) {
         showToast('error', intl.formatMessage({
            id: 'body_admin.product_management.detail_product.not_found',
            defaultMessage: 'Sản phẩm không được tìm thấy'
         }));
         return;
      }

      const newActiveStatus = !product.isActive;
      const actionText = newActiveStatus ? 'hiện' : 'ẩn';
      const actionTextUpper = newActiveStatus ? 'HIỆN' : 'ẨN';

      // Step 1: Basic confirmation
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({
            id: `body_admin.product_management.detail_product.toggle_confirm_title_1`,
            defaultMessage: `Xác nhận ${actionText} sản phẩm`
         }),
         html: `<strong>${product.nameProduct || intl.formatMessage({
            id: 'body_admin.product_management.detail_product.no_name',
            defaultMessage: 'Không có tên sản phẩm'
         })}</strong><br>ID: ${product.id}<br><br>
         <div style="color: ${newActiveStatus ? '#16a34a' : '#dc2626'}; font-weight: 600;">
            ${newActiveStatus ? intl.formatMessage({
            id: 'body_admin.product_management.detail_product.toggle_confirm_text_1',
            defaultMessage: 'Sản phẩm sẽ được hiển thị trên trang chủ'
         }) : intl.formatMessage({
            id: 'body_admin.product_management.detail_product.toggle_confirm_text_2',
            defaultMessage: 'Sản phẩm sẽ bị ẩn khỏi trang chủ'
         })}
         </div>`,
         icon: newActiveStatus ? 'success' : 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({
            id: 'body_admin.product_management.detail_product.toggle_confirm_button_1',
            defaultMessage: 'Tiếp tục'
         }),
         cancelButtonText: intl.formatMessage({
            id: 'body_admin.product_management.detail_product.cancel_button',
            defaultMessage: 'Hủy'
         })
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Second confirmation
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({
            id: `body_admin.product_management.detail_product.toggle_confirm_title_2`,
            defaultMessage: `Bạn chắc chắn muốn ${actionText}?`
         }),
         text: intl.formatMessage({
            id: `body_admin.product_management.detail_product.toggle_confirm_text_2`,
            defaultMessage: newActiveStatus
               ? 'Sản phẩm sẽ hiển thị cho tất cả khách hàng!'
               : 'Sản phẩm sẽ bị ẩn khỏi trang chủ!'
         }),
         icon: newActiveStatus ? 'question' : 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({
            id: `body_admin.product_management.detail_product.toggle_confirm_button_2`,
            defaultMessage: newActiveStatus ? intl.formatMessage({
               id: 'body_admin.product_management.detail_product.activate_button'
            }) : intl.formatMessage({
               id: 'body_admin.product_management.detail_product.deactivate_button'
            })
         }),
         cancelButtonText: intl.formatMessage({
            id: 'body_admin.product_management.detail_product.cancel_button',
            defaultMessage: 'Hủy'
         })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase
      const confirmText = await Swal.fire({
         title: intl.formatMessage({
            id: 'body_admin.product_management.detail_product.toggle_security_title',
            defaultMessage: 'Xác nhận bảo mật'
         }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: ${newActiveStatus ? '#16a34a' : '#ef4444'}; font-weight: 600;">
                  ${intl.formatMessage({
            id: `body_admin.product_management.detail_product.toggle_security_warning`,
            defaultMessage: newActiveStatus
               ? intl.formatMessage({
                  id: 'body_admin.product_management.detail_product.toggle_security_warning_1_text',
                  defaultMessage: 'Sản phẩm sẽ được hiển thị trên trang chủ!'
               }) : intl.formatMessage({
                  id: 'body_admin.product_management.detail_product.toggle_security_warning_2_text',
                  defaultMessage: 'Sản phẩm sẽ bị ẩn khỏi trang chủ!'
               })
         })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({
            id: 'body_admin.product_management.detail_product.toggle_security_confirm_text',
            defaultMessage: 'Sản phẩm'
         })}: <strong style="color: #dc2626;">${product.nameProduct || intl.formatMessage({
            id: 'body_admin.product_management.detail_product.no_name',
            defaultMessage: intl.formatMessage({
               id: 'body_admin.product_management.detail_product.no_name',
               defaultMessage: 'Không có tên sản phẩm'
            })
         })}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({
            id: 'body_admin.product_management.detail_product.toggle_security_type_exact',
            defaultMessage: 'Nhập chính xác cụm từ'
         })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${actionTextUpper} SẢN PHẨM</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({
            id: 'body_admin.product_management.detail_product.toggle_security_placeholder',
            defaultMessage: 'Nhập cụm từ xác nhận...'
         }),
         icon: newActiveStatus ? 'success' : 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({
            id: 'body_admin.product_management.detail_product.toggle_security_continue',
            defaultMessage: `Tiếp tục ${actionText}`
         }),
         cancelButtonText: intl.formatMessage({
            id: 'body_admin.product_management.detail_product.cancel_button',
            defaultMessage: 'Hủy'
         }),
         inputValidator: (value) => {
            const expectedPhrase = `${actionTextUpper} SẢN PHẨM`;
            if (value !== expectedPhrase) {
               return intl.formatMessage({
                  id: 'body_admin.product_management.detail_product.toggle_security_error',
                  defaultMessage: intl.formatMessage({
                     id: 'body_admin.product_management.detail_product.toggle_security_error_message',
                     defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.'
                  })
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
         const result = await getActiveProducts(product.id, newActiveStatus);

         if (result.errCode === 0) {
            setProduct({ ...product, isActive: newActiveStatus });
            showToast('success',
               result.errMessage || intl.formatMessage({
                  id: `body_admin.product_management.detail_product.${newActiveStatus ? 'activated' : 'deactivated'}`,
                  defaultMessage: newActiveStatus ? intl.formatMessage({
                     id: 'body_admin.product_management.detail_product.activated',
                     defaultMessage: 'Hiện sản phẩm thành công'
                  }) : intl.formatMessage({
                     id: 'body_admin.product_management.detail_product.deactivated',
                     defaultMessage: 'Ẩn sản phẩm thành công'
                  })
               })
            );
         } else {
            showToast('error', result.errMessage || intl.formatMessage({
               id: `body_admin.product_management.detail_product.toggle_failed`,
               defaultMessage: newActiveStatus ? intl.formatMessage({
                  id: 'body_admin.product_management.detail_product.activated_failed',
                  defaultMessage: 'Hiện sản phẩm thất bại'
               }) : intl.formatMessage({
                  id: 'body_admin.product_management.detail_product.deactivated_failed',
                  defaultMessage: 'Ẩn sản phẩm thất bại'
               })
            }));
         }
      } catch (error) {
         console.error('Toggle active error:', error);
         showToast('error', intl.formatMessage({
            id: 'body_admin.product_management.detail_product.toggle_error',
            defaultMessage: intl.formatMessage({
               id: 'body_admin.product_management.detail_product.toggle_error',
               defaultMessage: 'Có lỗi xảy ra khi cập nhật trạng thái'
            })
         }));
      } finally {
         setIsUpdating(false);
      }
   };

   const handleDelete = async () => {
      if (!product || !product.id) {
         showToast('error', intl.formatMessage({
            id: 'body_admin.product_management.delete_product.not_found',
            defaultMessage: 'Sản phẩm không được tìm thấy'
         }));
         return;
      }

      if (product.isActive) {
         showToast('error', intl.formatMessage({
            id: 'body_admin.product_management.delete_product.blocked_active',
            defaultMessage: 'Không thể xóa sản phẩm đang hoạt động'
         }));
         return;
      }

      // Step 1: Basic confirmation
      const confirmFirst = await Swal.fire({
         title: intl.formatMessage({
            id: 'body_admin.product_management.delete_product.confirm_title_1',
            defaultMessage: 'Xác nhận xóa sản phẩm'
         }),
         html: `<strong>${product.nameProduct || intl.formatMessage({
            id: 'body_admin.product_management.delete_product.no_name',
            defaultMessage: 'Không có tên sản phẩm'
         })}</strong><br>ID: ${product.id}`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({
            id: 'body_admin.product_management.delete_product.confirm_button_1',
            defaultMessage: 'Tiếp tục'
         }),
         cancelButtonText: intl.formatMessage({
            id: 'body_admin.product_management.delete_product.cancel_button',
            defaultMessage: 'Hủy'
         })
      });

      if (!confirmFirst.isConfirmed) return;

      // Step 2: Second confirmation
      const confirmSecond = await Swal.fire({
         title: intl.formatMessage({
            id: 'body_admin.product_management.delete_product.confirm_title_2',
            defaultMessage: 'Bạn chắc chắn muốn xóa?'
         }),
         text: intl.formatMessage({
            id: 'body_admin.product_management.delete_product.confirm_text_2',
            defaultMessage: 'Hành động này không thể hoàn tác!'
         }),
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({
            id: 'body_admin.product_management.delete_product.confirm_button_2',
            defaultMessage: 'Xóa'
         }),
         cancelButtonText: intl.formatMessage({
            id: 'body_admin.product_management.delete_product.cancel_button',
            defaultMessage: 'Hủy'
         })
      });

      if (!confirmSecond.isConfirmed) return;

      // Step 3: Text confirmation - Type exact phrase
      const confirmText = await Swal.fire({
         title: intl.formatMessage({
            id: 'body_admin.product_management.delete_product.security_title',
            defaultMessage: 'Xác nhận bảo mật'
         }),
         html: `
            <div style="text-align: left; margin: 20px 0;">
               <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                  ${intl.formatMessage({
            id: 'body_admin.product_management.delete_product.security_warning',
            defaultMessage: 'Cảnh báo: Hành động này sẽ xóa vĩnh viễn sản phẩm!'
         })}
               </p>
               <p style="margin-bottom: 10px; color: #374151;">
                  ${intl.formatMessage({
            id: 'body_admin.product_management.delete_product.security_confirm_text',
            defaultMessage: 'Sản phẩm cần xóa'
         })}: <strong style="color: #dc2626;">${product.nameProduct || intl.formatMessage({
            id: 'body_admin.product_management.delete_product.no_name',
            defaultMessage: 'Không có tên sản phẩm'
         })}</strong>
               </p>
               <p style="margin-bottom: 15px; color: #374151;">
                  ${intl.formatMessage({
            id: 'body_admin.product_management.delete_product.security_type_exact',
            defaultMessage: 'Nhập chính xác cụm từ'
         })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">${intl.formatMessage({
            id: 'body_admin.product_management.delete_product.security_phrase',
            defaultMessage: 'XÓA SẢN PHẨM'
         })}</code>
               </p>
            </div>
         `,
         input: 'text',
         inputPlaceholder: intl.formatMessage({
            id: 'body_admin.product_management.delete_product.security_placeholder',
            defaultMessage: 'Nhập cụm từ xác nhận...'
         }),
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: intl.formatMessage({
            id: 'body_admin.product_management.delete_product.security_continue',
            defaultMessage: 'Tiếp tục xóa'
         }),
         cancelButtonText: intl.formatMessage({
            id: 'body_admin.product_management.delete_product.cancel_button',
            defaultMessage: 'Hủy'
         }),
         inputValidator: (value) => {
            const expectedPhrase = intl.formatMessage({
               id: 'body_admin.product_management.delete_product.security_phrase',
               defaultMessage: 'XÓA SẢN PHẨM'
            });
            if (value !== expectedPhrase) {
               return intl.formatMessage({
                  id: 'body_admin.product_management.delete_product.security_error',
                  defaultMessage: 'Cụm từ không chính xác. Vui lòng nhập đúng cụm từ được yêu cầu.'
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
         const result = await deleteProduct(product.id);

         if (result.errCode === 0) {
            showToast('success',
               result.errMessage || intl.formatMessage({
                  id: 'body_admin.product_management.delete_product.success',
                  defaultMessage: 'Xóa sản phẩm thành công'
               })
            );
            setTimeout(() => navigate('/admin/product-category-management/product-management'), 1500);
         } else {
            showToast('error', result.errMessage || intl.formatMessage({
               id: 'body_admin.product_management.delete_product.failed',
               defaultMessage: 'Xóa sản phẩm thất bại'
            }));
         }
      } catch (error) {
         console.error('Delete product error:', error);
         showToast('error', error.response?.data?.errMessage || intl.formatMessage({
            id: 'body_admin.product_management.delete_product.error',
            defaultMessage: 'Lỗi khi xóa sản phẩm'
         }));
      } finally {
         setIsUpdating(false);
      }
   };

   const handleManageCategories = () => {
      navigate(`/admin/product-category-management/product-management/info-category/${id}`);
   };

   const handleCategoryClick = (categoryId) => {
      if (!categoryId) return;

      navigate(`/admin/product-category-management/category-management/category-detail/${categoryId}`);
   };


   if (loading) {
      return (
         <div className="product-detail-container">
            <div className="loading-state">
               <div className="loading-spinner"></div>
               <p><FormattedMessage id="body_admin.product_management.detail_product.loading" defaultMessage="Đang tải thông tin sản phẩm..." /></p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="product-detail-container">
            <div className="error-state">
               <div className="error-icon">❌</div>
               <h2><FormattedMessage id="body_admin.product_management.detail_product.error_title" defaultMessage="Lỗi tải dữ liệu" /></h2>
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

   if (!product) {
      return (
         <div className="product-detail-container">
            <div className="error-state">
               <div className="error-icon">❓</div>
               <h2><FormattedMessage id="body_admin.product_management.detail_product.not_found_title" defaultMessage="Không tìm thấy sản phẩm" /></h2>
               <p><FormattedMessage id="product.detail.not_found" defaultMessage="Sản phẩm không tồn tại hoặc đã bị xóa" /></p>
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

   return (
      <div className="product-detail-container">
         <div className="product-detail-title">
            <FormattedMessage id="body_admin.product_management.detail_product.title" defaultMessage="Thông tin sản phẩm" />
         </div>

         <div className="product-detail-card">

            <div className="card-header">
               <div className='product-detail-header-title'>
                  <FormattedMessage id="body_admin.product_management.detail_product.name" defaultMessage="Tên sản phẩm" />:
               </div>
               <h2>{product.nameProduct || intl.formatMessage({ id: 'body_admin.product_management.detail_product.no_name', defaultMessage: 'Không có tên sản phẩm' })}</h2>
               <div className="product-id">ID: {product.id}</div>
            </div>

            <div className="card-body">
               <div className="detail-grid">
                  <div className="detail-section">
                     <h3 className="basic-info"><FormattedMessage id="body_admin.product_management.detail_product.basic_info" defaultMessage="Thông tin cơ bản" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.name" defaultMessage="Tên sản phẩm" />:</span>
                        <span className="value">{product.nameProduct || intl.formatMessage({ id: 'body_admin.product_management.detail_product.empty', defaultMessage: 'Không có' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.description" defaultMessage="Mô tả" />:</span>
                        <span className="value">
                           {product.description ? (
                              <span
                                 className="description-link"
                                 onClick={toggleDescriptionModal}
                                 title={intl.formatMessage({ id: 'body_admin.product_management.detail_product.description_tooltip', defaultMessage: 'Click để xem mô tả đầy đủ' })}
                              >
                                 <FormattedMessage id="body_admin.product_management.detail_product.view_description" defaultMessage="Xem!" />
                              </span>
                           ) : (
                              intl.formatMessage({ id: 'body_admin.product_management.detail_product.empty', defaultMessage: 'Không có' })
                           )}
                        </span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.dimensions" defaultMessage="Kích thước" />:</span>
                        <span className="value">{product.dimensions || intl.formatMessage({ id: 'body_admin.product_management.detail_product.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                  </div>

                  <div className="detail-section">
                     <h3 className="pricing"><FormattedMessage id="body_admin.product_management.detail_product.pricing" defaultMessage="Thông tin giá" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.price" defaultMessage="Giá" />:</span>
                        <span className="value price">{product.price ? `${product.price.toLocaleString()} VNĐ` : intl.formatMessage({ id: 'body_admin.product_management.detail_product.empty', defaultMessage: 'Không có' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.discountPrice" defaultMessage="Giá khuyến mãi" />:</span>
                        <span className="value discount-price">{product.discountPrice ? `${product.discountPrice.toLocaleString()} VNĐ` : intl.formatMessage({ id: 'body_admin.product_management.detail_product.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                  </div>

                  <div className="detail-section">
                     <h3 className="inventory"><FormattedMessage id="body_admin.product_management.detail_product.inventory" defaultMessage="Tồn kho" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.stock" defaultMessage="Số lượng tồn kho" />:</span>
                        <span className="value stock">{product.stock || intl.formatMessage({ id: 'body_admin.product_management.detail_product.out_of_stock', defaultMessage: 'Hết hàng' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.saleQuantity" defaultMessage="Số lượng đơn vị bán" />:</span>
                        <span className="value unit">{product.saleQuantity || 1} {intl.formatMessage({ id: 'body_admin.product_management.detail_product.unit', defaultMessage: 'cái' })}<span className="unit-text"><FormattedMessage id="body_admin.product_management.detail_product.unit_text" defaultMessage="/1 số lượng mua" /></span></span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.isActive" defaultMessage="Trạng thái" />:</span>
                        <span className="value">
                           <span className={`badge ${product.isActive ? 'active' : 'inactive'}`}>
                              {product.isActive ? intl.formatMessage({ id: 'body_admin.product_management.detail_product.active', defaultMessage: 'Đang hiển thị' }) : intl.formatMessage({ id: 'body_admin.product_management.detail_product.inactive', defaultMessage: 'Đã ẩn' })}
                           </span>
                        </span>
                     </div>
                  </div>

                  <div className="detail-section">
                     <h3 className="features"><FormattedMessage id="body_admin.product_management.detail_product.features" defaultMessage="Đặc điểm" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.isNew" defaultMessage="Sản phẩm mới" />:</span>
                        <span className="value">
                           <span className={`badge ${product.isNew ? 'new' : 'inactive'}`}>
                              {product.isNew ? intl.formatMessage({ id: 'body_admin.product_management.detail_product.yes', defaultMessage: 'Có' }) : intl.formatMessage({ id: 'body_admin.product_management.detail_product.no', defaultMessage: 'Không' })}
                           </span>
                        </span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.isBestSeller" defaultMessage="Bán chạy" />:</span>
                        <span className="value">
                           <span className={`badge ${product.isBestSeller ? 'bestseller' : 'inactive'}`}>
                              {product.isBestSeller ? intl.formatMessage({ id: 'body_admin.product_management.detail_product.yes', defaultMessage: 'Có' }) : intl.formatMessage({ id: 'body_admin.product_management.detail_product.no', defaultMessage: 'Không' })}
                           </span>
                        </span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.createdAt" defaultMessage="Ngày tạo" />:</span>
                        <span className="value">{product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}</span>
                     </div>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.updatedAt" defaultMessage="Ngày cập nhật" />:</span>
                        <span className="value">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('vi-VN') : intl.formatMessage({ id: 'product.detail.empty', defaultMessage: 'Không có' })}</span>
                     </div>
                  </div>

                  <div className="detail-section">
                     <h3 className="categories"><FormattedMessage id="body_admin.product_management.detail_product.categories" defaultMessage="Danh mục" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.in_categories" defaultMessage="Có trong danh mục" />:</span>
                        <span className="value categories-value">
                           {(() => {
                              const categoriesData = product.categories || product.ProductCategories || product.CategoryProducts || [];

                              if (categoriesData && categoriesData.length > 0) {
                                 return (
                                    <div className="categories-info">
                                       <span className="badge category-count">
                                          {categoriesData.length} <FormattedMessage id="body_admin.product_management.detail_product.categories_count" defaultMessage="danh mục" />
                                       </span>
                                       <div className="categories-list">
                                          {categoriesData.map((item, index) => {
                                             const categoryId = item.id || item.category?.id || item.Category?.id;
                                             const categoryName = item.nameCategory ||
                                                item.category?.nameCategory ||
                                                item.name ||
                                                item.Category?.nameCategory ||
                                                intl.formatMessage({ id: 'body_admin.product_management.detail_product.unknown_category', defaultMessage: 'Sản phẩm không có danh mục' });

                                             return (
                                                <span
                                                   key={index}
                                                   className="badge category-name clickable"
                                                   onClick={() => handleCategoryClick(categoryId)}
                                                   title="Nhấp để xem chi tiết danh mục"
                                                >
                                                   {categoryName}
                                                </span>
                                             );
                                          })}
                                       </div>
                                    </div>
                                 );
                              } else {
                                 return (
                                    <span className="badge inactive">
                                       <FormattedMessage id="body_admin.product_management.detail_product.no_categories" defaultMessage="Không có danh mục" />
                                    </span>
                                 );
                              }
                           })()}
                        </span>
                     </div>
                  </div>

                  <div className="detail-section">
                     <h3 className="images"><FormattedMessage id="body_admin.product_management.detail_product.images" defaultMessage="Hình ảnh" /></h3>

                     <div className="detail-item">
                        <button
                           className="btn-manage-images"
                           onClick={() => navigate(`/admin/product-category-management/product-management/product-images/${product.id}`)}
                        >
                           <FormattedMessage id="body_admin.product_management.detail_product.manage_images" defaultMessage="Quản lý hình ảnh" />
                        </button>
                     </div>
                  </div>

                  <div className="detail-section">
                     <h3 className="product-statistics"><FormattedMessage id="body_admin.product_management.detail_product.product_statistics" defaultMessage="Thống kê sản phẩm" /></h3>

                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.products_out" defaultMessage="Bán ra" />:</span>
                     </div>
                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.products_out_date" defaultMessage="Ngày bán ra" />:</span>
                     </div>
                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.products_in" defaultMessage="Nhập vào" />:</span>
                     </div>
                     <div className="detail-item">
                        <span className="label"><FormattedMessage id="body_admin.product_management.detail_product.products_in_date" defaultMessage="Ngày nhập vào" />:</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="card-footer">
               <div className="action-buttons">
                  <button
                     className={`btn-action ${product.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                     onClick={handleToggleActive}
                     disabled={isUpdating}
                  >
                     {product.isActive ? (
                        <FormattedMessage id="body_admin.product_management.detail_product.hide_product" defaultMessage="Ẩn sản phẩm" />
                     ) : (
                        <FormattedMessage id="body_admin.product_management.detail_product.show_product" defaultMessage="Hiện sản phẩm" />
                     )}
                  </button>

                  <button
                     className="btn-action btn-add-category"
                     onClick={handleManageCategories}
                     disabled={isUpdating}
                  >
                     <FormattedMessage id="body_admin.product_management.detail_product.manage_categories" defaultMessage="Quản lý danh mục" />
                  </button>

                  <button
                     className="btn-action btn-delete"
                     onClick={handleDelete}
                     disabled={isUpdating}
                  >
                     <FormattedMessage id="body_admin.product_management.detail_product.delete_product" defaultMessage="Xóa sản phẩm" />
                  </button>

                  <button
                     className="btn-action btn-update"
                     onClick={handleEdit}
                     disabled={isUpdating}
                  >
                     <FormattedMessage id="body_admin.product_management.detail_product.edit_button" defaultMessage="Cập nhật sản phẩm" />
                  </button>

                  <button
                     className="btn-action btn-back"
                     onClick={() => navigate(-1)}
                     disabled={isUpdating}
                  >
                     <FormattedMessage id="body_admin.product_management.detail_product.back_button" defaultMessage="Quay lại" />
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
                              id="body_admin.product_management.detail_product.title_description"
                              defaultMessage="Mô tả sản phẩm"
                           />
                        </h3>
                        <button className="close-btn" onClick={toggleDescriptionModal}>
                           ×
                        </button>
                     </div>
                     <div className="modal-body">
                        <div className="description-content">
                           {product.description || intl.formatMessage({
                              id: 'body_admin.product_management.detail_product.no_description',
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

export default ProductDetail;