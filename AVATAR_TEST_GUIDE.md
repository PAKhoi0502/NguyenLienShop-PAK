# 🧪 Hướng Dẫn Kiểm Tra Tính Năng Avatar

## ✅ Checklist Kiểm Tra

### 1. **Database Migration**

Kiểm tra xem migration đã chạy chưa:

```bash
cd Backend-NodeJs-NguyenLienProject
npx sequelize-cli db:migrate:status
```

**Kết quả mong đợi:**
- `023-add-avatar-to-user.js` có status `up`

Nếu chưa chạy, thực hiện:
```bash
npx sequelize-cli db:migrate
```

### 2. **Kiểm Tra Database**

Kết nối vào database và chạy query:

```sql
-- Kiểm tra cột avatar đã tồn tại
DESCRIBE Users;

-- Hoặc
SHOW COLUMNS FROM Users LIKE 'avatar';
```

**Kết quả mong đợi:**
```
Field   | Type         | Null | Key | Default | Extra
--------|--------------|------|-----|---------|-------
avatar  | varchar(255) | YES  |     | NULL    |
```

### 3. **Kiểm Tra Backend API**

#### Test Upload Avatar:

```bash
# Login trước để lấy cookie
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "0987654321",
    "password": "123456"
  }' \
  -c cookies.txt

# Upload avatar (với cookie)
curl -X PUT http://localhost:8080/api/user/update \
  -H "Content-Type: multipart/form-data" \
  -F "avatar=@/path/to/image.jpg" \
  -b cookies.txt
```

**Response mong đợi:**
```json
{
  "errCode": 0,
  "message": "User profile updated successfully"
}
```

#### Test Get Profile:

```bash
curl -X GET http://localhost:8080/api/user/profile \
  -b cookies.txt
```

**Response mong đợi:**
```json
{
  "errCode": 0,
  "message": "OK",
  "user": {
    "id": 1,
    "userName": "john_doe",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "0987654321",
    "avatar": "1760781305866.jpg",  // ← Avatar filename
    "roleId": 2,
    "Role": {
      "name": "User"
    }
  }
}
```

### 4. **Kiểm Tra Login Flow**

#### Test Login Response:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "0987654321",
    "password": "123456"
  }'
```

**Response phải bao gồm avatar:**
```json
{
  "errCode": 0,
  "message": "Login successful!",
  "token": "eyJhbGc...",
  "data": {
    "id": 1,
    "userName": "john_doe",
    "email": "john@example.com",
    "phoneNumber": "0987654321",
    "fullName": "John Doe",
    "gender": "M",
    "birthday": "1990-01-01",
    "roleId": 2,
    "avatar": "1760781305866.jpg"  // ← Avatar phải có ở đây
  }
}
```

### 5. **Kiểm Tra Frontend**

#### Test Flow Hoàn Chỉnh:

1. **Login:**
   - Mở browser và login vào hệ thống
   - Mở DevTools → Redux DevTools
   - Kiểm tra `state.admin.adminInfo` có field `avatar` không

2. **Upload Avatar:**
   - Vào trang Profile (`/user/account`)
   - Click "Thay đổi ảnh"
   - Chọn file ảnh (JPG, PNG, GIF, < 5MB)
   - Xem preview avatar
   - Chờ upload thành công (toast notification)

3. **Verify Redux State:**
   ```javascript
   // Trong Redux DevTools, kiểm tra:
   state.admin.adminInfo.avatar = "1760781305866.jpg"
   ```

4. **Logout và Login Lại:**
   - Logout khỏi hệ thống
   - Login lại với cùng tài khoản
   - Avatar vẫn hiển thị ✅

5. **Kiểm Tra URL Avatar:**
   - Mở DevTools → Network tab
   - Tìm request load avatar
   - URL phải có dạng: `http://localhost:8080/uploads/1760781305866.jpg`

### 6. **Test Cases Chi Tiết**

#### ✅ Test Case 1: Upload Avatar Thành Công
**Steps:**
1. Login vào tài khoản
2. Vào trang Profile
3. Click "Thay đổi ảnh"
4. Chọn file JPG hợp lệ (< 5MB)
5. Chờ upload hoàn tất

**Expected Result:**
- Toast hiển thị "Cập nhật avatar thành công!"
- Avatar mới hiển thị trên UI
- Redux state được cập nhật với avatar mới
- Database có record mới

**Verify:**
```sql
SELECT id, userName, avatar FROM Users WHERE id = 1;
```

