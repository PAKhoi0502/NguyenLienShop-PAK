# DEBUG PRODUCT CATEGORY STATS API - Error 500

## 🔍 Phân tích lỗi

**Lỗi hiện tại:** `Request failed with status code 500` 
**Endpoint:** `GET /api/admin/product-category-stats`
**Root cause:** Sử dụng sai field name trong database query

## ✅ Thay đổi đã thực hiện

### 1. **Fixed Backend Service** (`dashboardService.js`)

**Before (Lỗi):**
```javascript
const activeProducts = await db.Product.count({
   where: { status: 1 }  // ❌ Field 'status' không tồn tại
});
```

**After (Fixed):**
```javascript  
const activeProducts = await db.Product.count({
   where: { isActive: true }  // ✅ Đúng field name
});
```

### 2. **Model Schema Verification**

**Product Model:**
- ✅ `nameProduct`: String
- ✅ `price`: Float  
- ✅ `isActive`: Boolean (not `status`)
- ✅ `isNew`: Boolean
- ✅ `isBestSeller`: Boolean

**Category Model:**
- ✅ `nameCategory`: String
- ✅ `slug`: String
- ✅ `isActive`: Boolean (not `status`)  
- ✅ `description`: Text

### 3. **Added Debug Logging**
```javascript
console.log('🔍 Starting getProductCategoryStats...');
console.log('📦 Product model available:', !!db.Product);
console.log('📁 Category model available:', !!db.Category);
console.log('📊 Total products:', totalProducts);
console.log('✅ Active products:', activeProducts);
```

## 🛠️ Debug Steps

### 1. **Backend Console Check**
Khi gọi API, backend console sẽ hiển thị:
```
🔍 Starting getProductCategoryStats...
📦 Product model available: true
📁 Category model available: true  
📊 Total products: X
✅ Active products: Y
📊 Total categories: A
✅ Active categories: B
🎯 Final result: { ... }
```

### 2. **Test API Manually**
```bash
# Test với curl
curl -X GET "http://localhost:8080/api/admin/product-category-stats" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Hoặc run test script
node simple_test_api.js
```

### 3. **Database Verification**
```sql
-- Kiểm tra data có tồn tại không
SELECT COUNT(*) as total_products FROM Products;
SELECT COUNT(*) as active_products FROM Products WHERE isActive = 1;
SELECT COUNT(*) as total_categories FROM Categories;  
SELECT COUNT(*) as active_categories FROM Categories WHERE isActive = 1;
```

## 🔄 Next Steps

1. **Restart Backend Server** để áp dụng changes
2. **Check Backend Logs** khi gọi API từ frontend
3. **Verify Database** có data products/categories không
4. **Test API** với curl hoặc Postman trước
5. **Frontend Test** sau khi backend working

## 📋 Expected API Response

```json
{
  "errCode": 0,
  "data": {
    "products": {
      "total": 156,
      "active": 142,
      "inactive": 14
    },
    "categories": {
      "total": 28, 
      "active": 26,
      "inactive": 2
    },
    "summary": {
      "totalItems": 184,
      "activeItems": 168,
      "inactiveItems": 16
    }
  },
  "message": "Lấy thống kê sản phẩm và danh mục thành công"
}
```

## 🚨 Nếu vẫn lỗi 500

1. **Check Database Connection**: Models có connect được DB không
2. **Check Table Names**: `Products` vs `Product`, `Categories` vs `Category`  
3. **Check Column Names**: `isActive` có tồn tại không
4. **Check Sequelize Version**: Syntax có compatible không
5. **Check Permissions**: Admin token có hợp lệ không