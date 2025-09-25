import React from 'react';
import { FormattedMessage } from 'react-intl';
import toast from 'react-hot-toast';
import './CustomToast.scss';

const iconByType = {
    error: <i className="fa fa-fw fa-exclamation-triangle error" />,
    success: <i className="fa fa-fw fa-check-circle success" />,
    info: <i className="fa fa-fw fa-info-circle info" />,
    warning: <i className="fa fa-fw fa-exclamation-circle warning" />,
};

const CustomToast = ({ closeToast, t, titleId, message, messageId, time, type = "error", rawMessage = false }) => {
    // Function để đóng toast - support cả react-toastify và react-hot-toast
    const handleClose = () => {
        if (t?.id) {
            // React Hot Toast
            toast.dismiss(t.id);
        } else if (closeToast) {
            // React Toastify
            closeToast();
        }
    };

    return (
        <div className={`custom-toast toast-${type}`}>
            <div className="toast-title">
                {iconByType[type]}
                <span className="toast-title-text">
                    {titleId ? <FormattedMessage id={titleId} defaultMessage={titleId} /> : "Thông báo"}
                </span>
                <CustomToastCloseButton closeToast={handleClose} />
            </div>
            <div className="toast-content">
                {message
                    ? message
                    : messageId
                        ? <FormattedMessage id={messageId} defaultMessage="Đã có lỗi xảy ra" />
                        : null
                }
            </div>
        </div>
    );
};

const CustomToastCloseButton = ({ closeToast }) => (
    <button type="button" className="toast-close" onClick={closeToast} tabIndex={-1}>
        <i className="fa fa-times" />
    </button>
);

export default CustomToast;
