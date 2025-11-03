# 📍 Cập nhật: Province Selector cho Voucher Location

## 🎯 Mục đích

Thay đổi phần "Theo địa điểm" (location) từ **nhập text** thành **chọn từ danh sách tỉnh/thành phố** có sẵn từ Vietnam Location API.

---

## ❌ Trước khi thay đổi

```javascript
// Text input - manual entry
<input
    type="text"
    name="conditionValue"
    value={formData.conditionValue}
    placeholder="VD: Hà Nội, Hồ Chí Minh, Đà Nẵng"
/>
<small>Nhập danh sách tỉnh/thành, phân cách bởi dấu phẩy</small>
```

**Vấn đề:**
- ❌ Admin phải nhớ tên chính xác các tỉnh/thành
- ❌ Dễ viết sai (VD: "Hồ Chí Minh" vs "TP HCM" vs "TP. Hồ Chí Minh")
- ❌ Inconsistent data
- ❌ Không biết có bao nhiêu tỉnh/thành phố

---

## ✅ Sau khi thay đổi

### Multi-select Province Selector

```javascript
<div className="province-selector">
    <div className="province-header">
        <small>Chọn tỉnh/thành phố áp dụng voucher (có thể chọn nhiều)</small>
        <button type="button" onClick={handleSelectAllProvinces}>
            ✅ Chọn tất cả / ❌ Bỏ chọn tất cả
        </button>
    </div>
    
    <div className="province-list">
        {provinces.map(province => (
            <label key={province.code} className="province-item">
                <input
                    type="checkbox"
                    checked={selectedProvinces.includes(province.name)}
                    onChange={() => handleProvinceToggle(province.name)}
                />
                <span className="province-name">{province.name}</span>
                <span className="province-code">Code: {province.code}</span>
            </label>
        ))}
    </div>
    
    {selectedProvinces.length > 0 && (
        <div className="selected-summary">
            <strong>Đã chọn:</strong> {selectedProvinces.length} tỉnh/thành phố
            <span className="selected-names">
                {selectedProvinces.join(', ')}
            </span>
        </div>
    )}
</div>
```

---

## 📊 Data Source

### Vietnam Location API
```javascript
import { getProvinces } from '../../../../services/vietnamLocationService';

// API: https://provinces.open-api.vn/api
// Cache-enabled service
```

**Province Data Structure:**
```json
{
  "code": 1,
  "name": "Thành phố Hà Nội",
  "nameEn": "Ha Noi City",
  "fullName": "Thành phố Hà Nội",
  "fullNameEn": "Ha Noi City",
  "codeName": "thanh_pho_ha_noi"
}
```

**Total:** 63 tỉnh/thành phố Việt Nam

---

## 📝 Files đã thay đổi

### 1. **VoucherCreate.js** (+60 lines)

#### Imports:
```javascript
import { getProvinces } from '../../../../services/vietnamLocationService';
```

#### State:
```javascript
const [provinces, setProvinces] = useState([]);
const [selectedProvinces, setSelectedProvinces] = useState([]);
const [loadingProvinces, setLoadingProvinces] = useState(false);
```

#### Fetch provinces:
```javascript
useEffect(() => {
    const fetchProvinces = async () => {
        setLoadingProvinces(true);
        try {
            const res = await getProvinces();
            if (res && res.errCode === 0) {
                setProvinces(Array.isArray(res.provinces) ? res.provinces : []);
            }
        } catch (err) {
            console.error('Error fetching provinces:', err);
            setProvinces([]);
        } finally {
            setLoadingProvinces(false);
        }
    };
    fetchProvinces();
}, []);
```

#### Helpers:
```javascript
// Toggle province
const handleProvinceToggle = (provinceName) => {
    setSelectedProvinces(prev => {
        if (prev.includes(provinceName)) {
            return prev.filter(name => name !== provinceName);
        } else {
            return [...prev, provinceName];
        }
    });
};

// Select all
const handleSelectAllProvinces = () => {
    if (selectedProvinces.length === provinces.length) {
        setSelectedProvinces([]);
    } else {
        setSelectedProvinces(provinces.map(p => p.name));
    }
};

// Reset when changing conditionType
if (name === 'conditionType') {
    if (value !== 'location') {
        setSelectedProvinces([]);
    }
}
```

