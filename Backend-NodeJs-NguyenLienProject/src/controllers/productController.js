
import productService from '../services/productService';
import dotenv from 'dotenv';
dotenv.config();

let handleGetProductById = async (req, res) => {
   try {
      const id = req.query.id; // Lấy ID từ query string
      if (!id) {
         return res.status(400).json({ errCode: 1, errMessage: 'ID không hợp lệ' });
      }
      const product = await productService.getProductById(id);
      if (product.errCode !== 0) {
         return res.status(404).json({ errCode: product.errCode, errMessage: product.errMessage });
      }
      return res.status(200).json(product.product);
   } catch (err) {
      return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server khi tải sản phẩm' });
   }
};

let handleGetProducts = async (req, res) => {
   try {
      const products = await productService.getProducts();
      return res.status(200).json(products);
   } catch (err) {
      return res.status(500).json({ errMessage: 'Lỗi khi lấy sản phẩm' });
   }
};

let handleCreateProduct = async (req, res) => {
   try {
      const data = req.body;
      const newProduct = await productService.createProduct(data);
      return res.status(201).json(newProduct);
   } catch (err) {
      return res.status(500).json({ errMessage: 'Lỗi khi tạo sản phẩm' });
   }
};

let handleUpdateProduct = async (req, res) => {
   try {
      const { id, ...updateData } = req.body;
      const result = await productService.updateProduct(id, updateData);
      return res.status(200).json(result);
   } catch (err) {
      return res.status(500).json({ errMessage: 'Lỗi khi cập nhật sản phẩm' });
   }
};

let handleDeleteProduct = async (req, res) => {
   try {
      const { id } = req.body;
      const result = await productService.deleteProduct(id);
      return res.status(200).json(result);
   } catch (err) {
      return res.status(500).json({ errMessage: 'Lỗi khi xoá sản phẩm' });
   }
};

let handleGetActiveProduct = async (req, res) => {
   try {
      const { id, isActive } = req.body;

      if (!id || isActive === undefined) {
         return res.status(400).json({ errCode: 1, errMessage: 'Dữ liệu không hợp lệ' });
      }

      const result = await productService.getActiveProducts(id, isActive);

      return res.status(200).json(result);
   } catch (err) {
      return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server khi cập nhật trạng thái hoạt động' });
   }
};

let handleAddCategoryForProduct = async (req, res) => {
   try {
      const { productId, categoryIds } = req.body;
      if (!productId || !Array.isArray(categoryIds) || categoryIds.length === 0) {
         return res.status(400).json({ errCode: 1, errMessage: 'Dữ liệu không hợp lệ' });
      }
      const result = await productService.addCategoryForProduct(productId, categoryIds);
      return res.status(200).json(result);
   } catch (err) {
      return res.status(500).json({ errMessage: 'Lỗi khi gắn danh mục cho sản phẩm', detail: err.message });
   }
};

let handleGetCategoriesByProductId = async (req, res) => {
   try {

      const productId = req.query.productId;

      if (!productId) {
         return res.status(400).json({
            errCode: 1,
            errMessage: 'Thiếu thông tin ID sản phẩm'
         });
      }


      let result = await productService.getCategoriesByProductId(productId);

      return res.status(200).json({
         errCode: result.errCode,
         errMessage: result.errMessage || 'OK',
         categories: result.categories
      });
   } catch (err) {
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi khi lấy danh mục của sản phẩm'
      });
   }
};

let handleDeleteCategoryForProduct = async (req, res) => {
   try {
      const { productId, categoryIds } = req.body;
      if (!productId || !Array.isArray(categoryIds) || categoryIds.length === 0) {
         return res.status(400).json({ errCode: 1, errMessage: 'Dữ liệu không hợp lệ' });
      }
      const result = await productService.deleteCategoryForProduct(productId, categoryIds);
      return res.status(200).json(result);
   } catch (err) {
      return res.status(500).json({ errMessage: 'Lỗi khi xóa danh mục khỏi sản phẩm', detail: err.message });
   }
};

let handleGetAllProducts = async (req, res) => {
   try {
      const result = await productService.getAllProducts();
      return res.status(200).json(result);
   } catch (err) {
      return res.status(500).json({ errMessage: 'Lỗi khi lấy tất cả sản phẩm', detail: err.message });
   }
};

export default {
   handleGetProducts,
   handleCreateProduct,
   handleUpdateProduct,
   handleDeleteProduct,
   handleGetActiveProduct,
   handleGetProductById,
   handleAddCategoryForProduct,
   handleDeleteCategoryForProduct,
   handleGetCategoriesByProductId,
   handleGetAllProducts
};

