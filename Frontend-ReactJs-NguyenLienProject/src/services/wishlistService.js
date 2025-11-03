import axios from '../axios';

/**
 * Wishlist Service - Private API (requires authentication)
 * Quản lý danh sách yêu thích sản phẩm của user
 */

/**
 * Lấy tất cả sản phẩm trong wishlist của user hiện tại
 */
export const getUserWishlist = async () => {
    try {
        const res = await axios.get('/api/user/wishlist');
        if (res.errCode === 0) {
            return {
                errCode: 0,
                wishlist: res.wishlist,
                total: res.total,
                message: 'OK'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể lấy danh sách yêu thích'
        };
    } catch (err) {
        console.error('getUserWishlist error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy danh sách yêu thích';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Thêm sản phẩm vào wishlist
 * @param {number} productId - ID của sản phẩm
 */
export const addToWishlist = async (productId) => {
    try {
        if (!productId) {
            return { errCode: 1, errMessage: 'Thiếu ID sản phẩm' };
        }

        const res = await axios.post('/api/user/wishlist/add', { productId });
        if (res.errCode === 0) {
            return {
                errCode: 0,
                wishlistItem: res.wishlistItem,
                message: 'Đã thêm vào danh sách yêu thích'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể thêm vào danh sách yêu thích'
        };
    } catch (err) {
        console.error('addToWishlist error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi thêm vào danh sách yêu thích';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Xóa sản phẩm khỏi wishlist theo wishlistId
 * @param {number} wishlistId - ID của wishlist item
 */
export const removeFromWishlist = async (wishlistId) => {
    try {
        if (!wishlistId) {
            return { errCode: 1, errMessage: 'Thiếu ID wishlist' };
        }

        const res = await axios.delete(`/api/user/wishlist/${wishlistId}`);
        if (res.errCode === 0) {
            return {
                errCode: 0,
                message: 'Đã xóa khỏi danh sách yêu thích'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể xóa khỏi danh sách yêu thích'
        };
    } catch (err) {
        console.error('removeFromWishlist error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi xóa khỏi danh sách yêu thích';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Xóa sản phẩm khỏi wishlist theo productId
 * @param {number} productId - ID của sản phẩm
 */
export const removeFromWishlistByProductId = async (productId) => {
    try {
        if (!productId) {
            return { errCode: 1, errMessage: 'Thiếu ID sản phẩm' };
        }

        const res = await axios.delete(`/api/user/wishlist/product/${productId}`);
        if (res.errCode === 0) {
            return {
                errCode: 0,
                message: 'Đã xóa khỏi danh sách yêu thích'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể xóa khỏi danh sách yêu thích'
        };
    } catch (err) {
        console.error('removeFromWishlistByProductId error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi xóa khỏi danh sách yêu thích';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Kiểm tra sản phẩm có trong wishlist không
 * @param {number} productId - ID của sản phẩm
 */
export const checkProductInWishlist = async (productId) => {
    try {
        if (!productId) {
            return { errCode: 1, errMessage: 'Thiếu ID sản phẩm' };
        }

        const res = await axios.get(`/api/user/wishlist/check/${productId}`);
        if (res.errCode === 0) {
            return {
                errCode: 0,
                isInWishlist: res.isInWishlist,
                wishlistId: res.wishlistId,
                message: 'OK'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể kiểm tra wishlist'
        };
    } catch (err) {
        console.error('checkProductInWishlist error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi kiểm tra wishlist';
        return { errCode: -1, errMessage: errorMessage };
    }
};

/**
 * Lấy số lượng sản phẩm trong wishlist
 */
export const getWishlistCount = async () => {
    try {
        const res = await axios.get('/api/user/wishlist/count');
        if (res.errCode === 0) {
            return {
                errCode: 0,
                count: res.count,
                message: 'OK'
            };
        }
        return {
            errCode: res.errCode || -1,
            errMessage: res.errMessage || 'Không thể lấy số lượng wishlist'
        };
    } catch (err) {
        console.error('getWishlistCount error:', err);
        const errorMessage = err?.response?.data?.errMessage || 'Lỗi khi lấy số lượng wishlist';
        return { errCode: -1, errMessage: errorMessage };
    }
};

