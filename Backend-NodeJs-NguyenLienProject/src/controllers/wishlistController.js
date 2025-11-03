import wishlistService from '../services/wishlistService.js';

/**
 * Get all wishlist items of current user
 */
let handleGetUserWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        const result = await wishlistService.getUserWishlist(userId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);

    } catch (error) {
        console.error('Get wishlist error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Add product to wishlist
 */
let handleAddToWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        const productId = req.body.productId || req.params.productId;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        if (!productId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing productId parameter'
            });
        }

        const result = await wishlistService.addToWishlist(userId, productId);

        // 201 for created, 400 for already exists or error
        const statusCode = result.errCode === 0 ? 201 : 400;
        return res.status(statusCode).json(result);

    } catch (error) {
        console.error('Add to wishlist error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Remove product from wishlist by wishlistId
 */
let handleRemoveFromWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        const wishlistId = req.params.id || req.body.id;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        if (!wishlistId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing wishlist ID'
            });
        }

        const result = await wishlistService.removeFromWishlist(userId, wishlistId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);

    } catch (error) {
        console.error('Remove from wishlist error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Remove product from wishlist by productId
 */
let handleRemoveFromWishlistByProductId = async (req, res) => {
    try {
        const userId = req.user?.id;
        const productId = req.params.productId || req.body.productId;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        if (!productId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing productId parameter'
            });
        }

        const result = await wishlistService.removeFromWishlistByProductId(userId, productId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);

    } catch (error) {
        console.error('Remove from wishlist by productId error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Check if product is in wishlist
 */
let handleCheckProductInWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        const productId = req.params.productId || req.query.productId;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        if (!productId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing productId parameter'
            });
        }

        const result = await wishlistService.checkProductInWishlist(userId, productId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);

    } catch (error) {
        console.error('Check product in wishlist error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

/**
 * Get wishlist count
 */
let handleGetWishlistCount = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing user ID from token'
            });
        }

        const result = await wishlistService.getWishlistCount(userId);
        return res.status(result.errCode === 0 ? 200 : 400).json(result);

    } catch (error) {
        console.error('Get wishlist count error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Internal server error'
        });
    }
};

export default {
    handleGetUserWishlist,
    handleAddToWishlist,
    handleRemoveFromWishlist,
    handleRemoveFromWishlistByProductId,
    handleCheckProductInWishlist,
    handleGetWishlistCount
};

