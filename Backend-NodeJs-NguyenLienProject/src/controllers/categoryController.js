import categoryService from '../services/categoryService.js';

const handleGetCategoryById = async (req, res) => {
   try {
      const id = req.query.id;
      if (!id) {
         return res.status(400).json({ errCode: 1, errMessage: 'ID không hợp lệ' });
      }
      const result = await categoryService.getCategoryById(id);
      if (result.errCode !== 0) {
         return res.status(404).json({ errCode: result.errCode, errMessage: result.errMessage });
      }
      return res.status(200).json(result.category);
   } catch (error) {
      return res.status(500).json({ errCode: -1, errMessage: error.message });
   }
};

const handleGetCategories = async (req, res) => {
   try {
      const categories = await categoryService.getCategories();
      return res.status(200).json(categories);
   } catch (error) {
      return res.status(500).json({ errMessage: error.message });
   }
};

const handleCreateCategory = async (req, res) => {
   try {
      const result = await categoryService.createCategory(req.body);
      return res.status(200).json(result);
   } catch (error) {
      return res.status(500).json({ errMessage: error.message });
   }
};

const handleUpdateCategory = async (req, res) => {
   try {
      const id = req.body.id;
      const updateData = req.body;
      const result = await categoryService.updateCategory(id, updateData);
      return res.status(200).json(result);
   } catch (error) {
      return res.status(500).json({ errMessage: error.message });
   }
};

const handleDeleteCategory = async (req, res) => {
   try {
      const id = req.body.id;
      const result = await categoryService.deleteCategory(id);
      return res.status(200).json(result);
   } catch (error) {
      return res.status(500).json({ errMessage: error.message });
   }
};

const handleGetActiveCategory = async (req, res) => {
   try {
      const id = req.body.id;
      const isActive = req.body.isActive;
      const result = await categoryService.getActiveCategory(id, isActive);
      return res.status(200).json(result);
   } catch (error) {
      return res.status(500).json({ errMessage: error.message });
   }
};

const handleAddProductForCategory = async (req, res) => {
   try {
      const categoryId = req.body.categoryId;
      const productIds = req.body.productIds;
      const result = await categoryService.addProductForCategory(categoryId, productIds);
      return res.status(200).json(result);
   } catch (error) {
      return res.status(500).json({ errMessage: error.message });
   }
};

const handleGetAllCategories = async (req, res) => {
   try {
      const excludeCategoryId = req.query.excludeCategoryId;
      const categories = await categoryService.getAllCategoriesExcept(excludeCategoryId);
      return res.status(200).json(categories);
   } catch (error) {
      return res.status(500).json({ errMessage: error.message });
   }
};

const handleDeleteProductForCategory = async (req, res) => {
   try {
      const { categoryId, productIds } = req.body;
      if (!categoryId || !Array.isArray(productIds) || productIds.length === 0) {
         return res.status(400).json({ errCode: 1, errMessage: 'Dữ liệu không hợp lệ' });
      }
      const result = await categoryService.deleteProductForCategory(categoryId, productIds);
      return res.status(200).json(result);
   } catch (error) {
      return res.status(500).json({ errMessage: 'Lỗi khi xóa sản phẩm khỏi danh mục', detail: error.message });
   }
}; const handleGetProductsByCategoryId = async (req, res) => {
   try {
      const categoryId = req.query.categoryId;

      if (!categoryId) {
         return res.status(400).json({ errCode: 1, errMessage: 'Thiếu thông tin ID danh mục' });
      }

      let result = await categoryService.getProductsByCategoryId(categoryId);

      return res.status(200).json({
         errCode: result.errCode,
         errMessage: result.errMessage || 'OK',
         products: result.products
      });
   } catch (error) {
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi khi lấy sản phẩm theo danh mục'
      });
   }
}

export default {
   handleGetCategoryById,
   handleGetCategories,
   handleCreateCategory,
   handleUpdateCategory,
   handleDeleteCategory,
   handleGetActiveCategory,
   handleAddProductForCategory,
   handleDeleteProductForCategory,
   handleGetAllCategories,
   handleGetProductsByCategoryId,
};
