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

export default {
   getDashboardStats,
   getAccountStats,
   getAccountCountStats
};
