# ✅ Address System - Basic Setup

## 📦 Những gì được giữ lại

### BACKEND ✅

#### 1. **Address Model**
**File:** `Backend-NodeJs-NguyenLienProject/src/models/address.js`

Fields:
- `userId` - Liên kết với User
- `receiverName` - Tên người nhận
- `receiverPhone` - SĐT người nhận
- `receiverGender` - Giới tính người nhận
- `addressLine1` - Địa chỉ dòng 1
- `addressLine2` - Địa chỉ dòng 2 (optional)
- `city` - Tỉnh/Thành phố
- `district` - Quận/Huyện
- `ward` - Phường/Xã
- `isDefault` - Địa chỉ mặc định

#### 2. **Address Controller**
**File:** `Backend-NodeJs-NguyenLienProject/src/controllers/addressController.js`

Handles all address HTTP requests.

#### 3. **Address Service**
**File:** `Backend-NodeJs-NguyenLienProject/src/services/addressService.js`

Functions:
- `getUserAddresses(userId)` - Lấy tất cả địa chỉ
- `getAddressById(addressId, userId)` - Lấy địa chỉ theo ID
- `createAddress(userId, data)` - Tạo địa chỉ mới
- `updateAddress(addressId, userId, data)` - Cập nhật địa chỉ
- `deleteAddress(addressId, userId)` - Xóa địa chỉ
- `setDefaultAddress(addressId, userId)` - Đặt địa chỉ mặc định
- `getDefaultAddress(userId)` - Lấy địa chỉ mặc định

#### 4. **Address API Routes**

**File:** `Backend-NodeJs-NguyenLienProject/src/routes/apiUser.js`
```javascript
// User routes (requires authentication)
GET    /api/user/addresses                  // Lấy tất cả địa chỉ
GET    /api/user/address/:id                // Lấy địa chỉ theo ID
GET    /api/user/address-default            // Lấy địa chỉ mặc định
POST   /api/user/address-create             // Tạo địa chỉ mới
PUT    /api/user/address-update/:id         // Cập nhật địa chỉ
PUT    /api/user/address-set-default/:id    // Đặt địa chỉ mặc định
DELETE /api/user/address-delete/:id         // Xóa địa chỉ
```

**File:** `Backend-NodeJs-NguyenLienProject/src/routes/apiHomePage.js`
```javascript
// Admin routes (requires admin role)
GET    /api/admin/address-management        // Quản lý tất cả địa chỉ
GET    /api/admin/address-detail/:id        // Chi tiết địa chỉ
POST   /api/admin/address-create            // Tạo địa chỉ (admin)
PUT    /api/admin/address-update/:id        // Cập nhật địa chỉ (admin)
DELETE /api/admin/address-delete/:id        // Xóa địa chỉ (admin)
```

#### 5. **Address Migrations**
**Files:**
- `005-migration-address.js` - Tạo bảng Addresses
- `026-rename-address-columns.js` - Đổi tên fullName → receiverName, phoneNumber → receiverPhone
- `027-add-receiverGender-to-address.js` - Thêm receiverGender

---

### FRONTEND ✅

#### **Address Service**
**File:** `Frontend-ReactJs-NguyenLienProject/src/services/addressService.js`

Functions:
- `getUserAddresses()` - Lấy tất cả địa chỉ của user
- `getAddressById(addressId)` - Lấy địa chỉ theo ID
- `createAddress(addressData)` - Tạo địa chỉ mới
- `updateAddress(addressId, addressData)` - Cập nhật địa chỉ
- `deleteAddress(addressId)` - Xóa địa chỉ
- `setDefaultAddress(addressId)` - Đặt địa chỉ mặc định
- `getDefaultAddress()` - Lấy địa chỉ mặc định

**Exported in:** `src/services/index.js`
```javascript
import { addressService } from './services';
```

---

## ❌ Những gì đã xóa

### Backend:
- ❌ Province, District, Ward models
- ❌ Location migrations (028, 029, 030, 031)
- ❌ Location seeders
- ❌ locationService.js
- ❌ locationController.js
- ❌ apiLocation.js routes

### Frontend:
- ❌ AddressForm component
- ❌ AddressList component
- ❌ AddressSelector component (checkout)
- ❌ CheckoutPage component
- ❌ locationService.js
- ❌ All SCSS files for address components

