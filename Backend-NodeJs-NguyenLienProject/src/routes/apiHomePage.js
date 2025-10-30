import express from 'express';

import bannerController from '../controllers/bannerController.js';
import productController from '../controllers/productController.js';
import categoryController from '../controllers/categoryController.js';
import announcementController from '../controllers/announcementController.js';
import addressController from '../controllers/addressController.js';
import discountCodeController from '../controllers/discountCodeController.js';

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

// 📢 Announcement Management
router.get('/announcement-management', verifyToken, isRole(1), announcementController.handleGetAnnouncements);
router.get('/announcement/:id', verifyToken, isRole(1), announcementController.handleGetAnnouncementById);
router.post('/announcement-create', verifyToken, isRole(1), announcementController.handleCreateAnnouncement);
router.put('/announcement-update/:id', verifyToken, isRole(1), announcementController.handleUpdateAnnouncement);
router.delete('/announcement-delete/:id', verifyToken, isRole(1), announcementController.handleDeleteAnnouncement);
router.patch('/announcement-toggle/:id', verifyToken, isRole(1), announcementController.handleToggleAnnouncementStatus);
router.get('/announcement-search', verifyToken, isRole(1), announcementController.handleSearchAnnouncements);
router.get('/announcement-type/:type', verifyToken, isRole(1), announcementController.handleGetAnnouncementsByType);
router.get('/announcement-position/:position', verifyToken, isRole(1), announcementController.handleGetAnnouncementsByPosition);
router.get('/announcement-active', verifyToken, isRole(1), announcementController.handleGetActiveAnnouncements);
router.post('/announcement-check-expired', verifyToken, isRole(1), announcementController.handleCheckExpiredAnnouncements);

// 📦 Address Management (Admin)
// Note: User address routes are in apiUser.js (/api/user/addresses)
// These are admin-only routes to manage all users' addresses

// Admin: Get all addresses in the system (with user info)
router.get('/address-management', verifyToken, isRole(1), addressController.handleAdminGetAllAddresses);

// Admin: Get statistics about addresses
router.get('/address-stats', verifyToken, isRole(1), addressController.handleAdminGetAddressStats);

// Admin: Get all addresses of a specific user
router.get('/address-user/:userId', verifyToken, isRole(1), addressController.handleAdminGetUserAddresses);

// Admin: Get any address by ID (with user info)
router.get('/address-detail/:id', verifyToken, isRole(1), addressController.handleAdminGetAddressById);

// Admin: Delete any address
router.delete('/address-admin-delete/:id', verifyToken, isRole(1), addressController.handleAdminDeleteAddress);

// 🎁 Discount Code / Voucher Management (ADMIN)
router.get('/discount-management', verifyToken, isRole(1), discountCodeController.handleGetAllDiscountCodes);
router.get('/discount/:id', verifyToken, isRole(1), discountCodeController.handleGetDiscountCodeById);
router.post('/discount-create', verifyToken, isRole(1), discountCodeController.handleCreateDiscountCode);
router.put('/discount-update', verifyToken, isRole(1), discountCodeController.handleUpdateDiscountCode);
router.delete('/discount-delete', verifyToken, isRole(1), discountCodeController.handleDeleteDiscountCode);
router.patch('/discount-toggle/:id', verifyToken, isRole(1), discountCodeController.handleToggleActiveStatus);

export default router;
