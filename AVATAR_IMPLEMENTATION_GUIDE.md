# 📸 Hướng Dẫn Cài Đặt Tính Năng Avatar Cho User

## 🎯 Tổng Quan
Tài liệu này hướng dẫn các bước để kích hoạt tính năng avatar cho user trong hệ thống NguyenLienShop.

## ✅ Các Thay Đổi Đã Được Thực Hiện

### 1. Backend Changes

#### 📁 Migration File
- **File mới**: `src/migrations/023-add-avatar-to-user.js`
- **Mục đích**: Thêm cột `avatar` (VARCHAR) vào bảng `Users`

#### 📁 Model User
- **File**: `src/models/user.js`
- **Thay đổi**: Thêm trường `avatar: DataTypes.STRING`

#### 📁 User Controller
- **File**: `src/controllers/userController.js`
- **Thay đổi**: Xử lý file upload từ `req.file` trong `handleUpdateUserProfile`

#### 📁 User Service
- **File**: `src/services/userService.js`
- **Thay đổi**: Thêm logic cập nhật avatar trong `updateUserProfile`

#### 📁 API Route
- **File**: `src/routes/apiUser.js`
- **Thay đổi**: 
  - Import `uploadMiddleware`
  - Thêm middleware `upload.single('avatar')` cho route `/update`

### 2. Frontend Changes

#### 📁 User Service
- **File**: `src/services/userService.js`
- **Tạo mới**: Service để gọi API update profile với FormData

#### 📁 Profile Info Component
- **File**: `src/pages/user/ProfileInfo.js`
- **Thay đổi**:
  - Thêm state management cho avatar preview
  - Thêm file upload handler với validation
  - Hiển thị avatar (ảnh thật hoặc initials)
  - Upload avatar tự động khi chọn file

#### 📁 Profile Info Styles
- **File**: `src/pages/user/ProfileInfo.scss`
- **Thay đổi**:
  - Style cho `avatar-img`
  - Style cho `avatar-initials`
  - Responsive styles

## 🚀 Cách Kích Hoạt

### Bước 1: Chạy Migration (Backend)
```bash
cd Backend-NodeJs-NguyenLienProject
npm run migration:up
```

Hoặc nếu dùng sequelize-cli trực tiếp:
```bash
npx sequelize-cli db:migrate
```

### Bước 2: Khởi Động Backend
```bash
cd Backend-NodeJs-NguyenLienProject
npm start
```

### Bước 3: Khởi Động Frontend
```bash
cd Frontend-ReactJs-NguyenLienProject
npm start
```

## 📝 Cách Sử Dụng

### Trên Giao Diện User:
1. Đăng nhập vào tài khoản
2. Vào trang Profile (`/user/account`)
3. Click vào nút "Thay đổi ảnh"
4. Chọn file ảnh (JPG, PNG, GIF)
5. Avatar sẽ tự động upload và hiển thị

### Validation:
- ✅ Chỉ chấp nhận: JPG, PNG, GIF
- ✅ Kích thước tối đa: 5MB
- ✅ Tự động preview trước khi upload

## 🔧 API Endpoints

### Update User Profile (with Avatar)
```
PUT /api/user/update
Authorization: Bearer Token (Cookie)
Content-Type: multipart/form-data

Body (FormData):
- avatar: File (optional)
- userName: String (optional)
- fullName: String (optional)
- gender: String (optional)
- birthday: String (optional)
```

### Get User Profile
```
GET /api/user/profile
Authorization: Bearer Token (Cookie)

Response:
{
  errCode: 0,
  message: "OK",
  user: {
    id: 1,
    userName: "john_doe",
    fullName: "John Doe",
    email: "john@example.com",
    avatar: "1760781305866.jpg",  // ← Avatar filename
    ...
  }
}
```

## 📂 Cấu Trúc File Upload

### Backend:
- **Thư mục lưu trữ**: `Backend-NodeJs-NguyenLienProject/uploads/`
- **Tên file**: `{timestamp}.{extension}` (vd: `1760781305866.jpg`)

### Frontend - Hiển thị Avatar:
```javascript
const avatarUrl = `${process.env.REACT_APP_BACKEND_URL}/uploads/${user.avatar}`;
```

## 🎨 UI/UX Features

### Avatar Display:
- Nếu **có avatar**: Hiển thị ảnh thật
- Nếu **không có avatar**: Hiển thị initials (chữ cái đầu của tên)

### Upload Process:
1. Click button → Mở file picker
2. Chọn ảnh → Validation
3. Preview ảnh → Auto upload
4. Upload thành công → Refresh user info
5. Hiển thị thông báo thành công/lỗi

### Loading State:
- Button hiển thị "Đang tải..." khi đang upload
- Disable button để tránh upload trùng lặp

## 🐛 Troubleshooting

### Lỗi: Migration không chạy được
```bash
# Kiểm tra kết nối database
cd Backend-NodeJs-NguyenLienProject
npm run test:db

# Force sync (CHỈ dùng trong development)
# Lưu ý: Điều này có thể xóa dữ liệu!
# Uncomment dòng force: true trong server.js
```

### Lỗi: Avatar không hiển thị
- Kiểm tra thư mục `uploads/` có tồn tại không
- Kiểm tra quyền ghi file (chmod 755)
- Kiểm tra CORS settings
- Kiểm tra `REACT_APP_BACKEND_URL` trong `.env`

### Lỗi: Upload file quá lớn
- Tăng giới hạn trong multer config
- Tăng `client_max_body_size` trong nginx (nếu dùng)

## 📋 Checklist Kiểm Tra

- [ ] Migration đã chạy thành công
- [ ] Database có cột `avatar` trong bảng `Users`
- [ ] Backend API endpoint `/api/user/update` hoạt động
- [ ] Frontend có thể chọn và preview ảnh
- [ ] Upload avatar thành công
- [ ] Avatar hiển thị đúng trên UI
- [ ] Validation file type hoạt động
- [ ] Validation file size hoạt động
- [ ] Toast notifications hiển thị đúng

## 🔐 Security Notes

- File upload được validate về type và size
- Chỉ user đã đăng nhập mới có thể upload
- File được lưu với tên unique (timestamp) để tránh conflict
- Không lưu file path gốc vào database (chỉ lưu filename)

## 📚 Tham Khảo

- **Multer Documentation**: https://github.com/expressjs/multer
- **FormData MDN**: https://developer.mozilla.org/en-US/docs/Web/API/FormData
- **FileReader API**: https://developer.mozilla.org/en-US/docs/Web/API/FileReader

## 🎉 Kết Luận

Tính năng avatar đã được triển khai hoàn chỉnh với:
- ✅ Backend: Migration, Model, Controller, Service, Route
- ✅ Frontend: Component, Service, Styling
- ✅ Upload & Preview functionality
- ✅ Validation & Error handling
- ✅ Responsive design

**Chúc bạn triển khai thành công!** 🚀

