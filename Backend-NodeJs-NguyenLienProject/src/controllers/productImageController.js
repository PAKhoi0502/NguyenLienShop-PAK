import productImageService from '../services/productImageService.js';

// Lấy tất cả ảnh của sản phẩm
let handleGetImagesByProductId = async (req, res) => {
    try {
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).json({ errCode: 1, errMessage: 'Thiếu productId' });
        }

        const result = await productImageService.getImagesByProductId(productId);
        if (result.errCode === 404) {
            return res.status(404).json(result);
        }
        if (result.errCode !== 0) {
            return res.status(500).json(result);
        }

        return res.status(200).json({
            errCode: 0,
            images: result.images
        });
    } catch (err) {
        console.error('Error in handleGetImagesByProductId:', err);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server khi lấy danh sách ảnh' });
    }
};

// Upload ảnh mới cho sản phẩm
let handleCreateProductImage = async (req, res) => {
    try {
        const { productId, isThumbnail } = req.body;

        if (!productId) {
            return res.status(400).json({ errCode: 1, errMessage: 'Thiếu productId' });
        }

        if (!req.file) {
            return res.status(400).json({ errCode: 1, errMessage: 'Không có ảnh được tải lên' });
        }

        const imageUrl = req.file.filename;
        const result = await productImageService.createProductImage(
            productId,
            imageUrl,
            isThumbnail === 'true' || isThumbnail === true
        );

        if (result.errCode === 404) {
            return res.status(404).json(result);
        }
        if (result.errCode !== 0) {
            return res.status(500).json(result);
        }

        return res.status(201).json(result);
    } catch (err) {
        console.error('Error in handleCreateProductImage:', err);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server khi thêm ảnh' });
    }
};

// Đặt ảnh làm thumbnail
let handleSetThumbnail = async (req, res) => {
    try {
        const { productId, imageId } = req.body;

        if (!productId || !imageId) {
            return res.status(400).json({ errCode: 1, errMessage: 'Thiếu productId hoặc imageId' });
        }

        const result = await productImageService.setThumbnail(productId, imageId);

        if (result.errCode === 404) {
            return res.status(404).json(result);
        }
        if (result.errCode !== 0) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleSetThumbnail:', err);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server khi đặt làm ảnh chính' });
    }
};

// Xóa ảnh
let handleDeleteProductImage = async (req, res) => {
    try {
        const { imageId } = req.body;

        if (!imageId) {
            return res.status(400).json({ errCode: 1, errMessage: 'Thiếu imageId' });
        }

        const result = await productImageService.deleteProductImage(imageId);

        if (result.errCode === 404) {
            return res.status(404).json(result);
        }
        if (result.errCode !== 0) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleDeleteProductImage:', err);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server khi xóa ảnh' });
    }
};

// Cập nhật trạng thái active của ảnh
let handleUpdateImageActive = async (req, res) => {
    try {
        const { imageId, isActive } = req.body;

        if (!imageId || isActive === undefined) {
            return res.status(400).json({ errCode: 1, errMessage: 'Thiếu imageId hoặc isActive' });
        }

        const result = await productImageService.updateImageActive(imageId, isActive === true || isActive === 'true');

        if (result.errCode === 404) {
            return res.status(404).json(result);
        }
        if (result.errCode === 400) {
            return res.status(400).json(result);
        }
        if (result.errCode !== 0) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleUpdateImageActive:', err);
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server khi cập nhật trạng thái ảnh' });
    }
};

export default {
    handleGetImagesByProductId,
    handleCreateProductImage,
    handleSetThumbnail,
    handleDeleteProductImage,
    handleUpdateImageActive
};


