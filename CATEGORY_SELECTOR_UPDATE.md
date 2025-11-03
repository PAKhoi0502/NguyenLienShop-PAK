# 📁 Cập nhật: Category Selector cho Voucher

## 🎯 Mục đích

Thay đổi logic "Chi tiết điều kiện" cho **specific_category** từ **nhập text** thành **chọn từ danh sách categories** có sẵn trong hệ thống.

---

## 💡 Ý tưởng của User

> "Mình sẽ set danh mục trước rồi mình sẽ vào tạo voucher để add vào (ví danh mục có 3 sản phẩm thì mình sẽ tạo combo 3 sản phẩm đó để giảm giá)"

**Use case thực tế:**
1. Admin tạo categories trong hệ thống (VD: "Áo nam", "Giày nữ", "Phụ kiện")
2. Khi tạo voucher, admin chọn categories từ danh sách
3. Voucher sẽ áp dụng cho tất cả sản phẩm thuộc các categories đã chọn
4. Ví dụ: Voucher giảm 20% cho combo "Áo nam + Giày nam"

---

## ❌ Trước khi thay đổi

```javascript
// VoucherCreate.js - OLD
<input
    type="text"
    name="conditionValue"
    value={formData.conditionValue}
    onChange={handleChange}
    placeholder="VD: 1,5,7 hoặc electronics,fashion"
/>
<small>Nhập ID hoặc slug danh mục, phân cách bởi dấu phẩy</small>
```

**Vấn đề:**
- ❌ Admin phải nhớ hoặc tra cứu ID categories
- ❌ Dễ nhập sai ID
- ❌ Không biết category nào đang có trong hệ thống
- ❌ UX kém, không user-friendly

---

## ✅ Sau khi thay đổi

### 1. **Multi-select Checkbox List**

```javascript
// VoucherCreate.js - NEW
<div className="category-selector">
    <div className="category-header">
        <small>Chọn danh mục sản phẩm áp dụng voucher (có thể chọn nhiều)</small>
        <button type="button" onClick={handleSelectAllCategories}>
            {selectedCategories.length === categories.length ? 
                '❌ Bỏ chọn tất cả' : '✅ Chọn tất cả'}
        </button>
    </div>
    
    <div className="category-list">
        {categories.map(category => (
            <label key={category.id} className="category-item">
                <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                />
                <span className="category-name">
                    {category.name || category.categoryName}
                </span>
                <span className="category-id">ID: {category.id}</span>
            </label>
        ))}
    </div>
    
    {selectedCategories.length > 0 && (
        <div className="selected-summary">
            <strong>Đã chọn:</strong> {selectedCategories.length} danh mục
            <span className="selected-ids">
                (ID: {selectedCategories.join(', ')})
            </span>
        </div>
    )}
</div>
```

### 2. **Tính năng mới:**

| Tính năng | Mô tả |
|-----------|-------|
| ✅ **Fetch Categories từ API** | Tự động lấy danh sách categories từ backend |
| ✅ **Multi-select** | Chọn nhiều categories cùng lúc |
| ✅ **Select All Button** | Chọn/bỏ chọn tất cả categories một click |
| ✅ **Visual Feedback** | Highlight categories đã chọn |
| ✅ **Scrollable List** | Max height 300px với custom scrollbar |
| ✅ **Selected Summary** | Hiển thị tổng số đã chọn và list IDs |
| ✅ **Loading State** | Hiển thị "Đang tải danh mục..." |
| ✅ **Empty State** | Hiển thị cảnh báo nếu chưa có category |
| ✅ **Parse Existing Data** | VoucherUpdate tự động parse conditionValue và hiển thị categories đã chọn |

---

## 📝 Files đã thay đổi

### 1. **VoucherCreate.js** (+~80 lines)

#### Imports:
```javascript
import { getAllCategories } from '../../../../services/categoryService';
import { useState, useEffect } from 'react';
```

#### State management:
```javascript
const [categories, setCategories] = useState([]);
const [selectedCategories, setSelectedCategories] = useState([]);
const [loadingCategories, setLoadingCategories] = useState(false);
```

