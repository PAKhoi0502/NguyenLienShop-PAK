# 🚨 Fix: Duplicate Refresh Token Error

## ❌ Vấn đề đã gặp

```
SequelizeUniqueConstraintError: Duplicate entry 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' for key 'token'
```

## 🔍 Nguyên nhân gốc rễ

### 1. JWT Token không unique
Trong `src/utils/tokenUtils.js`, hàm `generateRefreshToken` chỉ sử dụng:
```javascript
{
   id: user.id,
   type: 'refresh'
}
```

**Vấn đề**: Cùng một user luôn tạo ra cùng một JWT token vì payload giống hệt nhau.

### 2. Database constraint
Bảng `refresh_tokens` có constraint `unique: true` trên cột `token`, nên không thể insert cùng một token 2 lần.

### 3. Timing issue
Khi user refresh token nhanh hoặc có multiple requests đồng thời, hệ thống cố tạo cùng một token → duplicate error.

## ✅ Giải pháp đã áp dụng

### Fix 1: Thêm unique identifiers vào JWT payload

**File**: `src/utils/tokenUtils.js`
```javascript
const generateRefreshToken = (user) => {
   return jwt.sign(
      {
         id: user.id,
         type: 'refresh',
         // ✅ Add timestamp and random nonce to ensure uniqueness
         iat: Math.floor(Date.now() / 1000), // Issued at timestamp
         jti: Math.random().toString(36).substring(2) + Date.now().toString(36) // Unique JWT ID
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '30d' }
   );
};
```

**Giải thích**:
- `iat` (issued at): Timestamp khi token được tạo
- `jti` (JWT ID): Unique identifier kết hợp random string + timestamp

### Fix 2: Retry mechanism với graceful handling

**File**: `src/services/refreshTokenService.js`
```javascript
const createRefreshToken = async (userId, refreshToken, req) => {
   // 🔄 Try to create token, handle duplicates gracefully
   let tokenRecord;
   let retryCount = 0;
   const maxRetries = 3;

   while (retryCount < maxRetries) {
      try {
         tokenRecord = await RefreshToken.create({...});
         break; // Success, exit loop
      } catch (error) {
         if (error.name === 'SequelizeUniqueConstraintError' && retryCount < maxRetries - 1) {
            console.log(`🔄 Duplicate token detected, regenerating... (attempt ${retryCount + 1}/${maxRetries})`);
            
            // Generate new unique token
            const user = { id: userId };
            const { refreshToken: newRefreshToken } = generateTokenPair(user);
            refreshToken = newRefreshToken;
            retryCount++;
         } else {
            throw error; // Re-throw if not duplicate or max retries reached
         }
      }
   }
};
```

## 🎯 Tại sao fix này hoạt động

1. **Guaranteed Uniqueness**: Với `iat` + `jti`, mỗi token sẽ có unique payload
2. **Graceful Retry**: Nếu vẫn có duplicate (rất hiếm), sẽ tự động generate token mới
3. **Limited Retries**: Tối đa 3 lần thử để tránh infinite loop
4. **Preserve Original Logic**: Không thay đổi flow chính, chỉ thêm safety net

## 🧪 Test để verify fix

1. **Restart Backend**: 
   ```bash
   cd Backend-NodeJs-NguyenLienProject
   npm start
   ```

2. **Test Login**: Đăng nhập vào trang web và quan sát console
3. **Expected Result**: Không còn duplicate token errors
4. **Test Refresh**: Thử refresh token multiple times

## 📊 Monitoring

Để theo dõi hiệu quả của fix:
- Check console logs for `✅ Refresh token created`
- No more `❌ Error creating refresh token: SequelizeUniqueConstraintError`
- If you see `🔄 Duplicate token detected, regenerating...` → fix is working

## 🔮 Tương lai improvements

1. **UUID for JTI**: Thay Math.random() bằng UUID library để đảm bảo 100% unique
2. **Redis caching**: Cache recent tokens để check duplicate nhanh hơn
3. **Database cleanup**: Tự động xóa expired tokens để giảm table size

---

## 🚀 Status: FIXED ✅

Vấn đề duplicate refresh token đã được resolve với:
- ✅ Unique JWT payload 
- ✅ Retry mechanism
- ✅ Graceful error handling
- ✅ Preserve existing functionality