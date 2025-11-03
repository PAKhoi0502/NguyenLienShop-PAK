import db from '../models/index.js';

/**
 * Get all wishlist items of a user with product details
 */
let getUserWishlist = async (userId) => {
    try {
        const wishlistItems = await db.Wishlist.findAll({
            where: { userId: userId },
            include: [
                {
                    model: db.Product,
                    as: 'product',
                    include: [
                        {
                            model: db.ProductImage,
                            as: 'images',
                            limit: 1, // Chỉ lấy 1 ảnh đầu tiên
                            order: [['createdAt', 'ASC']]
                        }
                    ],
                    where: { isActive: true } // Chỉ lấy sản phẩm đang active
                }
            ],
            order: [['createdAt', 'DESC']] // Mới nhất trước
        });

        return {
            errCode: 0,
            message: 'OK',
            wishlist: wishlistItems,
            total: wishlistItems.length
        };
    } catch (error) {
        console.error('getUserWishlist error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while retrieving wishlist'
        };
    }
};

/**
 * Add product to wishlist
 */
let addToWishlist = async (userId, productId) => {
    try {
        if (!productId) {
            return {
                errCode: 1,
                errMessage: 'Missing productId parameter'
            };
        }

        // Check if product exists and is active
        const product = await db.Product.findOne({
            where: {
                id: productId,
                isActive: true
            }
        });

        if (!product) {
            return {
                errCode: 2,
                errMessage: 'Product not found or not available'
            };
        }

        // Check if already in wishlist
        const existingWishlist = await db.Wishlist.findOne({
            where: {
                userId: userId,
                productId: productId
            }
        });

        if (existingWishlist) {
            return {
                errCode: 3,
                errMessage: 'Product already in wishlist'
            };
        }

        // Add to wishlist
        const newWishlistItem = await db.Wishlist.create({
            userId: userId,
            productId: productId
        });

        return {
            errCode: 0,
            message: 'Product added to wishlist successfully',
            wishlistItem: newWishlistItem
        };
    } catch (error) {
        console.error('addToWishlist error:', error);

        // Handle unique constraint violation
        if (error.name === 'SequelizeUniqueConstraintError') {
            return {
                errCode: 3,
                errMessage: 'Product already in wishlist'
            };
        }

        return {
            errCode: -1,
            errMessage: 'Server error while adding to wishlist'
        };
    }
};

/**
 * Remove product from wishlist
 */
let removeFromWishlist = async (userId, wishlistId) => {
    try {
        if (!wishlistId) {
            return {
                errCode: 1,
                errMessage: 'Missing wishlistId parameter'
            };
        }

        const wishlistItem = await db.Wishlist.findOne({
            where: {
                id: wishlistId,
                userId: userId // Ensure user owns this wishlist item
            }
        });

        if (!wishlistItem) {
            return {
                errCode: 2,
                errMessage: 'Wishlist item not found'
            };
        }

        await wishlistItem.destroy();

        return {
            errCode: 0,
            message: 'Product removed from wishlist successfully'
        };
    } catch (error) {
        console.error('removeFromWishlist error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while removing from wishlist'
        };
    }
};

/**
 * Remove product from wishlist by productId
 */
let removeFromWishlistByProductId = async (userId, productId) => {
    try {
        if (!productId) {
            return {
                errCode: 1,
                errMessage: 'Missing productId parameter'
            };
        }

        const wishlistItem = await db.Wishlist.findOne({
            where: {
                userId: userId,
                productId: productId
            }
        });

        if (!wishlistItem) {
            return {
                errCode: 2,
                errMessage: 'Product not found in wishlist'
            };
        }

        await wishlistItem.destroy();

        return {
            errCode: 0,
            message: 'Product removed from wishlist successfully'
        };
    } catch (error) {
        console.error('removeFromWishlistByProductId error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while removing from wishlist'
        };
    }
};

/**
 * Check if product is in wishlist
 */
let checkProductInWishlist = async (userId, productId) => {
    try {
        if (!productId) {
            return {
                errCode: 1,
                errMessage: 'Missing productId parameter'
            };
        }

        const wishlistItem = await db.Wishlist.findOne({
            where: {
                userId: userId,
                productId: productId
            }
        });

        return {
            errCode: 0,
            message: 'OK',
            isInWishlist: !!wishlistItem,
            wishlistId: wishlistItem?.id || null
        };
    } catch (error) {
        console.error('checkProductInWishlist error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while checking wishlist'
        };
    }
};

/**
 * Get wishlist count
 */
let getWishlistCount = async (userId) => {
    try {
        // Count wishlist items with active products
        const wishlistItems = await db.Wishlist.findAll({
            where: { userId: userId },
            include: [
                {
                    model: db.Product,
                    as: 'product',
                    where: { isActive: true },
                    required: true // INNER JOIN để chỉ đếm sản phẩm active
                }
            ]
        });

        return {
            errCode: 0,
            message: 'OK',
            count: wishlistItems.length
        };
    } catch (error) {
        console.error('getWishlistCount error:', error);
        return {
            errCode: -1,
            errMessage: 'Server error while getting wishlist count'
        };
    }
};

export default {
    getUserWishlist,
    addToWishlist,
    removeFromWishlist,
    removeFromWishlistByProductId,
    checkProductInWishlist,
    getWishlistCount
};

