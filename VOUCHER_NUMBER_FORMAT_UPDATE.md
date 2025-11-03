# 📝 Voucher Number Format & Default Status Update

## 🎯 Mục tiêu

Cập nhật tính năng voucher với 3 cải tiến quan trọng:

1. ✅ **Cho phép nhập số tiền với dấu chấm phân cách hàng nghìn** (100.000, 25.000, v.v.)
2. ✅ **Mặc định voucher ẩn khi tạo mới** (isActive = false)
3. ✅ **Loại bỏ checkbox "Kích hoạt ngay"** - Admin sẽ bật voucher sau khi kiểm tra

---

## 📋 Chi tiết Changes

### **1. Number Formatting (Dấu chấm phân cách)**

#### **Helper Functions**

Thêm 2 helper functions vào cả `VoucherCreate.js` và `VoucherUpdate.js`:

```javascript
// Helper: Format số với dấu chấm phân cách hàng nghìn (100000 -> 100.000)
const formatNumber = (value) => {
    if (!value) return '';
    // Bỏ tất cả ký tự không phải số
    const numericValue = value.toString().replace(/\D/g, '');
    if (!numericValue) return '';
    // Thêm dấu chấm phân cách hàng nghìn
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Helper: Parse số từ string có dấu chấm thành số (100.000 -> 100000)
const parseNumber = (value) => {
    if (!value) return '';
    return value.toString().replace(/\./g, '');
};
```

#### **Auto-format khi nhập (handleChange)**

```javascript
// Auto-format số tiền cho các trường số
let finalValue = type === 'checkbox' ? checked : value;

// Format số tiền với dấu chấm
if (name === 'discountValue' && formData.discountType === 'fixed') {
    finalValue = formatNumber(value);
} else if (name === 'maxDiscountAmount' || name === 'minOrderValue') {
    finalValue = formatNumber(value);
}
```

**Logic:**
- `discountValue`: Chỉ format khi `discountType = 'fixed'` (vì nếu là `percent` thì là số nhỏ 0-100)
- `maxDiscountAmount`: Luôn format (luôn là tiền)
- `minOrderValue`: Luôn format (luôn là tiền)

#### **Parse trước khi gửi API (handleSubmit)**

```javascript
const payload = {
    ...formData,
    code: formData.code.toUpperCase().trim(),
    discountValue: parseFloat(parseNumber(formData.discountValue)),
    maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(parseNumber(formData.maxDiscountAmount)) : null,
    minOrderValue: formData.minOrderValue ? parseFloat(parseNumber(formData.minOrderValue)) : 0,
    // ... other fields
};
```

#### **Format khi load từ backend (VoucherUpdate only)**

```javascript
setFormData({
    // ...
    discountValue: voucher.discountType === 'fixed' ? formatNumber(voucher.discountValue) : voucher.discountValue,
    maxDiscountAmount: voucher.maxDiscountAmount ? formatNumber(voucher.maxDiscountAmount) : '',
    minOrderValue: voucher.minOrderValue ? formatNumber(voucher.minOrderValue) : '',
    // ...
});
```

---

### **2. Default isActive = false**

#### **VoucherCreate.js**

```javascript
const [formData, setFormData] = useState({
    // ...
    isActive: false  // Mặc định ẩn voucher khi tạo mới
});
```

**Lý do:**
- Admin cần kiểm tra và verify voucher trước khi public
- Tránh voucher bị public nhầm ngay khi tạo
- Admin sẽ chủ động bật voucher khi đã sẵn sàng

---

### **3. Loại bỏ checkbox "Kích hoạt ngay"**

#### **VoucherCreate.js**

**Trước:**
```javascript
<div className="form-group checkbox-group">
    <label>
        <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
        />
        <span>Kích hoạt ngay</span>
    </label>
    <small>Voucher có thể được claim/sử dụng ngay sau khi tạo</small>
</div>
```

**Sau:**
```javascript
// ❌ Removed completely
```

**UI Update:**
- Thêm hint text vào checkbox "Công khai": _"Voucher sẽ ẩn mặc định, bật sau khi kiểm tra."_

**Lý do:**
- Voucher luôn ẩn khi tạo mới (isActive = false)
- Admin sẽ dùng nút **Toggle** trong VoucherManager để bật voucher
- Giảm confusion và UI đơn giản hơn

---

## 🎬 Demo Flow

### **Tạo voucher mới:**

1. Nhập "Giá trị giảm" = `100000`
   - Tự động hiển thị: `100.000`
2. Nhập "Giảm tối đa" = `250000`
   - Tự động hiển thị: `250.000`
