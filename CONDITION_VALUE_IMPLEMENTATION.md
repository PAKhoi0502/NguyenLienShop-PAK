# 📋 Tài liệu: Triển khai Chi tiết Điều kiện Voucher (conditionValue)

## 🎯 Mục đích

Document này ghi lại việc triển khai tính năng **"Chi tiết điều kiện"** (`conditionValue`) cho hệ thống Voucher, khắc phục vấn đề thiếu UI để tạo và chỉnh sửa chi tiết điều kiện.

---

## ❌ Vấn đề ban đầu

### Trước khi sửa:
- ✅ Có dropdown để chọn **LOẠI điều kiện** (`conditionType`)
- ❌ **KHÔNG CÓ** UI để nhập **CHI TIẾT điều kiện** (`conditionValue`)
- ❌ Không thể tạo voucher với điều kiện cụ thể như:
  - Áp dụng cho tỉnh/thành phố nào
  - Số lượng sản phẩm tối thiểu là bao nhiêu
  - Danh mục sản phẩm nào được áp dụng
  - Phân khúc khách hàng nào

### Ảnh hưởng:
- Admin chỉ có thể chọn loại điều kiện nhưng không thể cấu hình chi tiết
- Database field `conditionValue` luôn là `null`
- Tính năng voucher bị giới hạn nghiêm trọng

---

## ✅ Giải pháp đã triển khai

### 1. **Dynamic UI dựa trên conditionType**

Thêm form fields động hiển thị tùy theo loại điều kiện được chọn:

| Loại điều kiện | UI Component | Ví dụ | Bắt buộc |
|----------------|--------------|-------|----------|
| `none` | Không hiển thị | - | - |
| `first_order` | Không hiển thị | - | - |
| `location` | Text Input | "Hà Nội, TP HCM, Đà Nẵng" | Tùy chọn |
| `user_segment` | Dropdown Select | "new", "regular", "vip" | Tùy chọn |
| `specific_category` | Text Input | "1,5,7" hoặc "electronics,fashion" | **Bắt buộc** |
| `min_items` | Number Input | "3" | **Bắt buộc** |

### 2. **Files đã thay đổi**

#### a) `VoucherCreate.js`
**Thêm:**
- UI động cho 4 loại điều kiện (location, user_segment, specific_category, min_items)
- Validation logic cho conditionValue
- Hướng dẫn chi tiết trong HintBox

**Code mới (dòng 258-342):**
```javascript
{/* Chi tiết điều kiện - Hiển thị động dựa trên conditionType */}
{formData.conditionType !== 'none' && formData.conditionType !== 'first_order' && (
    <div className="form-group condition-value-group">
        <label>
            Chi tiết điều kiện:
            {(formData.conditionType === 'min_items' || formData.conditionType === 'specific_category') && 
                <span className="required"> *</span>
            }
        </label>
        
        {/* Location */}
        {formData.conditionType === 'location' && (
            <input
                type="text"
                name="conditionValue"
                value={typeof formData.conditionValue === 'string' ? formData.conditionValue : ''}
                onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditionValue: e.target.value
                }))}
                placeholder="VD: Hà Nội, Hồ Chí Minh, Đà Nẵng"
            />
        )}

        {/* User Segment */}
        {formData.conditionType === 'user_segment' && (
            <select
                name="conditionValue"
                value={formData.conditionValue || ''}
                onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditionValue: e.target.value
                }))}
            >
                <option value="">-- Chọn phân khúc --</option>
                <option value="new">Khách hàng mới</option>
                <option value="regular">Khách hàng thường xuyên</option>
                <option value="vip">Khách hàng VIP</option>
            </select>
        )}

        {/* Specific Category */}
        {formData.conditionType === 'specific_category' && (
            <input
                type="text"
                name="conditionValue"
                value={typeof formData.conditionValue === 'string' ? formData.conditionValue : ''}
                onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditionValue: e.target.value
                }))}
                placeholder="VD: 1,5,7 hoặc electronics,fashion"
                required
            />
        )}

        {/* Min Items */}
        {formData.conditionType === 'min_items' && (
            <input
                type="number"
                name="conditionValue"
                value={typeof formData.conditionValue === 'number' ? formData.conditionValue : ''}
                onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditionValue: parseInt(e.target.value) || 0
                }))}
                placeholder="VD: 3"
                min="1"
                required
            />
        )}
    </div>
)}
```

**Validation mới (dòng 69-82):**
```javascript
// Validation cho conditionValue
if (formData.conditionType === 'min_items') {
    if (!formData.conditionValue || formData.conditionValue <= 0) {
        showToast("error", 'Vui lòng nhập số lượng sản phẩm tối thiểu');
        return;
    }
}

if (formData.conditionType === 'specific_category') {
    if (!formData.conditionValue || !formData.conditionValue.trim()) {
        showToast("error", 'Vui lòng nhập ID hoặc slug danh mục sản phẩm');
        return;
    }
}
```

#### b) `VoucherUpdate.js`
**Thêm:**
- Tương tự VoucherCreate.js
- UI động cho conditionValue (dòng 313-397)
- Validation tương tự (dòng 111-124)

