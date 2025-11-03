import db from '../models';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';

// Lấy tất cả ảnh của sản phẩm
let getImagesByProductId = async (productId) => {
    try {
        const product = await db.Product.findByPk(productId);
        if (!product) {
            return { errCode: 404, errMessage: 'Sản phẩm không tồn tại' };
        }

        const images = await db.ProductImage.findAll({
            where: { productId },
            order: [
                ['isThumbnail', 'DESC'], // Thumbnail lên đầu
                ['createdAt', 'ASC']
            ]
        });

        return {
            errCode: 0,
            images: images.map(img => img.get({ plain: true }))
        };
    } catch (err) {
        console.error('Error in getImagesByProductId:', err);
        return { errCode: -1, errMessage: 'Lỗi khi lấy danh sách ảnh' };
    }
};

// Tạo ảnh mới cho sản phẩm
let createProductImage = async (productId, imageUrl, isThumbnail = false) => {
    try {
        const product = await db.Product.findByPk(productId);
        if (!product) {
            return { errCode: 404, errMessage: 'Sản phẩm không tồn tại' };
        }

        // Kiểm tra xem sản phẩm đã có ảnh nào chưa
        const existingImages = await db.ProductImage.count({
            where: { productId }
        });

        // Nếu là ảnh đầu tiên, tự động set làm thumbnail
        const shouldBeThumbnail = existingImages === 0 || isThumbnail;

        // Nếu set làm thumbnail, unset các thumbnail khác
        if (shouldBeThumbnail) {
            await db.ProductImage.update(
                { isThumbnail: false },
                { where: { productId, isThumbnail: true } }
            );
        }

        const newImage = await db.ProductImage.create({
            productId,
            imageUrl,
            isThumbnail: shouldBeThumbnail,
            isActive: true
        });

        return {
            errCode: 0,
            message: 'Thêm ảnh thành công',
            image: newImage.get({ plain: true })
        };
    } catch (err) {
        console.error('Error in createProductImage:', err);
        return { errCode: -1, errMessage: 'Lỗi khi thêm ảnh' };
    }
};

// Đặt ảnh làm thumbnail
let setThumbnail = async (productId, imageId) => {
    try {
        const product = await db.Product.findByPk(productId);
        if (!product) {
            return { errCode: 404, errMessage: 'Sản phẩm không tồn tại' };
        }

        const image = await db.ProductImage.findOne({
            where: { id: imageId, productId }
        });

        if (!image) {
            return { errCode: 404, errMessage: 'Ảnh không tồn tại' };
        }

        // Unset tất cả thumbnail khác của sản phẩm này
        await db.ProductImage.update(
            { isThumbnail: false },
            { where: { productId, id: { [Op.ne]: imageId } } }
        );

        // Set ảnh này làm thumbnail
        await image.update({ isThumbnail: true });

        return {
            errCode: 0,
            message: 'Đặt làm ảnh chính thành công',
            image: image.get({ plain: true })
        };
    } catch (err) {
        console.error('Error in setThumbnail:', err);
        return { errCode: -1, errMessage: 'Lỗi khi đặt làm ảnh chính' };
    }
};

// Xóa ảnh
let deleteProductImage = async (imageId) => {
    try {
        const image = await db.ProductImage.findByPk(imageId);
        if (!image) {
            return { errCode: 404, errMessage: 'Ảnh không tồn tại' };
        }

        const wasThumbnail = image.isThumbnail;
        const productId = image.productId;

        // Xóa file vật lý (nếu có)
        const imagePath = path.join('uploads', image.imageUrl);
        if (fs.existsSync(imagePath)) {
            try {
                fs.unlinkSync(imagePath);
            } catch (fileErr) {
                console.error('Error deleting file:', fileErr);
                // Không dừng lại nếu xóa file thất bại
            }
        }

        // Xóa trong database
        await image.destroy();

        // Nếu đã xóa thumbnail, tìm ảnh đầu tiên còn lại làm thumbnail
        if (wasThumbnail) {
            const nextImage = await db.ProductImage.findOne({
                where: { productId },
                order: [['createdAt', 'ASC']]
            });

            if (nextImage) {
                await nextImage.update({ isThumbnail: true });
            }
        }

        return {
            errCode: 0,
            message: 'Xóa ảnh thành công'
        };
    } catch (err) {
        console.error('Error in deleteProductImage:', err);
        return { errCode: -1, errMessage: 'Lỗi khi xóa ảnh' };
    }
};

// Cập nhật trạng thái active của ảnh
let updateImageActive = async (imageId, isActive) => {
    try {
        const image = await db.ProductImage.findByPk(imageId);
        if (!image) {
            return { errCode: 404, errMessage: 'Ảnh không tồn tại' };
        }

        // Không cho ẩn thumbnail
        if (image.isThumbnail && !isActive) {
            return { errCode: 400, errMessage: 'Không thể ẩn ảnh chính' };
        }

        await image.update({ isActive });
        return {
            errCode: 0,
            message: 'Cập nhật trạng thái ảnh thành công',
            image: image.get({ plain: true })
        };
    } catch (err) {
        console.error('Error in updateImageActive:', err);
        return { errCode: -1, errMessage: 'Lỗi khi cập nhật trạng thái ảnh' };
    }
};

export default {
    getImagesByProductId,
    createProductImage,
    setThumbnail,
    deleteProductImage,
    updateImageActive
};