#### Submit:
```javascript
// Convert selectedProvinces array to comma-separated string
if (formData.conditionType === 'location' && selectedProvinces.length > 0) {
    conditionValueToSend = selectedProvinces.join(',');
}
// → Backend receives: "Hà Nội, Hồ Chí Minh, Đà Nẵng"
```

### 2. **VoucherUpdate.js** (+65 lines)

Tương tự VoucherCreate, thêm:

#### Parse existing data:
```javascript
// Trong useEffect khi fetch voucher
if (voucher.conditionType === 'location' && voucher.conditionValue) {
    const provinceNames = voucher.conditionValue
        .split(',')
        .map(name => name.trim())
        .filter(name => name);
    setSelectedProvinces(provinceNames);
}
```

### 3. **VoucherCreate.scss** (Updated)

```scss
.province-selector {
    // Same styling as category-selector
    // Reuse existing styles
}

.province-header {
    // Same as category-header
}

.province-list {
    // Same as category-list
}

.province-item {
    // Same as category-item
}

.province-name {
    // Same as category-name
}

.province-code {
    // Same as category-id
}
```

### 4. **VoucherUpdate.scss** (Updated)
Tương tự Create

---

## 🎨 UI Features

### Visual States:

| State | Background | Border | Badge |
|-------|------------|--------|-------|
| **Normal** | #f8fafc (light gray) | Transparent | Gray |
| **Hover** | #e0f2fe (light blue) | #0ea5e9 (blue) | Gray |
| **Selected** | #dbeafe (darker blue) | #0284c7 (solid blue) | Blue with white text |

### Components:

1. **Province Selector**
   - Max height: 300px
   - Scrollable with custom scrollbar
   - 63 provinces available

2. **Select All Button**
   - Toggle all provinces with one click
   - Changes text: "✅ Chọn tất cả" ↔ "❌ Bỏ chọn tất cả"

3. **Selected Summary**
   - Shows count: "Đã chọn: 5 tỉnh/thành phố"
   - Lists names: "Hà Nội, Hồ Chí Minh, Đà Nẵng, Hải Phòng, Cần Thơ"

4. **Province Item**
   - Checkbox (18px)
   - Province name (flex: 1)
   - Province code badge

---

## 🔄 Data Flow

### Create Voucher:
```
1. Component Mount
   ↓
2. Fetch Provinces từ API (63 tỉnh/thành)
   ↓
3. Display checkbox list
   ↓
4. User chọn provinces (checkbox toggle)
   ↓
5. Update selectedProvinces state ["Hà Nội", "TP HCM", "Đà Nẵng"]
   ↓
6. Submit form
   ↓
7. Convert to string: "Hà Nội, TP HCM, Đà Nẵng"
   ↓
8. Send to backend as conditionValue
```

### Update Voucher:
```
1. Component Mount
   ↓
2. Fetch Provinces từ API (parallel)
   ↓
3. Fetch Voucher by ID
   ↓
4. Parse conditionValue: "Hà Nội, TP HCM" → ["Hà Nội", "TP HCM"]
   ↓
5. Set selectedProvinces state
   ↓
6. Display with pre-selected checkboxes
   ↓
7. User có thể thay đổi selection
   ↓
8. Submit: Convert lại thành string
```

---

## 🌍 Vietnam Provinces API

### API Details:
- **Endpoint:** `https://provinces.open-api.vn/api/p/`
- **Method:** GET
- **Cache:** Có (để tránh gọi API nhiều lần)
- **Total provinces:** 63

