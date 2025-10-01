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

let getAllCategories = async () => {
   try {
      return await db.Category.findAll({ order: [['nameCategory', 'ASC']] });
   } catch (err) {
      throw new Error('Lỗi khi lấy danh sách danh mục');
   }
};

let getCategoryById = async (id) => {
   try {
      const category = await db.Category.findByPk(id);
      if (!category) {
         return { errCode: 404, errMessage: 'Danh mục không tồn tại' };
      }
      return { errCode: 0, category };
   } catch (err) {
      return { errCode: -1, errMessage: 'Lỗi khi tải danh mục' };
   }
};

let getCategories = async () => {
   try {
      const categories = await db.Category.findAll({
         include: [
            {
               model: db.Product,
               as: 'products',
               attributes: ['id', 'nameProduct', 'slug'],
               through: { attributes: [] }
            }
         ],
         order: [['nameCategory', 'ASC']]
      });
      return categories;
   } catch (err) {
      throw new Error('Lỗi khi lấy danh sách danh mục');
   }
};

let createCategory = async (data) => {
   const { nameCategory, description, isActive } = data;

   if (!nameCategory) {
      return { errCode: 1, errMessage: 'Tên danh mục là bắt buộc' };
   }

   const generatedSlug = toSlug(nameCategory);

   const existed = await db.Category.findOne({ where: { slug: generatedSlug } });
   if (existed) {
      return { errCode: 2, errMessage: 'Slug đã tồn tại' };
   }

   const newCategory = await db.Category.create({
      nameCategory,
      slug: generatedSlug,
      description: description || '',
      isActive: isActive ?? false
   });

   return { errCode: 0, message: 'Tạo danh mục thành công', category: newCategory };
};

let updateCategory = async (id, updateData) => {
   const category = await db.Category.findByPk(id);
   if (!category) {
      return { errCode: 1, errMessage: 'Không tìm thấy danh mục' };
   }

   const allowedFields = ['nameCategory', 'description'];
   const filteredData = {};

   for (const key of allowedFields) {
      if (updateData.hasOwnProperty(key)) {
         filteredData[key] = updateData[key];
      }
   }

   await category.update(filteredData);
   return { errCode: 0, message: 'Cập nhật thành công', category };
};

let deleteCategory = async (id) => {
   const category = await db.Category.findByPk(id, {
      include: [{ model: db.Product, as: 'products' }]
   });

   if (!category) return { errCode: 1, errMessage: 'Không tìm thấy danh mục' };

   const productIds = category.products.map((p) => p.id);

   // Xoá liên kết bảng trung gian
   await category.removeProducts(productIds);

   // Cập nhật trạng thái từng sản phẩm nếu không còn danh mục nào khác
   for (const productId of productIds) {
      const product = await db.Product.findByPk(productId, {
         include: [{ model: db.Category, as: 'categories' }]
      });

      if (product.categories.length === 0) {
         await product.update({ isActive: false });
      }
   }

   await category.destroy();

   return { errCode: 0, message: 'Xoá danh mục và cập nhật sản phẩm thành công' };
};

let getActiveCategory = async (id, isActive) => {
   const category = await db.Category.findByPk(id);
   if (!category) return { errCode: 1, errMessage: 'Không tìm thấy danh mục' };

   await category.update({ isActive });

   return {
      errCode: 0,
      message: 'Cập nhật trạng thái hoạt động danh mục thành công',
      category,
   };
};

let addProductForCategory = async (categoryId, productIds) => {
   const category = await db.Category.findByPk(categoryId);
   if (!category) return { errCode: 1, errMessage: 'Không tìm thấy danh mục' };
   if (!Array.isArray(productIds) || productIds.length === 0) {
      return { errCode: 2, errMessage: 'Danh sách sản phẩm không hợp lệ' };
   }
   await category.setProducts(productIds);
   return { errCode: 0, message: 'Gắn sản phẩm cho danh mục thành công' };
};

let deleteProductForCategory = async (categoryId, productIds) => {
   const category = await db.Category.findByPk(categoryId);
   if (!category) return { errCode: 1, errMessage: 'Không tìm thấy danh mục' };
   if (!Array.isArray(productIds) || productIds.length === 0) {
      return { errCode: 2, errMessage: 'Danh sách sản phẩm không hợp lệ' };
   }
   await category.removeProducts(productIds);
   return { errCode: 0, message: 'Xóa sản phẩm khỏi danh mục thành công' };
};

let getProductsByCategoryId = async (categoryId) => {
   try {
      const category = await db.Category.findByPk(categoryId, {
         include: [{ model: db.Product, as: 'products' }]
      });
      if (!category) return { errCode: 1, errMessage: 'Không tìm thấy danh mục' };
      if (!category.products || category.products.length === 0) {
         return { errCode: 0, products: [] };
      }
      const products = category.products.map(p => p.get({ plain: true }));
      return { errCode: 0, products };
   } catch (err) {
      return { errCode: -1, errMessage: err.message };
   }
}

let getAllCategoriesExcept = async (excludeCategoryId) => {
   try {
      const whereCondition = {};
      if (excludeCategoryId) {
         whereCondition.id = { [db.Sequelize.Op.ne]: excludeCategoryId };
      }

      return await db.Category.findAll({
         where: whereCondition,
         order: [['nameCategory', 'ASC']]
      });
   } catch (err) {
      throw new Error('Lỗi khi lấy danh sách danh mục');
   }
};

// Đếm số lượng sản phẩm trong danh mục
let getProductCountByCategoryId = async (categoryId) => {
   try {
      const count = await db.ProductCategory.count({
         where: { categoryId: categoryId }
      });
      return { errCode: 0, count };
   } catch (err) {
      return { errCode: -1, errMessage: err.message };
   }
};

// Đếm số lượng sản phẩm trong tất cả danh mục
let getProductCountForAllCategories = async () => {
   try {
      const categories = await db.Category.findAll({
         attributes: ['id', 'nameCategory']
      });

      const result = await Promise.all(
         categories.map(async (category) => {
            const count = await db.ProductCategory.count({
               where: { categoryId: category.id }
            });
            return {
               categoryId: category.id,
               categoryName: category.nameCategory,
               productCount: count
            };
         })
      );

      return { errCode: 0, data: result };
   } catch (err) {
      return { errCode: -1, errMessage: err.message };
   }
};

export default {
   getCategoryById,
   getCategories,
   createCategory,
   updateCategory,
   deleteCategory,
   getActiveCategory,
   addProductForCategory,
   deleteProductForCategory,
   getAllCategories,
   getAllCategoriesExcept,
   getProductsByCategoryId,
   getProductCountByCategoryId,
   getProductCountForAllCategories
};