#### c) `VoucherCreate.scss` và `VoucherUpdate.scss`
**Thêm styling cho condition-value-group:**
```scss
.condition-value-group {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 2px solid #0ea5e9;
    border-radius: border-radius(lg);
    padding: spacing(4);
    margin-top: spacing(3);
    position: relative;

    &::before {
        content: '💡';
        position: absolute;
        top: -12px;
        left: 16px;
        background: white;
        padding: 0 spacing(2);
        font-size: 1.2em;
    }

    label {
        color: #0c4a6e;
        font-weight: font-weight(semibold);
    }

    input,
    select {
        border-color: #0ea5e9;

        &:focus {
            border-color: #0284c7;
            box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
        }
    }

    small {
        color: #0369a1;
        font-style: italic;
    }

    @include mobile-only {
        padding: spacing(3);
    }
}
```

---

## 🎨 User Experience

### 1. **Visual Design**
- 💡 Icon chỉ báo rõ ràng
- Gradient màu xanh dương (khác với form chính màu tím) để phân biệt
- Border nổi bật
- Responsive trên mobile

### 2. **Conditional Rendering**
- Chỉ hiển thị khi cần thiết (không hiển thị với `none` và `first_order`)
- Tự động thay đổi UI khi chọn loại điều kiện khác
- Required field được đánh dấu rõ ràng (*)

### 3. **Validation**
- Client-side validation trước khi submit
- Toast notification thân thiện
- HTML5 validation (required, min, number type)

---

## 📝 Hướng dẫn sử dụng

### Tạo voucher với điều kiện cụ thể:

#### 1. **Voucher chỉ áp dụng cho Hà Nội và TP HCM:**
```
Điều kiện áp dụng: Theo địa điểm
Chi tiết điều kiện: Hà Nội, Hồ Chí Minh
```

#### 2. **Voucher cho khách hàng VIP:**
```
Điều kiện áp dụng: Theo phân khúc khách hàng
Chi tiết điều kiện: vip
```

#### 3. **Voucher cho danh mục Electronics và Fashion:**
```
Điều kiện áp dụng: Theo danh mục sản phẩm
Chi tiết điều kiện: 1,5,7 (hoặc electronics,fashion)
```

#### 4. **Voucher khi mua ít nhất 3 sản phẩm:**
```
Điều kiện áp dụng: Số lượng sản phẩm tối thiểu
Chi tiết điều kiện: 3
```

---

## 🔧 Backend Requirements

Backend cần xử lý `conditionValue` với các format sau:

### 1. **Location (String with commas)**
```json
{
  "conditionType": "location",
  "conditionValue": "Hà Nội, Hồ Chí Minh, Đà Nẵng"
}
```

Backend nên:
- Split by comma: `conditionValue.split(',').map(s => s.trim())`
- Validate địa chỉ người dùng có trong list không

### 2. **User Segment (String enum)**
```json
{
  "conditionType": "user_segment",
  "conditionValue": "vip"
}
```

Giá trị hợp lệ: `"new"`, `"regular"`, `"vip"`

### 3. **Specific Category (String with commas)**
```json
{
  "conditionType": "specific_category",
  "conditionValue": "1,5,7"
}
```

Backend nên:
- Split by comma và convert to array
- Validate category IDs tồn tại

### 4. **Min Items (Number)**
```json
{
  "conditionType": "min_items",
  "conditionValue": 3
}
```

Backend validate: `cartItems.length >= conditionValue`

---

## ✅ Testing Checklist

- [ ] Create voucher với location condition
- [ ] Create voucher với user_segment condition
- [ ] Create voucher với specific_category condition
- [ ] Create voucher với min_items condition
- [ ] Update voucher và thay đổi conditionValue
- [ ] Validation hoạt động khi submit form trống
- [ ] UI responsive trên mobile
- [ ] Detail page hiển thị conditionValue đúng
- [ ] Backend nhận và lưu conditionValue chính xác

---

## 📊 Kết quả

### Trước:
- ❌ Không thể tạo voucher với điều kiện cụ thể
- ❌ `conditionValue` luôn là `null`

### Sau:
- ✅ Admin có thể tạo voucher với 4 loại điều kiện chi tiết
- ✅ UI động, thân thiện
- ✅ Validation đầy đủ
- ✅ `conditionValue` được lưu chính xác

---

## 🚀 Tính năng tương lai có thể mở rộng

1. **Category Selector:** Thay text input bằng multi-select dropdown lấy từ API
2. **Location Autocomplete:** Dùng Vietnam provinces API với autocomplete
3. **Advanced Conditions:** Kết hợp nhiều điều kiện (AND/OR logic)
4. **Date Range Conditions:** Áp dụng vào giờ/ngày cụ thể
5. **Payment Method Conditions:** Chỉ áp dụng với phương thức thanh toán nhất định

---

## 👨‍💻 Tác giả & Ngày cập nhật

- **Ngày triển khai:** 2025-10-30
- **Files đã sửa:** 4 files
  - VoucherCreate.js
  - VoucherUpdate.js
  - VoucherCreate.scss
  - VoucherUpdate.scss
- **Lines of code thêm vào:** ~180 lines

---

## 📚 Tham khảo

- VoucherDetail.js đã có sẵn logic hiển thị conditionValue
- Backend service: `/api/admin/discount-create`, `/api/admin/discount-update`
- Related: VOUCHER_SYSTEM_IMPLEMENTATION.md

