import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { getAnnouncementById, updateAnnouncement, deleteAnnouncement, getAnnouncements } from '../../../../services/announcementService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';
import IconRenderer from '../../../../components/common/IconRenderer';
import './AnnouncementDetail.scss';

const AnnouncementDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const intl = useIntl();

    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);


    const showToast = useCallback((type, message) => {
        toast(
            (props) => (
                <CustomToast
                    {...props}
                    type={type}
                    titleId={type === "success" ? "body_admin.announcement_management.detail.success_title" : "body_admin.announcement_management.detail.error_title"}
                    message={message}
                    time={new Date()}
                />
            ),
            { closeButton: false, type }
        );
    }, []);

    const fetchAnnouncement = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAnnouncementById(id);

            if (res.errCode === 0) {
                const ann = res.announcement;
                setAnnouncement(ann);
            } else {
                showToast("error", res.errMessage || 'Không thể tải thông tin thông báo');
                navigate('/admin/homepage-management/announcement-management');
            }
        } catch (err) {
            console.error('Fetch announcement error:', err);
            showToast("error", 'Lỗi server khi tải thông tin thông báo');
            navigate('/admin/homepage-management/announcement-management');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, showToast]);

    const handleToggleStatus = async () => {
        if (updating) return;

        if (!announcement?.id) {
            showToast("error", intl.formatMessage({
                id: 'body_admin.announcement_management.detail.not_found',
                defaultMessage: 'Thông báo không được tìm thấy'
            }));
            return;
        }

        let formValues; // Khai báo biến để lưu dữ liệu form khi kích hoạt

        if (announcement.isActive) {
            // Logic ẩn thông báo - giống như AnnouncementActive

            const confirmFirst = await Swal.fire({
                title: intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.confirm_title_1',
                    defaultMessage: 'Xác nhận ẩn thông báo'
                }),
                html: `<strong>${announcement.title || intl.formatMessage({ id: 'body_admin.announcement_management.detail.no_title', defaultMessage: 'Không có tiêu đề' })}</strong><br>${intl.formatMessage({ id: 'body_admin.announcement_management.detail.id_label', defaultMessage: 'ID:' })} ${announcement.id}<br><br>
                       <span style="color: #f59e0b;">${intl.formatMessage({ id: 'body_admin.announcement_management.detail.warning_message', defaultMessage: '⚠️ Thông báo sẽ không hiển thị trên giao diện người dùng' })}</span>
                       <br><br><span style="color: #ef4444; font-weight: bold;">${intl.formatMessage({ id: 'body_admin.announcement_management.detail.priority_expiry_delete_warning', defaultMessage: '⚠️ CẢNH BÁO: Khi ẩn đi, độ ưu tiên và thời gian hết hạn sẽ bị xóa và cần thiết lập lại khi hiển thị.' })}</span>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.confirm_button_1',
                    defaultMessage: 'Xác nhận ẩn'
                }),
                cancelButtonText: intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.cancel_button',
                    defaultMessage: 'Hủy'
                }),
                confirmButtonColor: '#f59e0b',
                cancelButtonColor: '#6b7280'
            });

            if (!confirmFirst.isConfirmed) return;

            const confirmSecond = await Swal.fire({
                title: intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.confirm_title_2',
                    defaultMessage: 'Lần xác nhận cuối'
                }),
                html: `${intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.confirm_text_2',
                    defaultMessage: 'Bạn có chắc chắn muốn ẩn thông báo này không?'
                })}
                <br><br><span style="color: #ef4444; font-weight: bold;">${intl.formatMessage({ id: 'body_admin.announcement_management.detail.priority_expiry_warning', defaultMessage: 'Độ ưu tiên và thời gian hết hạn hiện tại sẽ bị xóa!' })}</span>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.confirm_button_2',
                    defaultMessage: 'Có, ẩn thông báo'
                }),
                cancelButtonText: intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.cancel_button',
                    defaultMessage: 'Hủy'
                }),
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280'
            });

            if (!confirmSecond.isConfirmed) return;
        } else {
            // Logic hiện thông báo - yêu cầu nhập priority và endDate
            const result = await Swal.fire({
                title: intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.confirm_title_1',
                    defaultMessage: 'Xác nhận kích hoạt thông báo'
                }),
                html: `<strong>${announcement.title || intl.formatMessage({ id: 'body_admin.announcement_management.detail.no_title', defaultMessage: 'Không có tiêu đề' })}</strong><br>${intl.formatMessage({ id: 'body_admin.announcement_management.detail.id_label', defaultMessage: 'ID:' })} ${announcement.id}<br><br>
                       <div style="text-align: left; margin: 15px 0;">
                           <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                               ${intl.formatMessage({ id: 'body_admin.announcement_management.detail.priority_label', defaultMessage: 'Độ ưu tiên' })} ${intl.formatMessage({ id: 'body_admin.announcement_management.detail.priority_range', defaultMessage: '(1-10):' })}
                           </label>
                           <input id="priority" type="number" min="1" max="10" step="1" placeholder="${intl.formatMessage({ id: 'body_admin.announcement_management.activate.priority_placeholder', defaultMessage: 'Nhập số từ 1-10' })}" 
                                  style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;"
                                  value="${announcement.priority || 1}">
                           <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                               ${intl.formatMessage({ id: 'body_admin.announcement_management.detail.expiry_date_label', defaultMessage: 'Thời gian hết hạn' })} ${intl.formatMessage({ id: 'body_admin.announcement_management.detail.expiry_date_optional', defaultMessage: '(tùy chọn):' })}
                           </label>
                           <input id="expiryDate" type="datetime-local" 
                                  style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                           <small style="color: #666; font-size: 0.85em; margin-top: 5px; display: block;">
                               ${intl.formatMessage({ id: 'body_admin.announcement_management.detail.expiry_date_help', defaultMessage: 'Để trống nếu muốn hiển thị vĩnh viễn' })}
                           </small>
                    </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.confirm_button_1',
                    defaultMessage: 'Kích hoạt thông báo'
                }),
                cancelButtonText: intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.cancel_button',
                    defaultMessage: 'Hủy'
                }),
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280',
                preConfirm: async () => {
                    const priority = document.getElementById('priority').value;
                    const expiryDate = document.getElementById('expiryDate').value;

                    if (!priority || priority < 1 || priority > 10) {
                        Swal.showValidationMessage(intl.formatMessage({
                            id: 'body_admin.announcement_management.detail.priority_invalid',
                            defaultMessage: 'Độ ưu tiên phải từ 1-10'
                        }));
                        return false;
                    }

                    // Kiểm tra expiry date không được ở quá khứ
                    if (expiryDate) {
                        const selectedDate = new Date(expiryDate);
                        const currentDate = new Date();
                        if (selectedDate <= currentDate) {
                            Swal.showValidationMessage(intl.formatMessage({
                                id: 'body_admin.announcement_management.detail.expiry_date_past',
                                defaultMessage: 'Thời gian hết hạn không được ở quá khứ'
                            }));
                            return false;
                        }
                    }

                    // Kiểm tra duplicate priority
                    try {
                        const activeAnnouncements = await getAnnouncements();
                        if (activeAnnouncements.errCode === 0) {
                            const activeList = activeAnnouncements.announcements.filter(ann => ann.isActive);
                            if (activeList.some(ann => ann.priority === parseInt(priority))) {
                                Swal.showValidationMessage(intl.formatMessage({
                                    id: 'body_admin.announcement_management.detail.priority_duplicate',
                                    defaultMessage: 'Độ ưu tiên này đã được sử dụng bởi thông báo khác'
                                }));
                                return false;
                            }
                        }
                    } catch (error) {
                        Swal.showValidationMessage(intl.formatMessage({
                            id: 'body_admin.announcement_management.detail.priority_error',
                            defaultMessage: 'Lỗi khi kiểm tra độ ưu tiên'
                        }));
                        return false;
                    }

                    return {
                        priority: parseInt(priority),
                        endDate: expiryDate ? new Date(expiryDate).toISOString() : null
                    };
                }
            });

            formValues = result.value;
            if (!formValues) return;
        }

        setUpdating(true);
        try {
            let res;
            if (announcement.isActive) {
                // Ẩn thông báo - xóa cả priority và endDate
                res = await updateAnnouncement(id, {
                    title: announcement.title || null,
                    content: announcement.content || null,
                    icon: announcement.icon || null,
                    priority: null,  // Xóa priority khi ẩn
                    isActive: false,
                    endDate: null   // Xóa expiry date khi ẩn
                });
            } else {
                // Hiện thông báo - sử dụng formValues từ dialog
                res = await updateAnnouncement(id, {
                    title: announcement.title || null,
                    content: announcement.content || null,
                    icon: announcement.icon || null,
                    priority: formValues.priority,
                    isActive: true,
                    endDate: formValues.endDate
                });
            }

            if (res.errCode === 0) {
                setAnnouncement(res.announcement);
                if (announcement.isActive) {
                    showToast("success", res.errMessage || intl.formatMessage({
                        id: 'body_admin.announcement_management.detail.success',
                        defaultMessage: 'Thông báo đã được ẩn thành công'
                    }) + intl.formatMessage({ id: 'body_admin.announcement_management.detail.priority_expiry_deleted_notice', defaultMessage: ' (Độ ưu tiên và thời gian hết hạn đã bị xóa)' }));
                } else {
                    showToast("success", res.errMessage || intl.formatMessage({
                        id: 'body_admin.announcement_management.detail.success',
                        defaultMessage: 'Thông báo đã được kích hoạt thành công'
                    }));
                }
            } else {
                if (announcement.isActive) {
                    showToast("error", res.errMessage || intl.formatMessage({
                        id: 'body_admin.announcement_management.detail.failed',
                        defaultMessage: 'Không thể ẩn thông báo'
                    }));
                } else {
                    showToast("error", res.errMessage || intl.formatMessage({
                        id: 'body_admin.announcement_management.detail.failed',
                        defaultMessage: 'Không thể kích hoạt thông báo'
                    }));
                }
            }
        } catch (err) {
            console.error('Toggle status error:', err);
            if (announcement.isActive) {
                showToast("error", err.errMessage || intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.error',
                    defaultMessage: 'Lỗi khi ẩn thông báo'
                }));
            } else {
                showToast("error", err.errMessage || intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.error',
                    defaultMessage: 'Lỗi khi kích hoạt thông báo'
                }));
            }
        } finally {
            setUpdating(false);
        }
    };


    const handleEdit = () => {
        if (announcement?.isActive) {
            showToast("error", intl.formatMessage({
                id: 'body_admin.announcement_management.detail.edit_blocked',
                defaultMessage: 'Không thể chỉnh sửa thông báo đang hiển thị. Vui lòng ẩn thông báo trước khi chỉnh sửa'
            }));
            return;
        }

        navigate(`/admin/homepage-management/announcement-management/announcement-update/${id}`);
    };

    const handleDelete = async () => {
        if (!announcement || !announcement.id) {
            showToast("error", intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_not_found',
                defaultMessage: 'Thông báo không được tìm thấy'
            }));
            return;
        }

        if (announcement.isActive) {
            showToast("error", intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_blocked_active',
                defaultMessage: 'Vui lòng ẩn thông báo trước khi xóa'
            }));
            return;
        }

        // Step 1: Basic confirmation
        const confirmFirst = await Swal.fire({
            title: intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_confirm_title_1',
                defaultMessage: 'Xác nhận xóa thông báo'
            }),
            html: `<strong>${announcement.title || intl.formatMessage({
                id: 'body_admin.announcement_management.detail.no_title',
                defaultMessage: 'Không có tiêu đề'
            })}</strong><br>ID: ${announcement.id}<br><br>
            <div style="color: #dc2626; font-weight: 600;">
                ${intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_warning',
                defaultMessage: 'Thông báo sẽ bị xóa vĩnh viễn và không thể khôi phục!'
            })}
            </div>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_confirm_button_1',
                defaultMessage: 'Tiếp tục'
            }),
            cancelButtonText: intl.formatMessage({
                id: 'body_admin.announcement_management.detail.cancel_button',
                defaultMessage: 'Hủy'
            })
        });

        if (!confirmFirst.isConfirmed) return;

        // Step 2: Second confirmation
        const confirmSecond = await Swal.fire({
            title: intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_confirm_title_2',
                defaultMessage: 'Bạn chắc chắn muốn xóa?'
            }),
            text: intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_confirm_text',
                defaultMessage: 'Hành động này không thể hoàn tác!'
            }),
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_confirm_button_2',
                defaultMessage: 'Xóa vĩnh viễn'
            }),
            cancelButtonText: intl.formatMessage({
                id: 'body_admin.announcement_management.detail.cancel_button',
                defaultMessage: 'Hủy'
            })
        });

        if (!confirmSecond.isConfirmed) return;

        // Step 3: Text confirmation - Type exact phrase
        const confirmText = await Swal.fire({
            title: intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_security_title',
                defaultMessage: 'Xác nhận bảo mật'
            }),
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p style="margin-bottom: 15px; color: #ef4444; font-weight: 600;">
                        ${intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_security_warning',
                defaultMessage: 'Thông báo sẽ bị xóa vĩnh viễn!'
            })}
                    </p>
                    <p style="margin-bottom: 10px; color: #374151;">
                        ${intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_security_confirm_text',
                defaultMessage: 'Thông báo'
            })}: <strong style="color: #dc2626;">${announcement.title || intl.formatMessage({
                id: 'body_admin.announcement_management.detail.no_title',
                defaultMessage: 'Không có tiêu đề'
            })}</strong>
                    </p>
                    <p style="margin-bottom: 15px; color: #374151;">
                        ${intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_security_type_exact',
                defaultMessage: 'Nhập chính xác cụm từ'
            })}: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 600;">XÓA THÔNG BÁO</code>
                    </p>
                </div>
            `,
            input: 'text',
            inputPlaceholder: intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_security_placeholder',
                defaultMessage: 'Nhập cụm từ xác nhận...'
            }),
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_security_continue',
                defaultMessage: 'Tiếp tục xóa'
            }),
            cancelButtonText: intl.formatMessage({
                id: 'body_admin.announcement_management.detail.cancel_button',
                defaultMessage: 'Hủy'
            }),
            inputValidator: (value) => {
                const expectedPhrase = 'XÓA THÔNG BÁO';
                if (value !== expectedPhrase) {
                    return intl.formatMessage({
                        id: 'body_admin.announcement_management.detail.delete_security_error',
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

        setUpdating(true);
        try {
            const res = await deleteAnnouncement(id);

            if (res.errCode === 0) {
                showToast("success", intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.delete_success',
                    defaultMessage: 'Xóa thông báo thành công'
                }));
                navigate('/admin/homepage-management/announcement-management');
            } else {
                showToast("error", res.errMessage || intl.formatMessage({
                    id: 'body_admin.announcement_management.detail.delete_failed',
                    defaultMessage: 'Xóa thông báo thất bại'
                }));
            }
        } catch (err) {
            console.error('Delete announcement error:', err);
            showToast("error", intl.formatMessage({
                id: 'body_admin.announcement_management.detail.delete_error',
                defaultMessage: 'Có lỗi xảy ra khi xóa thông báo'
            }));
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchAnnouncement();
        }
    }, [id, navigate, fetchAnnouncement]);


    const formatDate = (dateString) => {
        if (!dateString) return intl.formatMessage({ id: 'body_admin.announcement_management.detail.no_date', defaultMessage: 'Không có' });
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const isExpired = (endDate) => {
        if (!endDate) return false;
        return new Date(endDate) < new Date();
    };

    if (loading) {
        return (
            <div className="announcement-detail-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p><FormattedMessage id="body_admin.announcement_management.detail.loading" defaultMessage="Đang tải thông tin thông báo..." /></p>
                </div>
            </div>
        );
    }

    if (!announcement) {
        return (
            <div className="announcement-detail-container">
                <div className="error-state">
                    <div className="error-icon">❓</div>
                    <h2><FormattedMessage id="body_admin.announcement_management.detail.not_found_title" defaultMessage="Không tìm thấy thông báo" /></h2>
                    <p><FormattedMessage id="body_admin.announcement_management.detail.not_found" defaultMessage="Thông báo không tồn tại hoặc đã bị xóa" /></p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/admin/homepage-management/announcement-management')}
                    >
                        <FormattedMessage id="common.backToList" defaultMessage="Quay lại danh sách" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="announcement-detail-container">
            <HintBox
                content={
                    <div>
                        <p><FormattedMessage id="body_admin.announcement_management.detail.hint.title" defaultMessage="Chi tiết thông báo:" /></p>
                        <ul style={{ textAlign: 'left', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                            <li><FormattedMessage id="body_admin.announcement_management.detail.hint.view_info" defaultMessage="Xem thông tin chi tiết thông báo" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.detail.hint.edit_mode" defaultMessage="Click 'Chỉnh sửa' để cập nhật thông tin" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.detail.hint.toggle_status" defaultMessage="Sử dụng nút 'Kích hoạt/Ẩn' để thay đổi trạng thái hiển thị" /></li>
                            <li><FormattedMessage id="body_admin.announcement_management.detail.hint.priority" defaultMessage="Độ ưu tiên quyết định thứ tự hiển thị (1 = cao nhất)" /></li>
                        </ul>
                    </div>
                }
            />

            <h1>
                <FormattedMessage id="body_admin.announcement_management.detail.title" defaultMessage="Thông tin thông báo" />
            </h1>

            <div className="announcement-detail-card">
                <div className="card-header">
                    <h2>
                        <IconRenderer icon={announcement.icon || '📢'} size="0.5rem" className="mr-3" />
                        {announcement.title || intl.formatMessage({ id: 'body_admin.announcement_management.detail.no_title', defaultMessage: 'Không có tiêu đề' })}
                    </h2>
                    <div className="announcement-id">ID: {announcement.id}</div>
                </div>

                <div className="card-body">
                    <div className="detail-grid">
                        <div className="detail-section">
                            <h3 className="basic-info"><FormattedMessage id="body_admin.announcement_management.detail.basic_info" defaultMessage="Thông tin cơ bản" /></h3>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.icon" defaultMessage="Biểu tượng" />:</span>
                                <span className="value">
                                    <IconRenderer icon={announcement.icon || '📢'} size="large" />
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.title_label" defaultMessage="Tiêu đề" />:</span>
                                <span className="value">
                                    <span className="announcement-title">{announcement.title}</span>
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.content" defaultMessage="Nội dung" />:</span>
                                <span className="value description">
                                    {announcement.content || intl.formatMessage({ id: 'body_admin.announcement_management.detail.no_content', defaultMessage: 'Không có nội dung' })}
                                </span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3 className="settings-info"><FormattedMessage id="body_admin.announcement_management.detail.settings" defaultMessage="Cài đặt" /></h3>


                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.priority" defaultMessage="Độ ưu tiên" />:</span>
                                <span className="value">
                                    <span
                                        className="priority-badge"
                                        style={{
                                            backgroundColor: '#1b5829',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '50%',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            minWidth: '32px',
                                            display: 'inline-block',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {announcement.priority}
                                    </span>
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.status" defaultMessage="Trạng thái" />:</span>
                                <span className="value">
                                    <span className={`badge ${announcement.isActive ? 'active' : 'inactive'}`}>
                                        {announcement.isActive ? (
                                            <FormattedMessage id="body_admin.announcement_management.detail.status_active" defaultMessage="Đang hiển thị" />
                                        ) : (
                                            <FormattedMessage id="body_admin.announcement_management.detail.status_inactive" defaultMessage="Đã ẩn" />
                                        )}
                                    </span>
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.end_date" defaultMessage="Hết hạn" />:</span>
                                <span className="value">
                                    <span className={`end-date ${isExpired(announcement.endDate) ? 'expired' : ''}`}>
                                        {formatDate(announcement.endDate)}
                                        {isExpired(announcement.endDate) && (
                                            <span className="expired-badge"> (Đã hết hạn)</span>
                                        )}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3 className="timestamps"><FormattedMessage id="body_admin.announcement_management.detail.metadata" defaultMessage="Thông tin hệ thống" /></h3>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.created_at" defaultMessage="Ngày tạo" />:</span>
                                <span className="value">{formatDate(announcement.createdAt)}</span>
                            </div>

                            <div className="detail-item">
                                <span className="label"><FormattedMessage id="body_admin.announcement_management.detail.updated_at" defaultMessage="Cập nhật lần cuối" />:</span>
                                <span className="value">{formatDate(announcement.updatedAt)}</span>
                            </div>

                        </div>

                        <div className="detail-section">
                            <h3 className="preview-info"><FormattedMessage id="body_admin.announcement_management.detail.preview" defaultMessage="Xem trước" /></h3>

                            <div className="detail-item">
                                <span className="value">
                                    <div
                                        className="announcement-preview"
                                        style={{
                                            color: announcement.textColor || '#ffffff',
                                            padding: '16px 20px',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <strong style={{ fontSize: '1.1rem' }}>
                                            <IconRenderer
                                                icon={announcement.icon || '📢'}
                                                size="medium"
                                                className="mr-2"
                                            />
                                            {announcement.title}
                                            {announcement.content && ` - ${announcement.content}`}
                                        </strong>
                                        {announcement.endDate && (
                                            <div style={{ fontSize: '0.875rem', marginTop: '8px', opacity: 0.8 }}>
                                                <FormattedMessage
                                                    id="body_admin.announcement_management.detail.expires_on"
                                                    defaultMessage="Hết hạn: {date}"
                                                    values={{ date: formatDate(announcement.endDate) }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="action-buttons">
                        <>
                            <button
                                className={`btn-action ${announcement.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                                onClick={handleToggleStatus}
                                disabled={updating}
                            >
                                {announcement.isActive ? (
                                    <FormattedMessage id="body_admin.announcement_management.detail.hide_announcement" defaultMessage="Ẩn thông báo" />
                                ) : (
                                    <FormattedMessage id="body_admin.announcement_management.detail.show_announcement" defaultMessage="Hiện thông báo" />
                                )}
                            </button>

                            <button
                                className="btn-action btn-delete"
                                onClick={handleDelete}
                                disabled={updating}
                            >
                                <FormattedMessage id="body_admin.announcement_management.detail.delete_button" defaultMessage="Xóa thông báo" />
                            </button>

                            <button
                                className="btn-action btn-update"
                                onClick={handleEdit}
                                disabled={updating}
                            >
                                <FormattedMessage id="body_admin.announcement_management.detail.edit_button" defaultMessage="Chỉnh sửa" />
                            </button>
                        </>

                        <button className="btn-action btn-back" onClick={() => navigate('/admin/homepage-management/announcement-management')}>
                            <FormattedMessage id="body_admin.announcement_management.detail.back_button" defaultMessage="Quay lại" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetail;