#### Fetch categories:
```javascript
useEffect(() => {
    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const res = await getAllCategories();
            if (res && res.errCode === 0) {
                setCategories(Array.isArray(res.categories) ? res.categories : []);
            } else if (Array.isArray(res)) {
                setCategories(res);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    };
    fetchCategories();
}, []);
```

#### Helper functions:
```javascript
// Toggle category
const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
        if (prev.includes(categoryId)) {
            return prev.filter(id => id !== categoryId);
        } else {
            return [...prev, categoryId];
        }
    });
};

// Select all
const handleSelectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
        setSelectedCategories([]);
    } else {
        setSelectedCategories(categories.map(cat => cat.id));
    }
};

// Reset khi thay đổi conditionType
const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'conditionType' && value !== 'specific_category') {
        setSelectedCategories([]);
    }
    // ...
};
```

#### Submit:
```javascript
// Convert selectedCategories array to comma-separated string
let conditionValueToSend = formData.conditionValue;
if (formData.conditionType === 'specific_category' && selectedCategories.length > 0) {
    conditionValueToSend = selectedCategories.join(',');
}
```

#### Validation:
```javascript
if (formData.conditionType === 'specific_category') {
    if (selectedCategories.length === 0) {
        showToast("error", 'Vui lòng chọn ít nhất một danh mục sản phẩm');
        return;
    }
}
```

### 2. **VoucherUpdate.js** (+~90 lines)

Tương tự VoucherCreate.js, thêm:

#### Parse existing conditionValue:
```javascript
// Trong useEffect khi fetch voucher
if (voucher.conditionType === 'specific_category' && voucher.conditionValue) {
    const categoryIds = voucher.conditionValue
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
    setSelectedCategories(categoryIds);
}
```

### 3. **VoucherCreate.scss** (+~150 lines CSS)

```scss
.category-selector {
    margin-top: spacing(2);

    .category-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: spacing(3);

        .btn-select-all {
            background: #0ea5e9;
            color: white;
            padding: spacing(2) spacing(3);
            // ... transitions, hover effects
        }
    }

    .category-list {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #bae6fd;
        background: white;
        
        // Custom scrollbar
        &::-webkit-scrollbar {
            width: 8px;
        }
        
        .category-item {
            display: flex;
            align-items: center;
            gap: spacing(2);
            padding: spacing(2) spacing(3);
            background: #f8fafc;
            border: 2px solid transparent;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
                background: #e0f2fe;
                border-color: #0ea5e9;
            }

            &:has(input:checked) {
                background: #dbeafe;
                border-color: #0284c7;
                // Highlight style
            }

            input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: #0ea5e9;
            }

            .category-name {
                flex: 1;
                font-weight: medium;
                color: #0c4a6e;
            }

            .category-id {
                font-size: small;
                color: #64748b;
                background: #e2e8f0;
                padding: spacing(1) spacing(2);
                border-radius: border-radius(sm);
            }
        }
    }

    .selected-summary {
        margin-top: spacing(3);
        padding: spacing(3);
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        border-left: 4px solid #0ea5e9;
        color: #0c4a6e;

        .selected-ids {
            display: block;
            margin-top: spacing(1);
            font-family: monospace;
            color: #0369a1;
        }
    }
}
```

### 4. **VoucherUpdate.scss** (+~150 lines CSS)
Tương tự VoucherCreate.scss

---

## 🎨 UI/UX Features

### Visual States:

