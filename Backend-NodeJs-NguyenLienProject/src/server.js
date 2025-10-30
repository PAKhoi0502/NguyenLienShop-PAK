import path from 'path';
import { config } from 'dotenv';
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import viewEngine from "./config/viewEngine";
import initRoutes from './routes/web';
import connectDB from './config/connectDB';
import './jobs/voucherJobs.js'; // ⭐ Load voucher cronjobs

// Load biến môi trường từ .env
config({ path: path.resolve(__dirname, '../.env') });


const app = express();

// ✅ Cấu hình CORS cho phép frontend truy cập backend
app.use(cors({
   origin: 'http://localhost:3000',
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
   credentials: true
}));

// ✅ Bổ sung header để cho phép Authorization
app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
   next();
});

app.use('/uploads', express.static('uploads'));

// ✅ Parse cookies for HttpOnly cookie authentication
app.use(cookieParser());

// ✅ Parse body của request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Khởi tạo view engine nếu bạn đang dùng EJS cho các route test
viewEngine(app);

// ✅ Khai báo các route API/web
initRoutes(app);

// ✅ Kết nối cơ sở dữ liệu
connectDB();

// ✅ Chạy server trên cổng .env hoặc 8080 mặc định
const port = process.env.PORT || 5050;
app.listen(port, () => {
   console.log("Dự án NguyenLien đã chạy THÀNH CÔNG trên CỔNG " + port + " !!!");
});
