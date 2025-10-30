import addressService from '../services/addressService.js';

/**
 * Get all addresses of current user
 */
let handleGetUserAddresses = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        const result = await addressService.getUserAddresses(userId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);

    } catch (error) {
        console.error('Get addresses error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Get address by ID
 */
let handleGetAddressById = async (req, res) => {
    try {
        const userId = req.user?.id;
        const addressId = req.params.id || req.query.id;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        if (!addressId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing address ID'
            });
        }

        const result = await addressService.getAddressById(addressId, userId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);

    } catch (error) {
        console.error('Get address error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Create new address
 */
let handleCreateAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const data = req.body;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        const result = await addressService.createAddress(userId, data);
        return res.status(result.errCode === 0 ? 201 : 400).json(result);

    } catch (error) {
        console.error('Create address error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Update address
 */
let handleUpdateAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const addressId = req.params.id || req.body.id;
        const data = req.body;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        if (!addressId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing address ID'
            });
        }

        const result = await addressService.updateAddress(addressId, userId, data);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);

    } catch (error) {
        console.error('Update address error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Delete address
 */
let handleDeleteAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const addressId = req.params.id || req.query.id || req.body.id;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        if (!addressId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing address ID'
            });
        }

        const result = await addressService.deleteAddress(addressId, userId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);

    } catch (error) {
        console.error('Delete address error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Set address as default
 */
let handleSetDefaultAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const addressId = req.params.id || req.body.id;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        if (!addressId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing address ID'
            });
        }

        const result = await addressService.setDefaultAddress(addressId, userId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);

    } catch (error) {
        console.error('Set default address error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Get default address
 */
let handleGetDefaultAddress = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        const result = await addressService.getDefaultAddress(userId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);

    } catch (error) {
        console.error('Get default address error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

// ========================================
// 🔐 ADMIN-SPECIFIC HANDLERS
// ========================================

/**
 * Admin: Get all addresses in the system
 */
let handleAdminGetAllAddresses = async (req, res) => {
    try {
        const result = await addressService.adminGetAllAddresses();
        return res.status(result.errCode === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.error('Admin get all addresses error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Admin: Get all addresses of a specific user
 */
let handleAdminGetUserAddresses = async (req, res) => {
    try {
        const userId = req.params.userId || req.query.userId;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing userId parameter'
            });
        }

        const result = await addressService.adminGetUserAddresses(userId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.error('Admin get user addresses error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Admin: Get any address by ID
 */
let handleAdminGetAddressById = async (req, res) => {
    try {
        const addressId = req.params.id || req.query.id;

        if (!addressId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing address ID'
            });
        }

        const result = await addressService.adminGetAddressById(addressId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.error('Admin get address error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Admin: Delete any address
 */
let handleAdminDeleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id || req.query.id || req.body.id;

        if (!addressId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing address ID'
            });
        }

        const result = await addressService.adminDeleteAddress(addressId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.error('Admin delete address error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Admin: Get address statistics
 */
let handleAdminGetAddressStats = async (req, res) => {
    try {
        const result = await addressService.adminGetAddressStats();
        return res.status(result.errCode === 0 ? 200 : 400).json(result);
    } catch (error) {
        console.error('Admin get address stats error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

export default {
    // User handlers
    handleGetUserAddresses,
    handleGetAddressById,
    handleCreateAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    handleSetDefaultAddress,
    handleGetDefaultAddress,

    // Admin handlers
    handleAdminGetAllAddresses,
    handleAdminGetUserAddresses,
    handleAdminGetAddressById,
    handleAdminDeleteAddress,
    handleAdminGetAddressStats
};

