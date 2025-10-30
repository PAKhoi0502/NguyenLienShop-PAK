# 📍 Dropdown Cascading - Hướng Dẫn Sử Dụng

## 🎉 Tính Năng Mới

Hệ thống **Dropdown Cascading** cho địa chỉ Việt Nam đã được tích hợp vào form nhập địa chỉ!

### Tính năng:
- ✅ Dropdown Tỉnh/Thành phố (63 tỉnh)
- ✅ Dropdown Quận/Huyện (tự động load theo tỉnh)
- ✅ Dropdown Phường/Xã (tự động load theo quận)
- ✅ Caching để tối ưu performance
- ✅ Loading states khi fetch data
- ✅ Validation đầy đủ
- ✅ Mobile responsive
- ✅ i18n support (EN/VI)

---

## 🗂️ Files Đã Tạo/Cập Nhật

### 1. **Service Mới**
```
src/services/vietnamLocationService.js
```
- Fetch dữ liệu từ API `provinces.open-api.vn`
- Cache results để tránh gọi API nhiều lần
- Helper functions: `getProvinces()`, `getDistricts()`, `getWards()`

### 2. **Component Updated**
```
src/components/address/AddressForm.js
src/components/address/AddressForm.scss
```
- Thay input text bằng dropdown select
- Cascading logic: Tỉnh → Quận → Xã
- Loading spinners cho mỗi dropdown
- Validation cải thiện

### 3. **Translations Updated**
```
src/translations/en.json
src/translations/vi.json
```
- Thêm keys cho dropdown placeholders
- Error messages mới

---

## 🚀 Cách Sử Dụng

### User Experience Flow:

```
1. User click "Thêm địa chỉ mới"
   ↓
2. Form mở ra
   ↓
3. User chọn Tỉnh/Thành phố
   → Dropdown Quận/Huyện tự động load
   ↓
4. User chọn Quận/Huyện
   → Dropdown Phường/Xã tự động load
   ↓
5. User chọn Phường/Xã
   ↓
6. User nhập địa chỉ cụ thể (số nhà, đường...)
   ↓
7. Submit → Lưu vào database
```

### Data Flow:

```javascript
// 1. Load provinces on form open
getProvinces() → Cache → Dropdown

// 2. User selects province
handleProvinceChange(provinceCode)
  → getDistricts(provinceCode)
  → Cache
  → Populate district dropdown

// 3. User selects district
handleDistrictChange(districtCode)
  → getWards(districtCode)
  → Cache
  → Populate ward dropdown

// 4. Submit form
{
  city: "TP. Hồ Chí Minh",      // Tên đầy đủ
  district: "Quận 1",            // Tên đầy đủ
  ward: "Phường Bến Nghé",       // Tên đầy đủ
  addressLine1: "123 Đường ABC", // User input
  ...
}
```

---

## 🧪 Testing Guide

### 1. **Test Dropdown Cascading**

**Steps:**
1. Login vào tài khoản user
2. Vào trang "Account Page"
3. Click menu "Sổ địa chỉ"
4. Click button "Thêm địa chỉ mới"

**Expected:**
- ✅ Form modal mở ra
- ✅ Dropdown "Tỉnh/Thành phố" đã có 63 options
- ✅ Dropdown "Quận/Huyện" disabled (placeholder: "Chọn tỉnh/thành phố trước")
- ✅ Dropdown "Phường/Xã" disabled (placeholder: "Chọn quận/huyện trước")

### 2. **Test Province Selection**

**Steps:**
1. Chọn "TP. Hồ Chí Minh" từ dropdown Tỉnh

**Expected:**
- ✅ Loading spinner xuất hiện bên cạnh dropdown Quận
- ✅ Sau 0.5-1s, dropdown Quận được enable
- ✅ Dropdown Quận có ~20 quận/huyện của TP.HCM
- ✅ Dropdown Xã vẫn disabled

### 3. **Test District Selection**

**Steps:**
1. Chọn "Quận 1" từ dropdown Quận

**Expected:**
- ✅ Loading spinner xuất hiện bên cạnh dropdown Xã
- ✅ Sau 0.5-1s, dropdown Xã được enable
- ✅ Dropdown Xã có ~10 phường của Quận 1

### 4. **Test Form Submission**

**Steps:**
1. Điền đầy đủ form:
   - Xưng hô: Anh
   - Tên: Nguyễn Văn A
   - SĐT: 0123456789
   - Tỉnh: TP. Hồ Chí Minh
   - Quận: Quận 1
   - Xã: Phường Bến Nghé
   - Địa chỉ: 123 Đường ABC
2. Click "Lưu"

**Expected:**
- ✅ Form validate thành công
- ✅ API call POST /api/user/address-create
- ✅ Toast success notification
- ✅ Địa chỉ mới xuất hiện trong danh sách
- ✅ Dữ liệu lưu đúng:
  ```json
  {
    "city": "Thành phố Hồ Chí Minh",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé"
  }
  ```

### 5. **Test Validation**

**Steps:**
1. Mở form
2. Không chọn gì, click "Lưu"

**Expected:**
- ✅ Error messages xuất hiện:
  - "Vui lòng nhập tên người nhận"
  - "Vui lòng nhập số điện thoại"
  - "Vui lòng chọn Tỉnh/Thành phố"
  - "Vui lòng chọn Quận/Huyện"
  - "Vui lòng chọn Phường/Xã"
  - "Vui lòng nhập địa chỉ cụ thể"

### 6. **Test Edit Mode**

