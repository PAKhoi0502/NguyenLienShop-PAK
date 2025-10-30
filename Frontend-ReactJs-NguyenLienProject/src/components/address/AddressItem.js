import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FaMapMarkerAlt, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import PropTypes from 'prop-types';
import './AddressItem.scss';

const AddressItem = ({ address, onEdit, onDelete, onSetDefault }) => {
    const {
        id,
        receiverName,
        receiverPhone,
        receiverGender,
        addressLine1,
        addressLine2,
        ward,
        district,
        city,
        isDefault
    } = address;

    // Format full address
    const getFullAddress = () => {
        const parts = [addressLine1];
        if (addressLine2) parts.push(addressLine2);
        if (ward) parts.push(ward);
        if (district) parts.push(district);
        if (city) parts.push(city);
        return parts.join(', ');
    };

    // Get gender display
    const getGenderDisplay = (gender) => {
        if (gender === 'M' || gender === 'male' || gender === 'Male') {
            return <FormattedMessage id="address.gender.male" defaultMessage="Anh" />;
        } else if (gender === 'F' || gender === 'female' || gender === 'Female') {
            return <FormattedMessage id="address.gender.female" defaultMessage="Chị" />;
        } else if (gender === 'O' || gender === 'other' || gender === 'Other') {
            return <FormattedMessage id="address.gender.other" defaultMessage="Khác" />;
        }
        return null;
    };

    return (
        <div className={`address-item ${isDefault ? 'address-item--default' : ''}`}>
            {/* Default Badge */}
            {isDefault && (
                <div className="address-item__badge">
                    <FaStar className="address-item__badge-icon" />
                    <FormattedMessage id="address.default" defaultMessage="Mặc định" />
                </div>
            )}

            {/* Address Content */}
            <div className="address-item__content">
                {/* Receiver Info */}
                <div className="address-item__receiver">
                    <div className="address-item__receiver-name">
                        {getGenderDisplay(receiverGender)} {receiverName}
                    </div>
                    <div className="address-item__receiver-phone">
                        <FormattedMessage id="address.phone" defaultMessage="SĐT" />: {receiverPhone}
                    </div>
                </div>

                {/* Address Details */}
                <div className="address-item__address">
                    <FaMapMarkerAlt className="address-item__address-icon" />
                    <span>{getFullAddress()}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="address-item__actions">
                {!isDefault && (
                    <button
                        className="address-item__btn address-item__btn--default"
                        onClick={() => onSetDefault(id)}
                        title="Đặt làm mặc định"
                    >
                        <FormattedMessage id="address.set_default" defaultMessage="Đặt mặc định" />
                    </button>
                )}

                <button
                    className="address-item__btn address-item__btn--edit"
                    onClick={() => onEdit(address)}
                    title="Sửa địa chỉ"
                >
                    <FaEdit />
                    <span><FormattedMessage id="common.edit" defaultMessage="Sửa" /></span>
                </button>

                <button
                    className="address-item__btn address-item__btn--delete"
                    onClick={() => onDelete(id)}
                    title="Xóa địa chỉ"
                    disabled={isDefault}
                >
                    <FaTrash />
                    <span><FormattedMessage id="common.delete" defaultMessage="Xóa" /></span>
                </button>
            </div>
        </div>
    );
};

AddressItem.propTypes = {
    address: PropTypes.shape({
        id: PropTypes.number.isRequired,
        receiverName: PropTypes.string.isRequired,
        receiverPhone: PropTypes.string.isRequired,
        receiverGender: PropTypes.string,
        addressLine1: PropTypes.string.isRequired,
        addressLine2: PropTypes.string,
        ward: PropTypes.string,
        district: PropTypes.string,
        city: PropTypes.string,
        isDefault: PropTypes.bool
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onSetDefault: PropTypes.func.isRequired
};

export default AddressItem;

