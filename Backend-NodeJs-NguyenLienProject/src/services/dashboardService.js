import db from '../models';

// Lấy thống kê tổng quan cho dashboard
let getDashboardStats = async () => {
   try {
      // Đếm tổng số users
      const totalUsers = await db.User.count();

      // Đếm tổng số products  
      const totalProducts = await db.Product.count();

      // Đếm tổng số banners
      const totalBanners = await db.Banner.count();

      // Đếm tổng số orders (nếu có model Order)
      let totalOrders = 0;
      try {
         totalOrders = await db.Order.count();
      } catch (err) {
         console.log('Order model not found, defaulting to 0');
         totalOrders = 0;
      }

      return {
         errCode: 0,
         data: {
            totalUsers,
            totalProducts,
            totalBanners,
            totalOrders
         },
         message: 'Lấy thống kê dashboard thành công'
      };
   } catch (err) {
      console.error('Error in getDashboardStats:', err);
      throw new Error('Lỗi khi lấy thống kê dashboard');
   }
};

// Lấy thống kê cho account management
let getAccountStats = async () => {
   try {
      // Đếm tổng admins (roleId = 'R1')
      const totalAdmins = await db.User.count({
         where: { roleId: 'R1' }
      });

      // Đếm tổng customers (roleId = 'R2')  
      const totalCustomers = await db.User.count({
         where: { roleId: 'R2' }
      });

      // Đếm users hoạt động (có thể dựa vào trường isActive hoặc lastLogin)
      const activeUsers = await db.User.count({
         where: {
            // Giả sử có trường isActive hoặc điều kiện khác
            // isActive: true 
         }
      });

      // Tính inactive users
      const totalAllUsers = totalAdmins + totalCustomers;
      const inactiveUsers = totalAllUsers - activeUsers;

      return {
         errCode: 0,
         data: {
            totalAdmins,
            totalCustomers,
            activeUsers: activeUsers || totalAllUsers, // Fallback nếu không có isActive
            inactiveUsers: inactiveUsers || 0
         },
         message: 'Lấy thống kê tài khoản thành công'
      };
   } catch (err) {
      console.error('Error in getAccountStats:', err);
      throw new Error('Lỗi khi lấy thống kê tài khoản');
   }
};

// Lấy số lượng admin và user đơn giản
let getAccountCountStats = async () => {
   try {
      // Đếm admin (roleId = 1)
      const totalAdmins = await db.User.count({
         where: { roleId: 1 }
      });

      // Đếm user (roleId = 2)
      const totalUsers = await db.User.count({
         where: { roleId: 2 }
      });

      return {
         errCode: 0,
         data: {
            totalAdmins,
            totalUsers,
            totalAccounts: totalAdmins + totalUsers
         },
         message: 'Lấy số lượng tài khoản thành công'
      };
   } catch (err) {
      console.error('Error in getAccountCountStats:', err);
      throw new Error('Lỗi khi lấy số lượng tài khoản');
   }
};

// Lấy thống kê sản phẩm và danh mục
let getProductCategoryStats = async () => {
   try {
      console.log('🔍 Starting getProductCategoryStats...');
      console.log('📦 Product model available:', !!db.Product);
      console.log('📁 Category model available:', !!db.Category);

      // Đếm tổng số products
      const totalProducts = await db.Product.count();
      console.log('📊 Total products:', totalProducts);

      // Đếm số products đang active (isActive = true)
      const activeProducts = await db.Product.count({
         where: { isActive: true }
      });
      console.log('✅ Active products:', activeProducts);

      // Đếm tổng số categories
      const totalCategories = await db.Category.count();
      console.log('📊 Total categories:', totalCategories);

      // Đếm số categories đang active (isActive = true)  
      const activeCategories = await db.Category.count({
         where: { isActive: true }
      });
      console.log('✅ Active categories:', activeCategories);

      // Tính tổng tất cả items
      const totalItems = totalProducts + totalCategories;
      const activeItems = activeProducts + activeCategories;

      const result = {
         errCode: 0,
         data: {
            products: {
               total: totalProducts,
               active: activeProducts,
               inactive: totalProducts - activeProducts
            },
            categories: {
               total: totalCategories,
               active: activeCategories,
               inactive: totalCategories - activeCategories
            },
            summary: {
               totalItems,
               activeItems,
               inactiveItems: totalItems - activeItems
            }
         },
         message: 'Lấy thống kê sản phẩm và danh mục thành công'
      };

      console.log('🎯 Final result:', JSON.stringify(result, null, 2));
      return result;
   } catch (err) {
      console.error('Error in getProductCategoryStats:', err);
      throw new Error('Lỗi khi lấy thống kê sản phẩm và danh mục');
   }
};

// Lấy thống kê homepage (banner + announcement + voucher stats)
let getHomepageStats = async () => {
   try {
      console.log('🔍 Starting getHomepageStats...');
      console.log('🖼️ Banner model available:', !!db.Banner);
      console.log('📢 Announcement model available:', !!db.Announcement);
      console.log('🎁 DiscountCode model available:', !!db.DiscountCode);

      // Đếm tổng số banners
      const totalBanners = await db.Banner.count();
      console.log('📊 Total banners:', totalBanners);

      // Đếm số banners đang active (isActive = true)
      const activeBanners = await db.Banner.count({
         where: { isActive: true }
      });
      console.log('✅ Active banners:', activeBanners);

      // Đếm số banners inactive
      const inactiveBanners = totalBanners - activeBanners;

      // Đếm tổng số announcements
      const totalAnnouncements = await db.Announcement.count();
      console.log('📊 Total announcements:', totalAnnouncements);

      // Đếm số announcements đang active (isActive = true)
      const activeAnnouncements = await db.Announcement.count({
         where: { isActive: true }
      });
      console.log('✅ Active announcements:', activeAnnouncements);

      // Đếm số announcements inactive
      const inactiveAnnouncements = totalAnnouncements - activeAnnouncements;

      // Đếm tổng số vouchers (discount codes)
      const totalVouchers = await db.DiscountCode.count();
      console.log('📊 Total vouchers:', totalVouchers);

      // Đếm số vouchers đang active (isActive = true)
      const activeVouchers = await db.DiscountCode.count({
         where: { isActive: true }
      });
      console.log('✅ Active vouchers:', activeVouchers);

      // Đếm số vouchers inactive
      const inactiveVouchers = totalVouchers - activeVouchers;

      const result = {
         errCode: 0,
         data: {
            totalBanners,
            activeBanners,
            inactiveBanners,
            totalAnnouncements,
            activeAnnouncements,
            inactiveAnnouncements,
            totalVouchers,
            activeVouchers,
            inactiveVouchers
         },
         message: 'Lấy thống kê homepage thành công'
      };

      console.log('🎯 Final homepage stats result:', JSON.stringify(result, null, 2));
      return result;
   } catch (err) {
      console.error('Error in getHomepageStats:', err);
      throw new Error('Lỗi khi lấy thống kê homepage');
   }
};

export default {
   getDashboardStats,
   getAccountStats,
   getAccountCountStats,
   getProductCategoryStats,
   getHomepageStats
};
