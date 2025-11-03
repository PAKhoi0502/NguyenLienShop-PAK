
import db from '../models';

function toSlug(str) {
   if (!str) return '';
   return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
}

let getProducts = async () => {
   return await db.Product.findAll({
      include: [
         {
            model: db.Category,
            as: 'categories',
            attributes: ['id', 'nameCategory'],
            through: { attributes: [] }
         },
         { model: db.ProductImage, as: 'images' },
         { model: db.Review, as: 'reviews' }
      ],
      order: [['createdAt', 'DESC']]
   });
};

let createProduct = async (data) => {
   const {
      nameProduct,
      description,
      price,
      discountPrice,
      dimensions,
      slug,
      stock,
      saleQuantity,
      isNew,
      isBestSeller
   } = data;

   const generatedSlug = toSlug(nameProduct);

   const product = await db.Product.create({
      nameProduct,
      description,
      price,
      discountPrice,
      dimensions,
      slug: generatedSlug,
      stock,
      saleQuantity: saleQuantity || 1,
      isNew: !!isNew,
      isBestSeller: !!isBestSeller,
      isActive: false
   });

   if (data.categories) {
      await product.setCategories(data.categories);
   }

   if (data.images) {
      await product.setImages(data.images);
   }

   return {
      errCode: 0,
      message: 'Tạo sản phẩm thành công',
      product
   };
};

let getProductById = async (id) => {
   try {
      const product = await db.Product.findOne({
         where: { id },
         include: [
            {
               model: db.Category,
               as: 'categories',
               through: { attributes: [] }, // Exclude junction table attributes
               attributes: ['id', 'nameCategory']
            },
            {
               model: db.ProductImage,
               as: 'images',
               order: [
                  ['isThumbnail', 'DESC'],
                  ['createdAt', 'ASC']
               ]
            }
         ]
      });
      if (!product) {
         return { errCode: 404, errMessage: 'Sản phẩm không tồn tại' };
      }
      return { errCode: 0, product };
   } catch (err) {
      console.error('Error in getProductById:', err);
      return { errCode: -1, errMessage: 'Lỗi khi tải sản phẩm' };
   }
};

let updateProduct = async (id, updateData) => {
   const product = await db.Product.findByPk(id);
   if (!product) return { errCode: 1, errMessage: 'Không tìm thấy sản phẩm' };

   const allowedFields = ['nameProduct', 'description', 'price', 'discountPrice', 'dimensions', 'stock', 'saleQuantity', 'isNew', 'isBestSeller'];
   const filteredData = {};

   for (const key of allowedFields) {
      if (updateData.hasOwnProperty(key)) {
         filteredData[key] = updateData[key];
      }
   }

   await product.update(filteredData);
   return {
      errCode: 0,
      message: 'Cập nhật sản phẩm thành công',
      product
   };
};

let deleteProduct = async (id) => {
   const product = await db.Product.findByPk(id);
   if (!product) return { errCode: 1, errMessage: 'Không tìm thấy sản phẩm' };

   await product.setCategories([]);
   await product.destroy();

   return { errCode: 0, message: 'Xoá sản phẩm thành công' };
};

let getActiveProducts = async (id, isActive) => {
   const product = await db.Product.findByPk(id);
   if (!product) return { errCode: 1, errMessage: 'Không tìm thấy sản phẩm' };

   await product.update({ isActive });
   return {
      errCode: 0,
      message: 'Cập nhật trạng thái hoạt động thành công',
      product
   };
};

let addCategoryForProduct = async (productId, categoryIds) => {
   const product = await db.Product.findByPk(productId);
   if (!product) return { errCode: 1, errMessage: 'Không tìm thấy sản phẩm' };
   if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return { errCode: 2, errMessage: 'Danh sách danh mục không hợp lệ' };
   }
   await product.setCategories(categoryIds);
   return { errCode: 0, message: 'Gắn danh mục cho sản phẩm thành công' };
};

let getCategoriesByProductId = async (productId) => {
   try {
      const product = await db.Product.findByPk(productId, {
         include: [{ model: db.Category, as: 'categories' }]
      });
      if (!product) return { errCode: 1, errMessage: 'Không tìm thấy sản phẩm' };
      if (!product.categories || product.categories.length === 0) {
         return { errCode: 0, categories: [] };
      }
      const categories = product.categories.map(c => c.get({ plain: true }));
      return { errCode: 0, categories };
   } catch (err) {
      return { errCode: -1, errMessage: err.message };
   }
};

let deleteCategoryForProduct = async (productId, categoryIds) => {
   const product = await db.Product.findByPk(productId);
   if (!product) return { errCode: 1, errMessage: 'Không tìm thấy sản phẩm' };
   if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return { errCode: 2, errMessage: 'Danh sách danh mục không hợp lệ' };
   }
   await product.removeCategories(categoryIds);
   return { errCode: 0, message: 'Xóa danh mục khỏi sản phẩm thành công' };
};

let getAllProducts = async () => {
   try {
      const products = await db.Product.findAll();
      return { errCode: 0, products };
   } catch (err) {
      return { errCode: -1, errMessage: err.message };
   }
};

// Đếm số lượng danh mục của sản phẩm
let getCategoryCountByProductId = async (productId) => {
   try {
      const count = await db.ProductCategory.count({
         where: { productId: productId }
      });
      return { errCode: 0, count };
   } catch (err) {
      return { errCode: -1, errMessage: err.message };
   }
};

// Đếm số lượng danh mục cho tất cả sản phẩm
let getCategoryCountForAllProducts = async () => {
   try {
      const products = await db.Product.findAll({
         attributes: ['id', 'nameProduct']
      });

      const result = await Promise.all(
         products.map(async (product) => {
            const count = await db.ProductCategory.count({
               where: { productId: product.id }
            });
            return {
               productId: product.id,
               productName: product.nameProduct,
               categoryCount: count
            };
         })
      );

      return { errCode: 0, data: result };
   } catch (err) {
      return { errCode: -1, errMessage: err.message };
   }
};

export default {
   getProducts,
   createProduct,
   updateProduct,
   deleteProduct,
   getActiveProducts,
   getProductById,
   addCategoryForProduct,
   deleteCategoryForProduct,
   getCategoriesByProductId,
   getAllProducts,
   getCategoryCountByProductId,
   getCategoryCountForAllProducts
};
