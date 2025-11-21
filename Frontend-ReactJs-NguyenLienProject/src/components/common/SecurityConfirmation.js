import Swal from 'sweetalert2';
import './SecurityConfirmation.scss';

/**
 * Hiển thị dialog xác nhận bảo mật với text input
 * @param {Object} options - Các tùy chọn cho dialog
 * @param {Function} options.intl - useIntl hook từ react-intl
 * @param {string} options.titleId - ID của translation cho title
 * @param {string} options.warningId - ID của translation cho warning message
 * @param {string} options.confirmTextId - ID của translation cho confirm text
 * @param {string} options.confirmValue - Giá trị hiển thị trong confirm text (ví dụ: userName, productName)
 * @param {string} options.noValueId - ID của translation khi không có giá trị
 * @param {string} options.typeExactId - ID của translation cho "Nhập chính xác cụm từ"
 * @param {string} options.phraseId - ID của translation cho security phrase
 * @param {string} options.placeholderId - ID của translation cho input placeholder
 * @param {string} options.continueId - ID của translation cho continue button
 * @param {string} options.cancelId - ID của translation cho cancel button
 * @param {string} options.errorId - ID của translation cho error message
 * @param {string} options.copiedId - ID của translation cho "Copied!" message
 * @param {string} options.copyButtonId - ID của translation cho copy button
 * @param {string} [options.icon='warning'] - Icon của dialog
 * @param {string} [options.customClass='swal-security-confirmation'] - Custom class cho popup
 * @returns {Promise} Promise từ Swal.fire
 */
export const showSecurityConfirmation = async (options) => {
    const {
        intl,
        titleId,
        warningId,
        confirmTextId,
        confirmValue,
        noValueId,
        typeExactId,
        phraseId,
        placeholderId,
        continueId,
        cancelId,
        errorId,
        copiedId,
        copyButtonId,
        icon = 'warning',
        customClass = 'swal-security-confirmation'
    } = options;

    const expectedPhrase = intl.formatMessage({ id: phraseId });
    const title = intl.formatMessage({ id: titleId });
    const warning = intl.formatMessage({ id: warningId });
    const confirmText = intl.formatMessage({ id: confirmTextId });
    const noValue = intl.formatMessage({ id: noValueId });
    const typeExact = intl.formatMessage({ id: typeExactId });
    const placeholder = intl.formatMessage({ id: placeholderId });
    const continueText = intl.formatMessage({ id: continueId });
    const cancelText = intl.formatMessage({ id: cancelId });
    const errorText = intl.formatMessage({ id: errorId });
    const copiedText = intl.formatMessage({ id: copiedId });
    const copyButtonText = intl.formatMessage({ id: copyButtonId });

    return await Swal.fire({
        title,
        html: `
         <div class="security-confirmation-content">
            <p class="security-confirmation__warning">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
               ${warning}
            </p>
            <p class="security-confirmation__confirm-text">
               ${confirmText}:
               <strong class="security-confirmation__confirm-value">
                  ${confirmValue || noValue}
               </strong>
            </p>
            <p class="security-confirmation__type-exact">
               ${typeExact}: 
               <code class="security-confirmation__phrase" id="securityPhrase">
                  ${expectedPhrase}
               </code>
               <button type="button" class="security-confirmation__copy-btn" id="copySecurityBtn">
                  ${copyButtonText}
               </button>
            </p>
         </div>
      `,
        input: 'text',
        inputPlaceholder: placeholder,
        icon,
        showCancelButton: true,
        confirmButtonText: continueText,
        cancelButtonText: cancelText,
        inputValidator: (value) => {
            if (value !== expectedPhrase) {
                return errorText;
            }
        },
        customClass: {
            popup: customClass,
            input: 'swal-text-input'
        },
        didOpen: () => {
            const copyBtn = document.getElementById('copySecurityBtn');
            const securityCode = document.getElementById('securityPhrase');
            if (copyBtn && securityCode) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(securityCode.innerText);
                    copyBtn.innerText = copiedText;
                    setTimeout(() => {
                        copyBtn.innerText = copyButtonText;
                    }, 1500);
                });
            }
        }
    });
};