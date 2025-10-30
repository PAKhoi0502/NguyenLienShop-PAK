import db from '../models/index.js';

/**
 * Get all addresses of a user
 */
let getUserAddresses = async (userId) => {
    try {
        const addresses = await db.Address.findAll({
            where: { userId: userId },
            order: [
                ['isDefault', 'DESC'], // Default address first
                ['createdAt', 'DESC']  // Then by newest
            ]
        });

        return {
            errCode: 0,
            message: 'OK',
            addresses
        };
    } catch (error) {
        console.error('getUserAddresses error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while retrieving addresses'
        };
    }
};

/**
 * Get address by ID
 */
let getAddressById = async (addressId, userId) => {
    try {
        const address = await db.Address.findOne({
            where: {
                id: addressId,
                userId: userId // Ensure user owns this address
            }
        });

        if (!address) {
            return {
                errCode: 2,
                errMessage: 'Address not found'
            };
        }

        return {
            errCode: 0,
            message: 'OK',
            address
        };
    } catch (error) {
        console.error('getAddressById error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while retrieving address'
        };
    }
};

/**
 * Create new address
 */
let createAddress = async (userId, data) => {
    try {
        // Validate required fields
        if (!data.receiverName || !data.receiverPhone || !data.addressLine1 || !data.city || !data.district || !data.ward) {
            return {
                errCode: 1,
                errMessage: 'Missing required fields: receiverName, receiverPhone, addressLine1, city, district, ward'
            };
        }

        // If this is set as default, remove default from other addresses
        if (data.isDefault === true || data.isDefault === 'true') {
            await db.Address.update(
                { isDefault: false },
                { where: { userId: userId } }
            );
        }

        // If user has no addresses, make this one default automatically
        const addressCount = await db.Address.count({ where: { userId: userId } });
        const isDefault = addressCount === 0 ? true : (data.isDefault === true || data.isDefault === 'true');

        const newAddress = await db.Address.create({
            userId: userId,
            receiverName: data.receiverName.trim(),
            receiverPhone: data.receiverPhone.trim(),
            receiverGender: data.receiverGender || null,
            addressLine1: data.addressLine1.trim(),
            addressLine2: data.addressLine2?.trim() || null,
            city: data.city.trim(),
            district: data.district.trim(),
            ward: data.ward.trim(),
            isDefault: isDefault
        });

        return {
            errCode: 0,
            message: 'Address created successfully',
            address: newAddress
        };
    } catch (error) {
        console.error('createAddress error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while creating address'
        };
    }
};

/**
 * Update address
 */
let updateAddress = async (addressId, userId, data) => {
    try {
        const address = await db.Address.findOne({
            where: {
                id: addressId,
                userId: userId // Ensure user owns this address
            },
            raw: false
        });

        if (!address) {
            return {
                errCode: 2,
                errMessage: 'Address not found'
            };
        }

        // If setting as default, remove default from other addresses
        if (data.isDefault === true || data.isDefault === 'true') {
            await db.Address.update(
                { isDefault: false },
                { where: { userId: userId, id: { [db.Sequelize.Op.ne]: addressId } } }
            );
        }

        // Update fields
        address.receiverName = data.receiverName?.trim() || address.receiverName;
        address.receiverPhone = data.receiverPhone?.trim() || address.receiverPhone;
        address.receiverGender = data.receiverGender !== undefined ? data.receiverGender : address.receiverGender;
        address.addressLine1 = data.addressLine1?.trim() || address.addressLine1;
        address.addressLine2 = data.addressLine2 !== undefined ? data.addressLine2?.trim() : address.addressLine2;
        address.city = data.city?.trim() || address.city;
        address.district = data.district?.trim() || address.district;
        address.ward = data.ward?.trim() || address.ward;

        if (data.isDefault !== undefined) {
            address.isDefault = data.isDefault === true || data.isDefault === 'true';
        }

        await address.save();

        return {
            errCode: 0,
            message: 'Address updated successfully',
            address
        };
    } catch (error) {
        console.error('updateAddress error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while updating address'
        };
    }
};

/**
 * Delete address
 */
let deleteAddress = async (addressId, userId) => {
    try {
        const address = await db.Address.findOne({
            where: {
                id: addressId,
                userId: userId // Ensure user owns this address
            }
        });

        if (!address) {
            return {
                errCode: 2,
                errMessage: 'Address not found'
            };
        }

        const wasDefault = address.isDefault;
        await address.destroy();

        // If deleted address was default, set another address as default
        if (wasDefault) {
            const nextAddress = await db.Address.findOne({
                where: { userId: userId },
                order: [['createdAt', 'DESC']]
            });

            if (nextAddress) {
                await nextAddress.update({ isDefault: true });
            }
        }

        return {
            errCode: 0,
            message: 'Address deleted successfully'
        };
    } catch (error) {
        console.error('deleteAddress error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while deleting address'
        };
    }
};

/**
 * Set address as default
 */