### Documentation:
- ❌ All address/location/checkout documentation files (15 files)

---

## 🚀 Cách sử dụng (Backend API)

### 1. Create Address
```javascript
POST /api/user/address-create

Body:
{
  "receiverName": "Nguyễn Văn A",
  "receiverPhone": "0123456789",
  "receiverGender": "Nam",
  "addressLine1": "123 Đường ABC",
  "addressLine2": "Gần chợ",
  "city": "TP Hồ Chí Minh",
  "district": "Quận 1",
  "ward": "Phường Bến Nghé",
  "isDefault": false
}

Response:
{
  "errCode": 0,
  "message": "Address created successfully",
  "address": { ... }
}
```

### 2. Get All Addresses
```javascript
GET /api/user/addresses

Response:
{
  "errCode": 0,
  "message": "OK",
  "addresses": [
    {
      "id": 1,
      "receiverName": "Nguyễn Văn A",
      "receiverPhone": "0123456789",
      "city": "TP Hồ Chí Minh",
      "isDefault": true,
      ...
    }
  ]
}
```

### 3. Update Address
```javascript
PUT /api/user/address-update/:id

Body:
{
  "receiverName": "Nguyễn Văn B",
  "addressLine1": "456 Đường XYZ"
}
```

### 4. Set Default
```javascript
PUT /api/user/address-set-default/:id

Response:
{
  "errCode": 0,
  "message": "Default address updated successfully"
}
```

### 5. Delete Address
```javascript
DELETE /api/user/address-delete/:id

Response:
{
  "errCode": 0,
  "message": "Address deleted successfully"
}
```

---

## 🚀 Cách sử dụng (Frontend Service)

### Example: Get Addresses
```javascript
import { addressService } from './services';

// In component
const fetchAddresses = async () => {
  const result = await addressService.getUserAddresses();
  
  if (result.errCode === 0) {
    console.log('Addresses:', result.addresses);
    setAddresses(result.addresses);
  } else {
    console.error('Error:', result.errMessage);
  }
};
```

### Example: Create Address
```javascript
const handleCreateAddress = async () => {
  const newAddress = {
    receiverName: "Nguyễn Văn A",
    receiverPhone: "0123456789",
    receiverGender: "Nam",
    addressLine1: "123 Đường ABC",
    city: "Hà Nội",
    district: "Quận Ba Đình",
    ward: "Phường Điện Biên",
    isDefault: false
  };

  const result = await addressService.createAddress(newAddress);
  
  if (result.errCode === 0) {
    console.log('Created:', result.address);
    // Refresh list
  } else {
    alert(result.errMessage);
  }
};
```

---

## 📝 Validation Rules

### Required fields:
- ✅ `receiverName` - Tên người nhận
- ✅ `receiverPhone` - SĐT người nhận
- ✅ `addressLine1` - Địa chỉ chi tiết
- ✅ `city` - Tỉnh/Thành phố
- ✅ `district` - Quận/Huyện
- ✅ `ward` - Phường/Xã

### Optional fields:
- `receiverGender` - Giới tính
- `addressLine2` - Địa chỉ dòng 2
- `isDefault` - Mặc định (tự động = true nếu là địa chỉ đầu tiên)

---

## 🔒 Security

- ✅ All user routes require authentication (`verifyToken` middleware)
- ✅ Users can only access their own addresses
- ✅ Admin routes require admin role (`isRole('ADMIN')` middleware)

---

## 🎯 Next Steps (Recommendations)

Nếu bạn muốn build UI cho Address:

1. **Option 1: Simple Form** - Tạo form đơn giản với text inputs
   - Pro: Dễ, nhanh
   - Con: User phải tự nhập city/district/ward (có thể sai chính tả)

2. **Option 2: Dropdowns** - Tạo dropdowns tĩnh (hard-code list)
   - Pro: Đơn giản, không cần DB location
   - Con: Phải update code khi có thay đổi

3. **Option 3: Dynamic Dropdowns** - Fetch từ API khác
   - Pro: Luôn cập nhật
   - Con: Phụ thuộc external API

Hiện tại backend đã sẵn sàng, chỉ cần build UI phù hợp với project!

---

**Created:** 2025-10-28
**Status:** ✅ Backend Complete, Frontend Service Ready
**Version:** Basic Setup

