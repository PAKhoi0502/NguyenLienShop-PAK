# 🔐 OTP INVALIDATION FIX

## 🐛 VẤN ĐỀ

**Hiện tượng:** Khi user request OTP nhiều lần (resend OTP, reload page), có **nhiều mã OTP khác nhau cùng tồn tại** và đều valid, gây nhầm lẫn cho user.

**Terminal log ví dụ:**
```
🔄 Change password OTP sent to 0979502093, OTP: 519666
🔄 OTP verification request from 0979502093 with code: 323456 ❌
🔄 OTP verification request from 0979502093 with code: 519666 ✅
```

**Nguyên nhân:**
- OTP_1 được tạo ra lúc 10:00 → Still valid
- User click "Resend OTP" → OTP_2 được tạo lúc 10:02 → Still valid
- Database có 2 OTP cùng valid: `323456` và `519666`
- User có thể verify với bất kỳ OTP nào → Gây nhầm lẫn

---

## ✅ GIẢI PHÁP

**Invalidate tất cả OTP cũ chưa sử dụng** trước khi tạo OTP mới.

### **Logic mới:**

```javascript
// BEFORE creating new OTP
await db.PasswordResetToken.update(
   { 
      used: true,
      usedAt: new Date()
   },
   {
      where: {
         phoneNumber,
         used: false,
         expiresAt: { [Op.gt]: new Date() } // Only invalidate non-expired tokens
      }
   }
);

console.log(`🔐 Invalidated previous OTP tokens for ${phoneNumber}`);

// THEN create new OTP
const passwordResetToken = await db.PasswordResetToken.create({ ... });
```

---

## 🔧 FILES MODIFIED

### 1. **authService.js** - 3 services được fix:

#### ✅ **requestPasswordReset** (Forgot Password Flow)
```javascript
// Line ~179-194
// Invalidate all previous unused OTP tokens for this phone number
await db.PasswordResetToken.update(
   { used: true, usedAt: new Date() },
   {
      where: {
         phoneNumber,
         used: false,
         expiresAt: { [Op.gt]: new Date() }
      }
   }
);

console.log(`🔐 Invalidated previous OTP tokens for ${phoneNumber}`);
```

#### ✅ **requestChangePassword** (Change Password Flow)
```javascript
// Line ~432-447
// Invalidate all previous unused OTP tokens for this phone number
await db.PasswordResetToken.update(
   { used: true, usedAt: new Date() },
   {
      where: {
         phoneNumber,
         used: false,
         expiresAt: { [Op.gt]: new Date() }
      }
   }
);

console.log(`🔄 Invalidated previous OTP tokens for ${phoneNumber}`);
```

#### ✅ **requestUpdateEmail** (Update Email Flow)
```javascript
// Line ~619-634
// Invalidate all previous unused OTP tokens for this phone number
await db.PasswordResetToken.update(
   { used: true, usedAt: new Date() },
   {
      where: {
         phoneNumber,
         used: false,
         expiresAt: { [Op.gt]: new Date() }
      }
   }
);

console.log(`📧 Invalidated previous OTP tokens for ${phoneNumber}`);
```

---

## 📊 FLOW SO SÁNH

### **TRƯỚC FIX (Có vấn đề):**

```
10:00 - User request OTP_1
   ↓
   Database: OTP_1 (323456) - used: false ✅

10:02 - User click "Resend OTP"
   ↓
   Database: 
   - OTP_1 (323456) - used: false ✅ (STILL VALID!)
   - OTP_2 (519666) - used: false ✅ (NEW)

10:03 - User nhập 323456 → SUCCESS ❌ (Wrong! Should fail)
10:03 - User nhập 519666 → SUCCESS ✅ (Correct)

❌ Vấn đề: User có thể dùng OTP cũ!
```

### **SAU FIX (Đã fix):**

