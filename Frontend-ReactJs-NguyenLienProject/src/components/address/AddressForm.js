import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { getProvinces, getDistricts, getWards } from '../../services/vietnamLocationService';
import './AddressForm.scss';

const AddressForm = ({ address, onSave, onCancel, isLoading }) => {
    const intl = useIntl();

    // Form data
    const [formData, setFormData] = useState({
        receiverName: '',
        receiverPhone: '',
        receiverGender: 'M',
        addressLine1: '',
        addressLine2: '',
        ward: '',
        district: '',
        city: '',
        isDefault: false
    });

    // Location data
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Selected codes (for cascading)
    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
    const [selectedDistrictCode, setSelectedDistrictCode] = useState('');

    // Loading states
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [isLoadingWards, setIsLoadingWards] = useState(false);

    const [errors, setErrors] = useState({});

    // Load provinces on mount
    useEffect(() => {
        loadProvinces();
    }, []);

    // Populate form when editing
    useEffect(() => {
        if (address) {
            setFormData({
                receiverName: address.receiverName || '',
                receiverPhone: address.receiverPhone || '',
                receiverGender: address.receiverGender || 'M',
                addressLine1: address.addressLine1 || '',
                addressLine2: address.addressLine2 || '',
                ward: address.ward || '',
                district: address.district || '',
                city: address.city || '',
                isDefault: address.isDefault || false
            });
        }
    }, [address]);

    // Load provinces
    const loadProvinces = async () => {
        setIsLoadingProvinces(true);
        try {
            const result = await getProvinces();
            if (result.errCode === 0) {
                setProvinces(result.provinces);
            }
        } catch (error) {
            console.error('Load provinces error:', error);
        } finally {
            setIsLoadingProvinces(false);
        }
    };

    // Handle province change
    const handleProvinceChange = async (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const provinceName = selectedOption.text;
        const provinceCode = selectedOption.value;

        setFormData(prev => ({
            ...prev,
            city: provinceName,
            district: '',
            ward: ''
        }));

        setSelectedProvinceCode(provinceCode);
        setSelectedDistrictCode('');
        setDistricts([]);
        setWards([]);

        // Clear errors
        if (errors.city) {
            setErrors(prev => ({ ...prev, city: '' }));
        }

        if (provinceCode) {
            // Load districts
            setIsLoadingDistricts(true);
            try {
                const result = await getDistricts(provinceCode);
                if (result.errCode === 0) {
                    setDistricts(result.districts);
                }
            } catch (error) {
                console.error('Load districts error:', error);
            } finally {
                setIsLoadingDistricts(false);
            }
        }
    };

    // Handle district change
    const handleDistrictChange = async (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const districtName = selectedOption.text;
        const districtCode = selectedOption.value;

        setFormData(prev => ({
            ...prev,
            district: districtName,
            ward: ''
        }));

        setSelectedDistrictCode(districtCode);
        setWards([]);

        // Clear errors
        if (errors.district) {
            setErrors(prev => ({ ...prev, district: '' }));
        }

        if (districtCode) {
            // Load wards
            setIsLoadingWards(true);
            try {
                const result = await getWards(districtCode);
                if (result.errCode === 0) {
                    setWards(result.wards);
                }
            } catch (error) {
                console.error('Load wards error:', error);
            } finally {
                setIsLoadingWards(false);
            }
        }
    };

    // Handle ward change
    const handleWardChange = (e) => {
        const wardName = e.target.options[e.target.selectedIndex].text;

        setFormData(prev => ({
            ...prev,
            ward: wardName
        }));

        // Clear errors
        if (errors.ward) {
            setErrors(prev => ({ ...prev, ward: '' }));
        }
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.receiverName.trim()) {
            newErrors.receiverName = intl.formatMessage({
                id: 'address.error.receiver_name_required',
                defaultMessage: 'Vui lòng nhập tên người nhận'
            });
        }

        if (!formData.receiverPhone.trim()) {
            newErrors.receiverPhone = intl.formatMessage({
                id: 'address.error.receiver_phone_required',
                defaultMessage: 'Vui lòng nhập số điện thoại'
            });
        } else if (!/^[0-9]{10,11}$/.test(formData.receiverPhone.trim())) {
            newErrors.receiverPhone = intl.formatMessage({
                id: 'address.error.receiver_phone_invalid',
                defaultMessage: 'Số điện thoại không hợp lệ (10-11 số)'
            });
        }

        if (!formData.addressLine1.trim()) {
            newErrors.addressLine1 = intl.formatMessage({
                id: 'address.error.address_line1_required',
                defaultMessage: 'Vui lòng nhập địa chỉ cụ thể'
            });
        }

        if (!formData.city.trim()) {
            newErrors.city = intl.formatMessage({
                id: 'address.error.city_required',
                defaultMessage: 'Vui lòng chọn Tỉnh/Thành phố'
            });
        }

        if (!formData.district.trim()) {
            newErrors.district = intl.formatMessage({
                id: 'address.error.district_required',
                defaultMessage: 'Vui lòng chọn Quận/Huyện'
            });
        }

        if (!formData.ward.trim()) {
            newErrors.ward = intl.formatMessage({
                id: 'address.error.ward_required',
                defaultMessage: 'Vui lòng chọn Phường/Xã'
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSave(formData);
        }
    };

    return (
        <div className="address-form-overlay">
            <div className="address-form">
                {/* Header */}
                <div className="address-form__header">
                    <h2>
                        {address ? (
                            <FormattedMessage id="address.form.title_edit" defaultMessage="Sửa địa chỉ" />
                        ) : (
                            <FormattedMessage id="address.form.title_add" defaultMessage="Thêm địa chỉ mới" />
                        )}
                    </h2>
                    <button
                        className="address-form__close"
                        onClick={onCancel}
                        type="button"
                        disabled={isLoading}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="address-form__body">
                    {/* Receiver Gender */}
                    <div className="address-form__field">
                        <label className="address-form__label">
                            <FormattedMessage id="address.form.receiver_gender" defaultMessage="Xưng hô" />
                            <span className="address-form__required">*</span>
                        </label>
                        <div className="address-form__radio-group">
                            <label className="address-form__radio">
                                <input
                                    type="radio"
                                    name="receiverGender"
                                    value="M"
                                    checked={formData.receiverGender === 'M'}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <span><FormattedMessage id="address.gender.male" defaultMessage="Anh" /></span>
                            </label>
                            <label className="address-form__radio">
                                <input
                                    type="radio"
                                    name="receiverGender"
                                    value="F"
                                    checked={formData.receiverGender === 'F'}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <span><FormattedMessage id="address.gender.female" defaultMessage="Chị" /></span>
                            </label>
                            <label className="address-form__radio">
                                <input
                                    type="radio"
                                    name="receiverGender"
                                    value="O"
                                    checked={formData.receiverGender === 'O'}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <span><FormattedMessage id="address.gender.other" defaultMessage="Khác" /></span>
                            </label>
                        </div>
                    </div>

                    {/* Receiver Name */}
                    <div className="address-form__field">
                        <label className="address-form__label" htmlFor="receiverName">
                            <FormattedMessage id="address.form.receiver_name" defaultMessage="Họ và tên người nhận" />
                            <span className="address-form__required">*</span>
                        </label>
                        <input
                            type="text"
                            id="receiverName"
                            name="receiverName"
                            className={`address-form__input ${errors.receiverName ? 'address-form__input--error' : ''}`}
                            value={formData.receiverName}
                            onChange={handleChange}
                            placeholder={intl.formatMessage({
                                id: 'address.form.receiver_name_placeholder',
                                defaultMessage: 'Nhập họ và tên'
                            })}
                            disabled={isLoading}
                        />
                        {errors.receiverName && (
                            <span className="address-form__error">{errors.receiverName}</span>
                        )}
                    </div>

                    {/* Receiver Phone */}
                    <div className="address-form__field">
                        <label className="address-form__label" htmlFor="receiverPhone">
                            <FormattedMessage id="address.form.receiver_phone" defaultMessage="Số điện thoại" />
                            <span className="address-form__required">*</span>
                        </label>
                        <input
                            type="tel"
                            id="receiverPhone"
                            name="receiverPhone"
                            className={`address-form__input ${errors.receiverPhone ? 'address-form__input--error' : ''}`}
                            value={formData.receiverPhone}
                            onChange={handleChange}
                            placeholder={intl.formatMessage({
                                id: 'address.form.receiver_phone_placeholder',
                                defaultMessage: 'Nhập số điện thoại'
                            })}
                            disabled={isLoading}
                        />
                        {errors.receiverPhone && (
                            <span className="address-form__error">{errors.receiverPhone}</span>
                        )}
                    </div>

                    {/* City, District, Ward - Grid with Dropdowns */}
                    <div className="address-form__grid">
                        {/* City - Province */}
                        <div className="address-form__field">
                            <label className="address-form__label" htmlFor="city">
                                <FormattedMessage id="address.form.city" defaultMessage="Tỉnh/Thành phố" />
                                <span className="address-form__required">*</span>
                            </label>
                            <div className="address-form__select-wrapper">
                                <select
                                    id="city"
                                    className={`address-form__select ${errors.city ? 'address-form__select--error' : ''}`}
                                    onChange={handleProvinceChange}
                                    value={selectedProvinceCode}
                                    disabled={isLoading || isLoadingProvinces}
                                >
                                    <option value="">
                                        {isLoadingProvinces ? (
                                            intl.formatMessage({
                                                id: 'common.loading',
                                                defaultMessage: 'Đang tải...'
                                            })
                                        ) : (
                                            intl.formatMessage({
                                                id: 'address.form.city_select',
                                                defaultMessage: '-- Chọn Tỉnh/Thành phố --'
                                            })
                                        )}
                                    </option>
                                    {provinces.map((province) => (
                                        <option key={province.code} value={province.code}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingProvinces && (
                                    <FaSpinner className="address-form__select-spinner" />
                                )}
                            </div>
                            {errors.city && (
                                <span className="address-form__error">{errors.city}</span>
                            )}
                        </div>

                        {/* District */}
                        <div className="address-form__field">
                            <label className="address-form__label" htmlFor="district">
                                <FormattedMessage id="address.form.district" defaultMessage="Quận/Huyện" />
                                <span className="address-form__required">*</span>
                            </label>
                            <div className="address-form__select-wrapper">
                                <select
                                    id="district"
                                    className={`address-form__select ${errors.district ? 'address-form__select--error' : ''}`}
                                    onChange={handleDistrictChange}
                                    value={selectedDistrictCode}
                                    disabled={isLoading || isLoadingDistricts || !selectedProvinceCode}
                                >
                                    <option value="">
                                        {isLoadingDistricts ? (
                                            intl.formatMessage({
                                                id: 'common.loading',
                                                defaultMessage: 'Đang tải...'
                                            })
                                        ) : !selectedProvinceCode ? (
                                            intl.formatMessage({
                                                id: 'address.form.district_select_province_first',
                                                defaultMessage: 'Chọn tỉnh/thành phố trước'
                                            })
                                        ) : (
                                            intl.formatMessage({
                                                id: 'address.form.district_select',
                                                defaultMessage: '-- Chọn Quận/Huyện --'
                                            })
                                        )}
                                    </option>
                                    {districts.map((district) => (
                                        <option key={district.code} value={district.code}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingDistricts && (
                                    <FaSpinner className="address-form__select-spinner" />
                                )}
                            </div>
                            {errors.district && (
                                <span className="address-form__error">{errors.district}</span>
                            )}
                        </div>

                        {/* Ward */}
                        <div className="address-form__field">
                            <label className="address-form__label" htmlFor="ward">
                                <FormattedMessage id="address.form.ward" defaultMessage="Phường/Xã" />
                                <span className="address-form__required">*</span>
                            </label>
                            <div className="address-form__select-wrapper">
                                <select
                                    id="ward"
                                    className={`address-form__select ${errors.ward ? 'address-form__select--error' : ''}`}
                                    onChange={handleWardChange}
                                    disabled={isLoading || isLoadingWards || !selectedDistrictCode}
                                >
                                    <option value="">
                                        {isLoadingWards ? (
                                            intl.formatMessage({
                                                id: 'common.loading',
                                                defaultMessage: 'Đang tải...'
                                            })
                                        ) : !selectedDistrictCode ? (
                                            intl.formatMessage({
                                                id: 'address.form.ward_select_district_first',
                                                defaultMessage: 'Chọn quận/huyện trước'
                                            })
                                        ) : (
                                            intl.formatMessage({
                                                id: 'address.form.ward_select',
                                                defaultMessage: '-- Chọn Phường/Xã --'
                                            })
                                        )}
                                    </option>
                                    {wards.map((ward) => (
                                        <option key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingWards && (
                                    <FaSpinner className="address-form__select-spinner" />
                                )}
                            </div>
                            {errors.ward && (
                                <span className="address-form__error">{errors.ward}</span>
                            )}
                        </div>
                    </div>

                    {/* Address Line 1 */}
                    <div className="address-form__field">
                        <label className="address-form__label" htmlFor="addressLine1">
                            <FormattedMessage id="address.form.address_line1" defaultMessage="Địa chỉ cụ thể" />
                            <span className="address-form__required">*</span>
                        </label>
                        <input
                            type="text"
                            id="addressLine1"
                            name="addressLine1"
                            className={`address-form__input ${errors.addressLine1 ? 'address-form__input--error' : ''}`}
                            value={formData.addressLine1}
                            onChange={handleChange}
                            placeholder={intl.formatMessage({
                                id: 'address.form.address_line1_placeholder',
                                defaultMessage: 'Số nhà, tên đường...'
                            })}
                            disabled={isLoading}
                        />
                        {errors.addressLine1 && (
                            <span className="address-form__error">{errors.addressLine1}</span>
                        )}
                    </div>

                    {/* Address Line 2 (Optional) */}
                    <div className="address-form__field">
                        <label className="address-form__label" htmlFor="addressLine2">
                            <FormattedMessage id="address.form.address_line2" defaultMessage="Địa chỉ bổ sung (tùy chọn)" />
                        </label>
                        <input
                            type="text"
                            id="addressLine2"
                            name="addressLine2"
                            className="address-form__input"
                            value={formData.addressLine2}
                            onChange={handleChange}
                            placeholder={intl.formatMessage({
                                id: 'address.form.address_line2_placeholder',
                                defaultMessage: 'Tòa nhà, số tầng, ghi chú thêm...'
                            })}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Is Default Checkbox */}
                    <div className="address-form__field address-form__field--checkbox">
                        <label className="address-form__checkbox">
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            <span>
                                <FormattedMessage
                                    id="address.form.set_as_default"
                                    defaultMessage="Đặt làm địa chỉ mặc định"
                                />
                            </span>
                        </label>
                    </div>

                    {/* Form Actions */}
                    <div className="address-form__actions">
                        <button
                            type="button"
                            className="address-form__btn address-form__btn--cancel"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            <FaTimes />
                            <FormattedMessage id="common.cancel" defaultMessage="Hủy" />
                        </button>
                        <button
                            type="submit"
                            className="address-form__btn address-form__btn--submit"
                            disabled={isLoading}
                        >
                            <FaSave />
                            {isLoading ? (
                                <FormattedMessage id="common.loading" defaultMessage="Đang xử lý..." />
                            ) : (
                                <FormattedMessage id="common.submit" defaultMessage="Lưu" />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AddressForm.propTypes = {
    address: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool
};

AddressForm.defaultProps = {
    address: null,
    isLoading: false
};

export default AddressForm;