#### ❌ Test Case 2: Upload File Không Hợp Lệ
**Steps:**
1. Chọn file PDF hoặc TXT

**Expected Result:**
- Toast error: "Chỉ chấp nhận file ảnh (JPG, PNG, GIF)"
- Không upload
- Avatar không thay đổi

#### ❌ Test Case 3: Upload File Quá Lớn
**Steps:**
1. Chọn file ảnh > 5MB

**Expected Result:**
- Toast error: "Kích thước ảnh không được vượt quá 5MB"
- Không upload
- Avatar không thay đổi

#### ✅ Test Case 4: Login Hiển Thị Avatar
**Steps:**
1. User đã có avatar trong database
2. Logout
3. Login lại

**Expected Result:**
- Login response chứa avatar
- Redux state có avatar
- Avatar hiển thị ngay trên trang Profile

**Verify Redux:**
```javascript
// Redux state after login
{
  admin: {
    isLoggedIn: true,
    adminInfo: {
      id: 1,
      userName: "john_doe",
      fullName: "John Doe",
      avatar: "1760781305866.jpg", // ✅ Avatar có ở đây
      ...
    }
  }
}
```

#### ✅ Test Case 5: Không Có Avatar
**Steps:**
1. User chưa upload avatar
2. Login vào hệ thống

**Expected Result:**
- Hiển thị initials (chữ cái đầu của tên)
- Background gradient đẹp
- Có nút "Thay đổi ảnh"

### 7. **Kiểm Tra File System**

**Thư mục uploads:**
```bash
ls -la Backend-NodeJs-NguyenLienProject/uploads/
```

**Kết quả mong đợi:**
```
drwxr-xr-x  2 user user 4096 Jan 20 10:00 .
drwxr-xr-x 10 user user 4096 Jan 20 09:00 ..
-rw-r--r--  1 user user 45123 Jan 20 10:15 1760781305866.jpg
-rw-r--r--  1 user user 52341 Jan 20 10:20 1760781317981.jpg
```

### 8. **Debug Issues**

#### Issue: Avatar không hiển thị sau upload
**Solution:**
- Kiểm tra Redux state có cập nhật không
- Kiểm tra file có trong thư mục uploads không
- Kiểm tra CORS settings
- Kiểm tra REACT_APP_BACKEND_URL trong .env

#### Issue: 404 khi load avatar
**Solution:**
- Kiểm tra backend serve static files:
```javascript
// server.js
app.use('/uploads', express.static('uploads'));
```

#### Issue: Avatar không lưu vào database
**Solution:**
- Kiểm tra migration đã chạy chưa
- Kiểm tra userService có lưu avatar không
- Check console logs trong backend

### 9. **Performance Test**

**Upload nhiều avatar liên tiếp:**
- Upload 5 avatar khác nhau
- Mỗi lần upload phải thành công
- Redis state luôn sync với database

### 10. **Security Test**

**Test upload file độc hại:**
- Upload file .exe → Phải bị reject
- Upload file .php → Phải bị reject
- Upload file > 5MB → Phải bị reject

## 📊 Test Summary Template

```
# Avatar Feature Test Report
Date: _______________
Tester: _______________

✅ Migration: PASS / FAIL
✅ Database Column: PASS / FAIL
✅ Backend Upload API: PASS / FAIL
✅ Backend Get Profile API: PASS / FAIL
✅ Login Returns Avatar: PASS / FAIL  ← QUAN TRỌNG!
✅ Frontend Upload: PASS / FAIL
✅ Frontend Display: PASS / FAIL
✅ Redux State: PASS / FAIL
✅ Logout/Login Persistence: PASS / FAIL  ← QUAN TRỌNG!
✅ File Validation: PASS / FAIL

Overall: PASS / FAIL
```

## 🎯 Key Points

1. **Avatar được lưu trong database** ✅
   - Column: `Users.avatar` (VARCHAR)
   - Value: filename (e.g., "1760781305866.jpg")

2. **Login trả về avatar** ✅
   - Fixed trong `authService.js`
   - Avatar trong login response
   - Avatar trong Redux state

3. **Upload lưu vào DB và file system** ✅
   - File → `/uploads/{timestamp}.jpg`
   - Database → `avatar` field

4. **Hiển thị sau login** ✅
   - Redux state có avatar
   - ProfileInfo component render avatar
   - URL: `${BACKEND_URL}/uploads/${avatar}`

**Nếu tất cả đều PASS → Avatar hoạt động 100%!** 🎉