let setDefaultAddress = async (addressId, userId) => {
    try {
        const address = await db.Address.findOne({
            where: {
                id: addressId,
                userId: userId
            }
        });

        if (!address) {
            return {
                errCode: 2,
                errMessage: 'Address not found'
            };
        }

        // Remove default from all addresses
        await db.Address.update(
            { isDefault: false },
            { where: { userId: userId } }
        );

        // Set this address as default
        await address.update({ isDefault: true });

        return {
            errCode: 0,
            message: 'Default address updated successfully'
        };
    } catch (error) {
        console.error('setDefaultAddress error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while setting default address'
        };
    }
};

/**
 * Get default address
 */
let getDefaultAddress = async (userId) => {
    try {
        const address = await db.Address.findOne({
            where: {
                userId: userId,
                isDefault: true
            }
        });

        if (!address) {
            return {
                errCode: 2,
                errMessage: 'No default address found'
            };
        }

        return {
            errCode: 0,
            message: 'OK',
            address
        };
    } catch (error) {
        console.error('getDefaultAddress error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while retrieving default address'
        };
    }
};

// ========================================
// 🔐 ADMIN-SPECIFIC FUNCTIONS
// ========================================

/**
 * Admin: Get all addresses in the system with user information
 */
let adminGetAllAddresses = async () => {
    try {
        const addresses = await db.Address.findAll({
            include: [{
                model: db.User,
                as: 'user',
                attributes: ['id', 'userName', 'phoneNumber', 'email']
            }],
            order: [
                ['userId', 'ASC'],
                ['isDefault', 'DESC'],
                ['createdAt', 'DESC']
            ]
        });

        return {
            errCode: 0,
            message: 'OK',
            addresses,
            total: addresses.length
        };
    } catch (error) {
        console.error('adminGetAllAddresses error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while retrieving all addresses'
        };
    }
};

/**
 * Admin: Get all addresses of a specific user
 */
let adminGetUserAddresses = async (userId) => {
    try {
        if (!userId) {
            return {
                errCode: 1,
                errMessage: 'Missing userId parameter'
            };
        }

        // Check if user exists
        const user = await db.User.findByPk(userId, {
            attributes: ['id', 'userName', 'phoneNumber', 'email']
        });

        if (!user) {
            return {
                errCode: 2,
                errMessage: 'User not found'
            };
        }

        const addresses = await db.Address.findAll({
            where: { userId: userId },
            order: [
                ['isDefault', 'DESC'],
                ['createdAt', 'DESC']
            ]
        });

        return {
            errCode: 0,
            message: 'OK',
            user: user,
            addresses,
            total: addresses.length
        };
    } catch (error) {
        console.error('adminGetUserAddresses error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while retrieving user addresses'
        };
    }
};

/**
 * Admin: Get any address by ID (without userId restriction)
 */
let adminGetAddressById = async (addressId) => {
    try {
        if (!addressId) {
            return {
                errCode: 1,
                errMessage: 'Missing addressId parameter'
            };
        }

        const address = await db.Address.findOne({
            where: { id: addressId },
            include: [{
                model: db.User,
                as: 'user',
                attributes: ['id', 'userName', 'phoneNumber', 'email']
            }]
        });

        if (!address) {
            return {
                errCode: 2,
                errMessage: 'Address not found'
            };
        }

        return {
            errCode: 0,
            message: 'OK',
            address
        };
    } catch (error) {
        console.error('adminGetAddressById error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while retrieving address'
        };
    }
};

/**
 * Admin: Delete any address by ID
 */
let adminDeleteAddress = async (addressId) => {
    try {
        if (!addressId) {
            return {
                errCode: 1,
                errMessage: 'Missing addressId parameter'
            };
        }

        const address = await db.Address.findByPk(addressId);

        if (!address) {
            return {
                errCode: 2,
                errMessage: 'Address not found'
            };
        }

        const userId = address.userId;
        const wasDefault = address.isDefault;

        await address.destroy();

        // If deleted address was default, set another address as default
        if (wasDefault) {
            const nextAddress = await db.Address.findOne({
                where: { userId: userId },
                order: [['createdAt', 'DESC']]
            });

            if (nextAddress) {
                await nextAddress.update({ isDefault: true });
            }
        }

        return {
            errCode: 0,
            message: 'Address deleted successfully by admin'
        };
    } catch (error) {
        console.error('adminDeleteAddress error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while deleting address'
        };
    }
};

/**
 * Admin: Get statistics about addresses
 */
let adminGetAddressStats = async () => {
    try {
        const totalAddresses = await db.Address.count();
        const totalUsersWithAddresses = await db.Address.count({
            distinct: true,
            col: 'userId'
        });
        const totalDefaultAddresses = await db.Address.count({
            where: { isDefault: true }
        });

        return {
            errCode: 0,
            message: 'OK',
            stats: {
                totalAddresses,
                totalUsersWithAddresses,
                totalDefaultAddresses
            }
        };
    } catch (error) {
        console.error('adminGetAddressStats error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while retrieving address statistics'
        };
    }
};

export default {
    // User functions
    getUserAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,

    // Admin functions
    adminGetAllAddresses,
    adminGetUserAddresses,
    adminGetAddressById,
    adminDeleteAddress,
    adminGetAddressStats
};