1. **Normal State:**
   - Light gray background (#f8fafc)
   - Transparent border
   
2. **Hover State:**
   - Light blue background (#e0f2fe)
   - Blue border (#0ea5e9)
   - Transform translateY(-1px)

3. **Selected State:**
   - Darker blue background (#dbeafe)
   - Solid blue border (#0284c7)
   - Category name bold
   - Category ID badge blue with white text

4. **Loading State:**
   - "Đang tải danh mục..." với italic style

5. **Empty State:**
   - "Không có danh mục nào. Vui lòng tạo danh mục trước." màu đỏ

### Accessibility:
- ✅ Checkbox có `accent-color` cho modern browsers
- ✅ Label clickable toàn bộ area
- ✅ Keyboard navigation support
- ✅ Custom scrollbar for better UX

---

## 📊 Data Flow

### Create Voucher:
```
1. Component Mount
   ↓
2. Fetch Categories từ API
   ↓
3. Display checkbox list
   ↓
4. User chọn categories (checkbox toggle)
   ↓
5. Update selectedCategories state [1, 5, 7]
   ↓
6. Submit form
   ↓
7. Convert to string: "1,5,7"
   ↓
8. Send to backend as conditionValue
```

### Update Voucher:
```
1. Component Mount
   ↓
2. Fetch Categories từ API (parallel)
   ↓
3. Fetch Voucher by ID
   ↓
4. Parse conditionValue: "1,5,7" → [1, 5, 7]
   ↓
5. Set selectedCategories state
   ↓
6. Display with pre-selected checkboxes
   ↓
7. User có thể thay đổi selection
   ↓
8. Submit: Convert lại thành string
```

---

## 🔄 Backend Compatibility

### Request Format (không thay đổi):
```json
{
  "conditionType": "specific_category",
  "conditionValue": "1,5,7"
}
```

Backend vẫn nhận comma-separated string, không cần thay đổi gì!

### Backend Processing (suggested):
```javascript
// Backend controller
if (conditionType === 'specific_category' && conditionValue) {
    const categoryIds = conditionValue
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
    
    // Validate categories exist
    const categories = await Category.findAll({
        where: { id: categoryIds }
    });
    
    if (categories.length !== categoryIds.length) {
        return res.status(400).json({
            errCode: 1,
            errMessage: 'Một số category không tồn tại'
        });
    }
    
    // Apply voucher logic
    // Check if cart contains products from these categories
}
```

---

## ✅ Testing Checklist

- [x] Fetch categories khi component mount
- [x] Hiển thị loading state
- [x] Hiển thị empty state khi không có category
- [x] Checkbox toggle hoạt động
- [x] Select all / Deselect all hoạt động
- [x] Selected summary hiển thị đúng
- [x] Submit form với selectedCategories
- [x] Convert array to comma-separated string
- [x] Validation khi chưa chọn category
- [x] VoucherUpdate load và parse conditionValue
- [x] VoucherUpdate hiển thị checkboxes đã chọn
- [x] Reset selectedCategories khi đổi conditionType
- [x] Responsive trên mobile
- [x] Scrollbar hoạt động với nhiều categories

---

## 🎯 Kết quả

### Trước:
```
❌ Nhập text: "1,5,7"
❌ Phải nhớ ID
❌ Dễ lỗi
❌ Không biết category nào đang có
```

### Sau:
```
✅ Chọn từ danh sách có sẵn
✅ Thấy tên categories
✅ Multi-select với checkbox
✅ Select all button
✅ Visual feedback
✅ Summary hiển thị đã chọn
✅ Auto-parse khi update
```

---

## 🚀 Future Enhancements

1. **Search/Filter categories:** Thêm input search khi có nhiều categories
2. **Category tree:** Hiển thị hierarchical nếu có parent-child
3. **Product count:** Hiển thị số sản phẩm trong mỗi category
4. **Drag & Drop:** Reorder categories priority
5. **Bulk actions:** Select categories by group

---

## 📄 Related Documents

- `CONDITION_VALUE_IMPLEMENTATION.md` - Implementation ban đầu
- `VOUCHER_SYSTEM_IMPLEMENTATION.md` - Tổng quan hệ thống
- Backend: `src/services/categoryService.js` - API endpoint

---

## 👨‍💻 Thay đổi

- **Ngày:** 2025-10-30
- **Files:** 4 files (2 JS, 2 SCSS)
- **Lines thêm:** ~400 lines
- **Breaking changes:** Không
- **Backward compatible:** Có (backend không cần thay đổi)