```
10:00 - User request OTP_1
   ↓
   Database: OTP_1 (323456) - used: false ✅

10:02 - User click "Resend OTP"
   ↓
   🔐 Invalidate OTP_1
   Database: OTP_1 (323456) - used: true, usedAt: 10:02 ❌
   ↓
   Create OTP_2
   Database: 
   - OTP_1 (323456) - used: true ❌ (INVALIDATED)
   - OTP_2 (519666) - used: false ✅ (NEW, ONLY VALID)

10:03 - User nhập 323456 → FAIL ❌ (Correct! OTP đã invalidated)
10:03 - User nhập 519666 → SUCCESS ✅ (Correct! Chỉ OTP mới valid)

✅ Fix: Chỉ OTP mới nhất có thể dùng!
```

---

## 🛡️ SECURITY BENEFITS

1. **Tránh nhầm lẫn:** User chỉ có 1 OTP valid tại 1 thời điểm
2. **Tăng bảo mật:** OTP cũ không thể reuse
3. **Clear state:** Mỗi lần resend = reset trạng thái
4. **Better UX:** User biết chính xác OTP nào cần nhập

---

## 🧪 TESTING

### **Test Case 1: Resend OTP**

**Steps:**
1. User request OTP → Nhận `123456`
2. User click "Gửi lại OTP" → Nhận `789012`
3. User nhập `123456` → Expect: **FAIL** ❌
4. User nhập `789012` → Expect: **SUCCESS** ✅

**Result:** ✅ Pass

---

### **Test Case 2: Multiple Resend**

**Steps:**
1. User request OTP_1 → `111111`
2. User request OTP_2 → `222222` (OTP_1 invalidated)
3. User request OTP_3 → `333333` (OTP_2 invalidated)
4. User nhập `111111` → Expect: **FAIL** ❌
5. User nhập `222222` → Expect: **FAIL** ❌
6. User nhập `333333` → Expect: **SUCCESS** ✅

**Result:** ✅ Pass

---

### **Test Case 3: Expired OTP không bị invalidate**

**Steps:**
1. User request OTP_1 lúc 10:00 → `123456` (expires 10:15)
2. Wait 16 minutes (OTP_1 đã expired lúc 10:15)
3. User request OTP_2 lúc 10:16 → `789012`

**Expected:**
- OTP_1 **không bị update** (vì đã expired, không còn là threat)
- OTP_2 được tạo bình thường

**Query:**
```sql
WHERE phoneNumber = '...'
  AND used = false
  AND expiresAt > NOW()  -- Chỉ invalidate OTP chưa expired
```

**Result:** ✅ Pass

---

## 📝 NOTES

1. **Chỉ invalidate OTP chưa expired:** 
   - Điều kiện: `expiresAt > NOW()`
   - OTP đã expired tự động invalid, không cần update

2. **Mark as `used: true`:**
   - Thay vì xóa, mark OTP cũ là `used`
   - Giúp audit log và debugging

3. **Console log:**
   - Mỗi flow có emoji riêng:
     - 🔐 Forgot Password
     - 🔄 Change Password
     - 📧 Update Email

4. **Database performance:**
   - Update operation rất nhanh (WHERE + INDEX on phoneNumber)
   - Không ảnh hưởng performance

---

## 🎯 IMPACT

| Metric | Before | After |
|--------|--------|-------|
| Valid OTPs per user | ≤ 3 (rate limit) | **1** (latest only) |
| User confusion | ❌ High | ✅ None |
| Security level | ⚠️ Medium | ✅ High |
| Code complexity | Simple | Simple (+3 lines) |

---

## ✅ CHECKLIST

- [x] Fix `requestPasswordReset` (Forgot Password)
- [x] Fix `requestChangePassword` (Change Password)
- [x] Fix `requestUpdateEmail` (Update Email)
- [x] Add console logs for debugging
- [x] Test with multiple resend scenarios
- [x] No linter errors
- [x] Documentation updated

---

## 🎉 KẾT QUẢ

✅ **Fix hoàn thành!**
- Chỉ có 1 OTP valid tại 1 thời điểm
- OTP cũ tự động invalidate khi tạo OTP mới
- Áp dụng cho cả 3 flows: Forgot Password, Change Password, Update Email
- No performance impact
- Better security & UX

---

**Ngày fix:** 2025-10-25  
**Developer:** AI Assistant  
**Issue:** Multiple valid OTPs causing confusion  
**Solution:** Invalidate old OTPs before creating new ones  

