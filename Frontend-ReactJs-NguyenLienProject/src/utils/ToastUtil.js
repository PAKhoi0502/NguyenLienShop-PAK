import { toast } from 'react-hot-toast';
import axios from 'axios';
import CustomToast from '../components/CustomToast';

const TYPE_SUCCESS = 'SUCCESS';
const TYPE_INFO = 'INFO';
const TYPE_WARN = 'WARN';
const TYPE_ERROR = 'ERROR';

const ToastUtil = {
    success(title, message, autoCloseDelay = 3000) {
        this.show(TYPE_SUCCESS, title, message, false, autoCloseDelay);
    },

    info(title, message, autoCloseDelay = 3000) {
        this.show(TYPE_INFO, title, message, false, autoCloseDelay);
    },

    warn(title, message, autoCloseDelay = 3000) {
        this.show(TYPE_WARN, title, message, false, autoCloseDelay);
    },

    error(title, message, autoCloseDelay = 3000) {
        this.show(TYPE_ERROR, title, message, false, autoCloseDelay);
    },

    successRaw(title, message, autoCloseDelay = 3000) {
        this.show(TYPE_SUCCESS, title, message, true, autoCloseDelay);
    },

    errorRaw(title, message, autoCloseDelay = 3000) {
        this.show(TYPE_ERROR, title, message, true, autoCloseDelay);
    },

    errorApi(error, title = 'common.fail-to-load-data', autoCloseDelay = 3000) {
        if (axios.isCancel(error)) {
            return;
        }
        let message = null;
        let messageId = 'common.unknown-error';
        const code = error?.httpStatusCode || error?.response?.status;
        if (code >= 500) {
            messageId = 'common.internal-server-error';
        } else if (code < 500 && code >= 400) {
            if (code === 400) {
                messageId = 'common.bad-request';
            } else if (code === 403) {
                messageId = 'common.forbidden-request';
            }
        } else {
            if (error?.errorMessage) {
                message = error.errorMessage;
            }
        }
        toast.custom(
            (t) => (
                <CustomToast
                    t={t}
                    titleId={title}
                    message={message}
                    messageId={messageId}
                    time={new Date()}
                />
            ),
            {
                duration: autoCloseDelay,
                position: 'bottom-right',
            }
        );
    },

    show(type, title, message, rawMessage = false, autoCloseDelay = 3000) {
        toast.custom(
            (t) => (
                <CustomToast
                    t={t}
                    titleId={title}
                    messageId={rawMessage ? null : message}
                    message={rawMessage ? message : null}
                    time={new Date()}
                />
            ),
            {
                duration: autoCloseDelay,
                position: 'bottom-right',
                style: {
                    background: type === TYPE_SUCCESS ? '#28a745' : type === TYPE_INFO ? '#17a2b8' : type === TYPE_WARN ? '#ffc107' : '#dc3545',
                    color: '#fff',
                },
            }
        );
    },
};

export default ToastUtil;