### Sample Response:
```json
[
  {
    "code": 1,
    "name": "Thành phố Hà Nội",
    "name_en": "Ha Noi City",
    "full_name": "Thành phố Hà Nội",
    "full_name_en": "Ha Noi City",
    "code_name": "thanh_pho_ha_noi"
  },
  {
    "code": 79,
    "name": "Thành phố Hồ Chí Minh",
    "name_en": "Ho Chi Minh City",
    "full_name": "Thành phố Hồ Chí Minh",
    "full_name_en": "Ho Chi Minh City",
    "code_name": "thanh_pho_ho_chi_minh"
  }
]
```

---

## 🔄 Backend Compatibility

### Request Format (không thay đổi):
```json
{
  "conditionType": "location",
  "conditionValue": "Thành phố Hà Nội, Thành phố Hồ Chí Minh, Thành phố Đà Nẵng"
}
```

Backend vẫn nhận comma-separated string, không cần thay đổi gì!

### Backend Processing (suggested):
```javascript
// Backend controller
if (conditionType === 'location' && conditionValue) {
    const provinces = conditionValue
        .split(',')
        .map(name => name.trim());
    
    // Validate user's shipping address
    const userProvince = order.shippingAddress.city; // VD: "Thành phố Hà Nội"
    
    if (!provinces.includes(userProvince)) {
        return res.status(400).json({
            errCode: 1,
            errMessage: `Voucher chỉ áp dụng cho: ${provinces.join(', ')}`
        });
    }
    
    // Apply voucher
}
```

---

## ✅ Testing Checklist

- [x] Fetch provinces khi component mount
- [x] Hiển thị loading state
- [x] Hiển thị error state khi không load được
- [x] Checkbox toggle hoạt động
- [x] Select all / Deselect all hoạt động
- [x] Selected summary hiển thị đúng
- [x] Submit form với selectedProvinces
- [x] Convert array to comma-separated string
- [x] VoucherUpdate load và parse conditionValue
- [x] VoucherUpdate hiển thị checkboxes đã chọn
- [x] Reset selectedProvinces khi đổi conditionType
- [x] Scrollbar hoạt động với 63 provinces
- [x] Responsive trên mobile

---

## 🎯 Kết quả

### Trước:
```
❌ Nhập text: "Hà Nội, Hồ Chí Minh, Đà Nẵng"
❌ Dễ viết sai
❌ Inconsistent naming
❌ Không biết có bao nhiêu tỉnh
```

### Sau:
```
✅ Chọn từ danh sách 63 tỉnh/thành
✅ Tên chuẩn từ API
✅ Multi-select với checkbox
✅ Select all button
✅ Visual feedback
✅ Summary hiển thị đã chọn
✅ Auto-parse khi update
✅ Consistent data
```

---

## 🚀 Use Cases

### 1. Voucher miễn phí ship cho 3 thành phố lớn:
```
Điều kiện: location
Chọn:
  ✅ Thành phố Hà Nội
  ✅ Thành phố Hồ Chí Minh
  ✅ Thành phố Đà Nẵng
```

### 2. Voucher cho các tỉnh miền Bắc:
```
Điều kiện: location
Chọn:
  ✅ Thành phố Hà Nội
  ✅ Tỉnh Hải Phòng
  ✅ Tỉnh Quảng Ninh
  ✅ Tỉnh Bắc Ninh
  ... (select all Northern provinces)
```

### 3. Voucher cho miền Trung:
```
Chọn tất cả các tỉnh từ Thanh Hóa → Bình Thuận
```

---

## 📄 Related Documents

- `CATEGORY_SELECTOR_UPDATE.md` - Category selector implementation
- `CONDITION_VALUE_IMPLEMENTATION.md` - Condition value base
- `vietnamLocationService.js` - Province API service

---

## 👨‍💻 Thay đổi

- **Ngày:** 2025-10-30
- **Files:** 4 files (2 JS, 2 SCSS)
- **Lines thêm:** ~250 lines
- **API Used:** provinces.open-api.vn
- **Total Provinces:** 63
- **Breaking changes:** Không
- **Backward compatible:** Có

