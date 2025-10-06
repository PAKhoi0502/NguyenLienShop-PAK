import dashboardService from '../services/dashboardService';
import dotenv from 'dotenv';
dotenv.config();

// Lấy thống kê tổng quan dashboard
let handleGetDashboardStats = async (req, res) => {
   try {
      const stats = await dashboardService.getDashboardStats();
      return res.status(200).json(stats);
   } catch (err) {
      console.error('Error in handleGetDashboardStats:', err);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server khi lấy thống kê dashboard'
      });
   }
};

// Lấy thống kê account management  
let handleGetAccountStats = async (req, res) => {
   try {
      const stats = await dashboardService.getAccountStats();
      return res.status(200).json(stats);
   } catch (err) {
      console.error('Error in handleGetAccountStats:', err);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server khi lấy thống kê tài khoản'
      });
   }
};

// Lấy thống kê số lượng account (count only)
let handleGetAccountCountStats = async (req, res) => {
   try {
      const stats = await dashboardService.getAccountCountStats();
      return res.status(200).json(stats);
   } catch (err) {
      console.error('Error in handleGetAccountCountStats:', err);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server khi lấy số lượng tài khoản'
      });
   }
};

// Lấy thống kê sản phẩm và danh mục
let handleGetProductCategoryStats = async (req, res) => {
   try {
      const stats = await dashboardService.getProductCategoryStats();
      return res.status(200).json(stats);
   } catch (err) {
      console.error('Error in handleGetProductCategoryStats:', err);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server khi lấy thống kê sản phẩm và danh mục'
      });
   }
};

// Lấy thống kê homepage (banner stats)
let handleGetHomepageStats = async (req, res) => {
   try {
      const stats = await dashboardService.getHomepageStats();
      return res.status(200).json(stats);
   } catch (err) {
      console.error('Error in handleGetHomepageStats:', err);
      return res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi server khi lấy thống kê homepage'
      });
   }
};

export default {
   handleGetDashboardStats,
   handleGetAccountStats,
   handleGetAccountCountStats,
   handleGetProductCategoryStats,
   handleGetHomepageStats
};