**Steps:**
1. Click "Sửa" trên 1 địa chỉ đã có
2. Form mở với dữ liệu cũ

**Expected:**
- ⚠️ **LƯU Ý**: Khi edit, dropdowns sẽ về trạng thái mặc định
- ✅ User cần chọn lại Tỉnh → Quận → Xã
- ✅ Hoặc giữ nguyên text cũ nếu không thay đổi

### 7. **Test Caching**

**Steps:**
1. Mở form lần 1 → Chọn TP.HCM → Đóng form
2. Mở form lần 2 → Chọn TP.HCM

**Expected:**
- ✅ Lần 1: API call đến provinces.open-api.vn (có loading)
- ✅ Lần 2: Không có API call (dùng cache, instant load)

### 8. **Test Mobile Responsive**

**Steps:**
1. Mở DevTools
2. Switch to mobile view (iPhone 12, Galaxy S20...)
3. Mở form address

**Expected:**
- ✅ Dropdown hiển thị đúng trên mobile
- ✅ Select options dễ chọn (không bị nhỏ)
- ✅ Layout không bị vỡ

---

## 📊 Data Structure

### API Response Format:

**Provinces:**
```json
[
  {
    "code": "79",
    "name": "Thành phố Hồ Chí Minh",
    "name_en": "Ho Chi Minh City",
    "full_name": "Thành phố Hồ Chí Minh",
    "code_name": "thanh_pho_ho_chi_minh"
  }
]
```

**Districts:**
```json
[
  {
    "code": "760",
    "name": "Quận 1",
    "name_en": "District 1",
    "full_name": "Quận 1",
    "province_code": "79"
  }
]
```

**Wards:**
```json
[
  {
    "code": "26734",
    "name": "Phường Bến Nghé",
    "name_en": "Ben Nghe Ward",
    "full_name": "Phường Bến Nghé",
    "district_code": "760"
  }
]
```

### Database Storage:

**Table: Addresses**
```sql
city     VARCHAR  -- "Thành phố Hồ Chí Minh" (tên đầy đủ)
district VARCHAR  -- "Quận 1" (tên đầy đủ)
ward     VARCHAR  -- "Phường Bến Nghé" (tên đầy đủ)
```

---

## 🔧 Troubleshooting

### Issue 1: Dropdown không load

**Possible causes:**
- API `provinces.open-api.vn` down
- Network error
- CORS issue

**Solution:**
```javascript
// Check console for errors
// Check Network tab in DevTools
// Verify API endpoint: https://provinces.open-api.vn/api/p/
```

### Issue 2: Quận/Huyện không load sau khi chọn Tỉnh

**Check:**
- Console có error không?
- Network tab có request đến `/api/p/{code}?depth=2` không?
- Response có field `districts` không?

### Issue 3: Cache không hoạt động

**Check:**
```javascript
// Open vietnamLocationService.js
// Verify cache variables: provincesCache, districtsCache, wardsCache
// Check if clearLocationCache() was called accidentally
```

---

## 🎯 Performance Metrics

### Expected Performance:

| Action | Time | Note |
|--------|------|------|
| Load provinces (first time) | 300-500ms | API call |
| Load provinces (cached) | < 1ms | From memory |
| Load districts (first time) | 200-400ms | API call |
| Load districts (cached) | < 1ms | From memory |
| Load wards (first time) | 200-400ms | API call |
| Load wards (cached) | < 1ms | From memory |

### API Endpoints:

```
GET https://provinces.open-api.vn/api/p/
GET https://provinces.open-api.vn/api/p/{provinceCode}?depth=2
GET https://provinces.open-api.vn/api/d/{districtCode}?depth=2
```

---

## 🚀 Future Enhancements (Optional)

### 1. **Fallback to Static JSON**
Nếu API down, dùng static JSON file:
```javascript
import vietnamData from './data/vietnam-locations.json';
```

### 2. **Add Codes to Database**
Lưu thêm `cityCode`, `districtCode`, `wardCode`:
```javascript
{
  city: "Thành phố Hồ Chí Minh",
  cityCode: "79",
  district: "Quận 1",
  districtCode: "760",
  ward: "Phường Bến Nghé",
  wardCode: "26734"
}
```

### 3. **Shipping Fee Calculation**
```javascript
const calculateShippingFee = (cityCode, districtCode) => {
  if (cityCode === "79") { // TP.HCM
    if (["760", "761", "762"].includes(districtCode)) {
      return 30000; // Nội thành
    }
    return 50000; // Ngoại thành
  }
  return 70000; // Tỉnh khác
};
```

### 4. **Search/Filter**
Thêm search box trong dropdown:
```javascript
<input type="text" placeholder="Tìm kiếm tỉnh..." />
```

---

## ✅ Checklist

Trước khi deploy production:

- [ ] Test tất cả 63 tỉnh/thành phố
- [ ] Test ít nhất 10 quận/huyện khác nhau
- [ ] Test create/edit/delete address
- [ ] Test validation (empty fields, invalid phone)
- [ ] Test mobile responsive
- [ ] Test i18n (chuyển EN/VI)
- [ ] Test caching (mở/đóng form nhiều lần)
- [ ] Test với network slow (throttle to 3G)
- [ ] Test API timeout handling
- [ ] Test với different browsers (Chrome, Firefox, Safari)

---

## 📞 Support

Nếu có vấn đề, check:
1. Console errors
2. Network tab (API calls)
3. Redux DevTools (state)
4. Toast notifications (error messages)

---

**Happy Coding! 🎉**

