import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import './CustomToast.scss';

const iconByType = {
    error: <i className="fa fa-fw fa-exclamation-triangle error" />,
    success: <i className="fa fa-fw fa-check-circle success" />,
    info: <i className="fa fa-fw fa-info-circle info" />,
    warning: <i className="fa fa-fw fa-exclamation-circle warning" />,
};

const CustomToast = ({ closeToast, titleId, message, messageId, time, type = "error" }) => {
    const intl = useIntl();

    const formattedTime = time
        ? intl.formatDate(time, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        })
        : '';

    return (
        <div className={`custom-toast toast-${type}`}>
            <div className="toast-title">
                {time && <span className="date">{formattedTime}</span>}
                {iconByType[type]}
                <span className="toast-title-text">
                    {titleId ? <FormattedMessage id={titleId} defaultMessage={titleId} /> : "Thông báo"}
                </span>
                <CustomToastCloseButton closeToast={closeToast} />
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
