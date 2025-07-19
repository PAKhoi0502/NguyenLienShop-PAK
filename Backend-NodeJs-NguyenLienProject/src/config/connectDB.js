import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load biến môi trường từ .env
dotenv.config();

// Tạo instance Sequelize dùng biến từ .env để tiện tái sử dụng
const sequelize = new Sequelize(
   process.env.DB_NAME || 'nguyenlien',
   process.env.DB_USER || 'root',
   process.env.DB_PASSWORD || null,
   {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false, // Có thể bật thành true khi debug query
      timezone: '+07:00'
   }
);

// Hàm kết nối DB
const connectDB = async () => {
   try {
      await sequelize.authenticate();
      console.log('✅ Đã kết nối MySQL thành công!');
   } catch (error) {
      console.error('❌ Kết nối MySQL thất bại:', error.message);
      process.exit(1); // Thoát chương trình nếu kết nối DB thất bại
   }
};

export default connectDB;
export { sequelize };
