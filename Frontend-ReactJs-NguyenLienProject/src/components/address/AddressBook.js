import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import {
    getUserAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from '../../services/addressService';
import AddressItem from './AddressItem';
import AddressForm from './AddressForm';
import CustomToast from '../CustomToast';
import './AddressBook.scss';

const AddressBook = () => {
    const intl = useIntl();
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch addresses on mount
    useEffect(() => {
        fetchAddresses();
    }, []);

    // Fetch addresses from server
    const fetchAddresses = async () => {
        setIsLoading(true);
        try {
            const result = await getUserAddresses();
            if (result.errCode === 0) {
                setAddresses(result.addresses || []);
            } else {
                toast(
                    <CustomToast
                        type="error"
                        titleId="address.error.fetch_failed"
                        message={result.errMessage || intl.formatMessage({
                            id: 'address.error.fetch_failed',
                            defaultMessage: 'Không thể tải danh sách địa chỉ'
                        })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
            }
        } catch (error) {
            console.error('Fetch addresses error:', error);
            toast(
                <CustomToast
                    type="error"
                    titleId="address.error.fetch_failed"
                    message={intl.formatMessage({
                        id: 'address.error.fetch_failed',
                        defaultMessage: 'Không thể tải danh sách địa chỉ'
                    })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Open form for adding new address
    const handleAddNew = () => {
        setEditingAddress(null);
        setIsFormOpen(true);
    };

    // Open form for editing address
    const handleEdit = (address) => {
        setEditingAddress(address);
        setIsFormOpen(true);
    };

    // Close form
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingAddress(null);
    };

    // Save address (create or update)
    const handleSave = async (formData) => {
        setIsSubmitting(true);
        try {
            let result;

            if (editingAddress) {
                // Update existing address
                result = await updateAddress(editingAddress.id, formData);
            } else {
                // Create new address
                result = await createAddress(formData);
            }

            if (result.errCode === 0) {
                toast(
                    <CustomToast
                        type="success"
                        titleId={editingAddress ? 'address.success.updated' : 'address.success.created'}
                        message={result.message || intl.formatMessage({
                            id: editingAddress ? 'address.success.updated' : 'address.success.created',
                            defaultMessage: editingAddress ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công'
                        })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "success" }
                );

                // Close form and refresh list
                handleCloseForm();
                fetchAddresses();
            } else {
                toast(
                    <CustomToast
                        type="error"
                        titleId={editingAddress ? 'address.error.update_failed' : 'address.error.create_failed'}
                        message={result.errMessage || intl.formatMessage({
                            id: editingAddress ? 'address.error.update_failed' : 'address.error.create_failed',
                            defaultMessage: editingAddress ? 'Không thể cập nhật địa chỉ' : 'Không thể thêm địa chỉ'
                        })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
            }
        } catch (error) {
            console.error('Save address error:', error);
            toast(
                <CustomToast
                    type="error"
                    titleId="address.error.save_failed"
                    message={intl.formatMessage({
                        id: 'address.error.save_failed',
                        defaultMessage: 'Có lỗi xảy ra khi lưu địa chỉ'
                    })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete address
    const handleDelete = async (addressId) => {
        // Confirm before delete
        const confirmed = window.confirm(
            intl.formatMessage({
                id: 'address.confirm.delete',
                defaultMessage: 'Bạn có chắc chắn muốn xóa địa chỉ này?'
            })
        );

        if (!confirmed) return;

        try {
            const result = await deleteAddress(addressId);

            if (result.errCode === 0) {
                toast(
                    <CustomToast
                        type="success"
                        titleId="address.success.deleted"
                        message={result.message || intl.formatMessage({
                            id: 'address.success.deleted',
                            defaultMessage: 'Xóa địa chỉ thành công'
                        })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "success" }
                );

                // Refresh list
                fetchAddresses();
            } else {
                toast(
                    <CustomToast
                        type="error"
                        titleId="address.error.delete_failed"
                        message={result.errMessage || intl.formatMessage({
                            id: 'address.error.delete_failed',
                            defaultMessage: 'Không thể xóa địa chỉ'
                        })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
            }
        } catch (error) {
            console.error('Delete address error:', error);
            toast(
                <CustomToast
                    type="error"
                    titleId="address.error.delete_failed"
                    message={intl.formatMessage({
                        id: 'address.error.delete_failed',
                        defaultMessage: 'Không thể xóa địa chỉ'
                    })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
        }
    };

    // Set address as default
    const handleSetDefault = async (addressId) => {
        try {
            const result = await setDefaultAddress(addressId);

            if (result.errCode === 0) {
                toast(
                    <CustomToast
                        type="success"
                        titleId="address.success.set_default"
                        message={result.message || intl.formatMessage({
                            id: 'address.success.set_default',
                            defaultMessage: 'Đặt địa chỉ mặc định thành công'
                        })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "success" }
                );

                // Refresh list
                fetchAddresses();
            } else {
                toast(
                    <CustomToast
                        type="error"
                        titleId="address.error.set_default_failed"
                        message={result.errMessage || intl.formatMessage({
                            id: 'address.error.set_default_failed',
                            defaultMessage: 'Không thể đặt địa chỉ mặc định'
                        })}
                        time={new Date()}
                    />,
                    { closeButton: false, type: "error" }
                );
            }
        } catch (error) {
            console.error('Set default address error:', error);
            toast(
                <CustomToast
                    type="error"
                    titleId="address.error.set_default_failed"
                    message={intl.formatMessage({
                        id: 'address.error.set_default_failed',
                        defaultMessage: 'Không thể đặt địa chỉ mặc định'
                    })}
                    time={new Date()}
                />,
                { closeButton: false, type: "error" }
            );
        }
    };

    return (
        <div className="address-book">
            {/* Header with Add Button */}
            <div className="address-book__header">
                <button
                    className="address-book__add-btn"
                    onClick={handleAddNew}
                >
                    <FaPlus />
                    <FormattedMessage id="address.add_new" defaultMessage="Thêm địa chỉ mới" />
                </button>
            </div>

            {/* Address List */}
            <div className="address-book__list">
                {isLoading ? (
                    <div className="address-book__loading">
                        <FaSpinner className="address-book__spinner" />
                        <FormattedMessage id="common.loading" defaultMessage="Đang tải..." />
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="address-book__empty">
                        <p>
                            <FormattedMessage
                                id="address.empty"
                                defaultMessage="Bạn chưa có địa chỉ nào. Thêm địa chỉ mới để thuận tiện cho việc mua sắm!"
                            />
                        </p>
                    </div>
                ) : (
                    addresses.map((address) => (
                        <AddressItem
                            key={address.id}
                            address={address}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSetDefault={handleSetDefault}
                        />
                    ))
                )}
            </div>

            {/* Address Form Modal */}
            {isFormOpen && (
                <AddressForm
                    address={editingAddress}
                    onSave={handleSave}
                    onCancel={handleCloseForm}
                    isLoading={isSubmitting}
                />
            )}
        </div>
    );
};

export default AddressBook;

