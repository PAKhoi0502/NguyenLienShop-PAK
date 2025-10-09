import express from 'express';

import bannerController from '../controllers/bannerController.js';
import productController from '../controllers/productController.js';
import categoryController from '../controllers/categoryController.js';

import { verifyToken, isRole } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Banner
router.get('/banner-management', verifyToken, isRole(1), bannerController.handleGetBanners);
router.get('/banner/:id', verifyToken, isRole(1), bannerController.handleGetBannerById); // detail
router.post('/banner-create', verifyToken, isRole(1), upload.single('image'), bannerController.handleCreateBanner);
router.put('/banner-update', verifyToken, isRole(1), bannerController.handleUpdateBanner);
router.delete('/banner-delete', verifyToken, isRole(1), bannerController.handleDeleteBanner);
router.get('/banner-active', verifyToken, isRole(1), bannerController.handleGetActiveBanners);

// Categories
router.get('/category', verifyToken, isRole(1), categoryController.handleGetCategoryById); //detail
router.get('/category-management', verifyToken, isRole(1), categoryController.handleGetCategories); //manager
router.post('/category-create', verifyToken, isRole(1), categoryController.handleCreateCategory); //create
router.put('/category-update', verifyToken, isRole(1), categoryController.handleUpdateCategory); //update
router.delete('/category-delete', verifyToken, isRole(1), categoryController.handleDeleteCategory); //delete
router.put('/category-active', verifyToken, isRole(1), categoryController.handleGetActiveCategory); //active
router.post('/category-add-product', verifyToken, isRole(1), categoryController.handleAddProductForCategory); //add product
router.post('/category-delete-product', verifyToken, isRole(1), categoryController.handleDeleteProductForCategory); //delete product
router.get('/get-product', verifyToken, isRole(1), categoryController.handleGetProductsByCategoryId); // info category
router.get('/categories-get-all', verifyToken, isRole(1), categoryController.handleGetAllCategories); //get all categories to add product

// Products
router.get('/product', verifyToken, isRole(1), productController.handleGetProductById); //detail
router.get('/product-management', verifyToken, isRole(1), productController.handleGetProducts); //manager
router.post('/product-create', verifyToken, isRole(1), productController.handleCreateProduct); //create
router.put('/product-update', verifyToken, isRole(1), productController.handleUpdateProduct); //update
router.delete('/product-delete', verifyToken, isRole(1), productController.handleDeleteProduct); //delete
router.put('/product-active', verifyToken, isRole(1), productController.handleGetActiveProduct); //active
router.post('/product-add-category', verifyToken, isRole(1), productController.handleAddCategoryForProduct); //add category
router.post('/product-delete-category', verifyToken, isRole(1), productController.handleDeleteCategoryForProduct); //delete category
router.get('/get-category', verifyToken, isRole(1), productController.handleGetCategoriesByProductId); // info product
router.get('/products-get-all', verifyToken, isRole(1), productController.handleGetAllProducts); //get all products to add category

export default router;