3. ✅ Checkbox "Công khai" có hint: _"Voucher sẽ ẩn mặc định, bật sau khi kiểm tra"_
4. ❌ **Không còn** checkbox "Kích hoạt ngay"
5. Submit → Backend nhận:
   ```json
   {
     "discountValue": 100000,
     "maxDiscountAmount": 250000,
     "isActive": false
   }
   ```
6. Voucher được tạo với `isActive: false` (ẩn)
7. Admin vào **VoucherManager** → Click nút **Toggle** để bật voucher khi đã kiểm tra xong

### **Cập nhật voucher:**

1. Load voucher từ backend:
   - `discountValue: 100000` → Hiển thị: `100.000`
   - `maxDiscountAmount: 250000` → Hiển thị: `250.000`
2. Sửa "Giá trị giảm" thành `150000`
   - Tự động hiển thị: `150.000`
3. Submit → Backend nhận: `150000` (số thuần)

---

## 📂 Files Changed

| File | Changes |
|------|---------|
| `VoucherCreate.js` | ✅ Added formatNumber/parseNumber<br>✅ Updated handleChange<br>✅ Updated handleSubmit<br>✅ Set isActive default = false<br>✅ Removed checkbox "Kích hoạt ngay"<br>✅ Updated hint text for "Công khai" |
| `VoucherUpdate.js` | ✅ Added formatNumber/parseNumber<br>✅ Updated handleChange<br>✅ Updated handleSubmit<br>✅ Format on load from backend |

---

## ✅ Testing Checklist

- [ ] Tạo voucher fixed discount với số lớn (100.000, 1.000.000)
- [ ] Tạo voucher percent discount (không bị format)
- [ ] Nhập maxDiscountAmount, minOrderValue với số lớn
- [ ] Verify **KHÔNG còn** checkbox "Kích hoạt ngay"
- [ ] Verify voucher mới có isActive = false
- [ ] Vào VoucherManager → Click Toggle để bật voucher → isActive = true
- [ ] Update voucher với số tiền mới
- [ ] Load voucher hiện tại và kiểm tra số đã format đúng

---

## 🛠️ Technical Implementation

### **Input Type Change:**

**Vấn đề:** HTML `<input type="number">` không chấp nhận dấu chấm (.) làm thousand separator.

**Giải pháp:** Đổi sang `type="text"` với `inputMode="numeric"` cho các trường tiền.

```javascript
// VoucherCreate.js & VoucherUpdate.js

// Giá trị giảm: Dynamic type based on discountType
<input
    type={formData.discountType === 'fixed' ? 'text' : 'number'}
    name="discountValue"
    inputMode={formData.discountType === 'fixed' ? 'numeric' : 'decimal'}
    // ... other props
/>

// Giảm tối đa: Always text
<input
    type="text"
    name="maxDiscountAmount"
    inputMode="numeric"
    // ... other props
/>

// Giá trị đơn tối thiểu: Always text
<input
    type="text"
    name="minOrderValue"
    inputMode="numeric"
    // ... other props
/>
```

**Lợi ích của `inputMode="numeric"`:**
- Trên mobile, hiển thị bàn phím số
- Vẫn cho phép nhập dấu chấm phân cách hàng nghìn
- Không có validation lỗi của `type="number"`

---

## 🐛 Known Issues

### **Warning:**
```
Line 36:11: 'intl' is assigned a value but never used.
```

**Status:** ⚠️ Non-critical warning (không ảnh hưởng functionality)

**Fix (optional):** Xóa dòng `const intl = useIntl();` nếu không dùng i18n cho dynamic messages.

---

## 🚀 Backend Compatibility

Backend không cần thay đổi gì vì:
- Frontend chỉ format để **hiển thị**
- Trước khi gửi API, số được **parse về dạng thuần** (100.000 → 100000)
- Backend vẫn nhận `Number` như cũ

---

## 📖 Tài liệu liên quan

- [CONDITION_VALUE_IMPLEMENTATION.md](./CONDITION_VALUE_IMPLEMENTATION.md) - Dynamic condition value UI
- [CATEGORY_SELECTOR_UPDATE.md](./CATEGORY_SELECTOR_UPDATE.md) - Category selector
- [PROVINCE_SELECTOR_UPDATE.md](./PROVINCE_SELECTOR_UPDATE.md) - Province selector
- [VOUCHER_SYSTEM_IMPLEMENTATION.md](./VOUCHER_SYSTEM_IMPLEMENTATION.md) - Voucher system overview

---

**Ngày cập nhật:** 2025-10-30
**Version:** 1.0.0

