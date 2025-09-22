/**
 * Comprehensive Vietnamese Phone Number Validator
 * Validates phone numbers according to official Vietnamese network prefixes
 */

// Define network prefixes according to Vietnamese carriers
const NETWORK_PREFIXES = {
    // Viettel
    viettel: [
        '032', '033', '034', '035', '036', '037', '038', '039', // New prefixes
        '086', '096', '097', '098' // Old/other prefixes
    ],
    // VinaPhone (VNPT)
    vinaphone: [
        '081', '082', '083', '084', '085', // New prefixes
        '088', '091', '094' // Old prefixes
    ],
    // MobiFone
    mobifone: [
        '070', '076', '077', '078', '079', // New prefixes
        '089', '090', '093' // Old prefixes
    ],
    // Vietnamobile
    vietnamobile: [
        '052', '056', '058', '092' // All prefixes
    ],
    // Gmobile (formerly Beeline/Gtel)
    gmobile: [
        '059', '099' // All prefixes
    ]
};

/**
 * Validates Vietnamese phone number format and network prefix
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - True if valid Vietnamese phone number
 */
export const validateVietnamesePhone = (phoneNumber) => {
    // Remove any non-digit characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Must be exactly 10 digits and start with 0
    if (!/^0\d{9}$/.test(cleanPhone)) {
        return false;
    }

    // Get first 3 digits after 0 (prefix)
    const prefix = cleanPhone.substring(0, 3);

    // Get all valid prefixes from all networks
    const allValidPrefixes = [
        ...NETWORK_PREFIXES.viettel,
        ...NETWORK_PREFIXES.vinaphone,
        ...NETWORK_PREFIXES.mobifone,
        ...NETWORK_PREFIXES.vietnamobile,
        ...NETWORK_PREFIXES.gmobile
    ];

    return allValidPrefixes.includes(prefix);
};

/**
 * Gets the network name for a given phone number
 * @param {string} phoneNumber - Phone number to check
 * @returns {string|null} - Network name or null if invalid
 */
export const getNetworkName = (phoneNumber) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (!/^0\d{9}$/.test(cleanPhone)) {
        return null;
    }

    const prefix = cleanPhone.substring(0, 3);

    for (const [network, prefixes] of Object.entries(NETWORK_PREFIXES)) {
        if (prefixes.includes(prefix)) {
            // Return formatted network name
            switch (network) {
                case 'viettel': return 'Viettel';
                case 'vinaphone': return 'VinaPhone';
                case 'mobifone': return 'MobiFone';
                case 'vietnamobile': return 'Vietnamobile';
                case 'gmobile': return 'Gmobile';
                default: return network.charAt(0).toUpperCase() + network.slice(1);
            }
        }
    }

    return null;
};

/**
 * Gets detailed phone number information
 * @param {string} phoneNumber - Phone number to analyze
 * @returns {object} - Object containing validation result, network, and formatted number
 */
export const getPhoneNumberInfo = (phoneNumber) => {
    const isValid = validateVietnamesePhone(phoneNumber);
    const network = getNetworkName(phoneNumber);
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    return {
        isValid,
        network,
        cleanNumber: cleanPhone,
        formattedNumber: isValid ? cleanPhone.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3') : null,
        errorMessage: isValid ? null : network
            ? `Số điện thoại ${network} không hợp lệ. Vui lòng kiểm tra lại.`
            : 'Số điện thoại không hợp lệ. Chỉ hỗ trợ các mạng: Viettel, VinaPhone, MobiFone, Vietnamobile, Gmobile với đầu số chính thức.'
    };
};

/**
 * Format phone number for display (adds spaces)
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} - Formatted phone number or original if invalid
 */
export const formatPhoneNumber = (phoneNumber) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (!/^0\d{9}$/.test(cleanPhone)) {
        return phoneNumber; // Return original if invalid format
    }

    return cleanPhone.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
};

/**
 * Get all supported network prefixes (for documentation/help)
 * @returns {object} - Object with network names and their prefixes
 */
export const getSupportedNetworks = () => {
    return {
        'Viettel': NETWORK_PREFIXES.viettel,
        'VinaPhone (VNPT)': NETWORK_PREFIXES.vinaphone,
        'MobiFone': NETWORK_PREFIXES.mobifone,
        'Vietnamobile': NETWORK_PREFIXES.vietnamobile,
        'Gmobile': NETWORK_PREFIXES.gmobile
    };
};

const phoneValidator = {
    validateVietnamesePhone,
    getNetworkName,
    getPhoneNumberInfo,
    formatPhoneNumber,
    getSupportedNetworks
};

export default phoneValidator;