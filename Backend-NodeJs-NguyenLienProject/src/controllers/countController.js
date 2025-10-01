import categoryService from '../services/categoryService.js';
import productService from '../services/productService.js';

// Đếm số lượng sản phẩm trong danh mục cụ thể
let handleGetProductCountByCategoryId = async (req, res) => {
    try {
        const { categoryId } = req.query;

        if (!categoryId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Thiếu thông tin ID danh mục'
            });
        }

        const result = await categoryService.getProductCountByCategoryId(categoryId);

        return res.status(200).json({
            errCode: result.errCode,
            errMessage: result.errMessage || 'OK',
            data: {
                categoryId: parseInt(categoryId),
                productCount: result.count
            }
        });
    } catch (err) {
        console.error('Error in handleGetProductCountByCategoryId:', err);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Lỗi server khi đếm sản phẩm trong danh mục'
        });
    }
};

// Đếm số lượng sản phẩm trong tất cả danh mục
let handleGetProductCountForAllCategories = async (req, res) => {
    try {
        const result = await categoryService.getProductCountForAllCategories();

        return res.status(200).json({
            errCode: result.errCode,
            errMessage: result.errMessage || 'OK',
            data: result.data
        });
    } catch (err) {
        console.error('Error in handleGetProductCountForAllCategories:', err);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Lỗi server khi đếm sản phẩm cho tất cả danh mục'
        });
    }
};

// Đếm số lượng danh mục của sản phẩm cụ thể
let handleGetCategoryCountByProductId = async (req, res) => {
    try {
        const { productId } = req.query;

        if (!productId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Thiếu thông tin ID sản phẩm'
            });
        }

        const result = await productService.getCategoryCountByProductId(productId);

        return res.status(200).json({
            errCode: result.errCode,
            errMessage: result.errMessage || 'OK',
            data: {
                productId: parseInt(productId),
                categoryCount: result.count
            }
        });
    } catch (err) {
        console.error('Error in handleGetCategoryCountByProductId:', err);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Lỗi server khi đếm danh mục của sản phẩm'
        });
    }
};

// Đếm số lượng danh mục cho tất cả sản phẩm
let handleGetCategoryCountForAllProducts = async (req, res) => {
    try {
        const result = await productService.getCategoryCountForAllProducts();

        return res.status(200).json({
            errCode: result.errCode,
            errMessage: result.errMessage || 'OK',
            data: result.data
        });
    } catch (err) {
        console.error('Error in handleGetCategoryCountForAllProducts:', err);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Lỗi server khi đếm danh mục cho tất cả sản phẩm'
        });
    }
};

export default {
    handleGetProductCountByCategoryId,
    handleGetProductCountForAllCategories,
    handleGetCategoryCountByProductId,
    handleGetCategoryCountForAllProducts
};
