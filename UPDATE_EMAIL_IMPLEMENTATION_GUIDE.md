# 📧 UPDATE EMAIL IMPLEMENTATION GUIDE

## 📋 TỔNG QUAN

Tính năng **Update Email** cho phép người dùng đã đăng nhập:
- **Thêm email** nếu chưa có email trong tài khoản
- **Thay đổi email** nếu đã có email hiện tại

### ✨ ĐẶC ĐIỂM CHÍNH

1. **Xác thực đa lớp**: Mật khẩu hiện tại → OTP qua phone → Email mới
2. **Phân biệt trạng thái**: Tự động nhận diện user có/chưa có email
3. **Bảo mật cao**: Rate limiting, OTP expiration, email validation
4. **UX tốt**: Session persistence, countdown timer, attempts tracking
5. **CSS đồng bộ**: Thiết kế nhất quán với ChangePassword

---

## 🔄 LUỒNG HOẠT ĐỘNG

### **FLOW CHUNG (Áp dụng cho cả Add và Change Email)**

```
Step 1: Xác thực mật khẩu hiện tại
   ↓
   Backend kiểm tra:
   - User có tồn tại?
   - Mật khẩu đúng?
   - Có phone number?
   - Rate limiting (max 3 requests/15 phút)
   ↓
   Generate OTP + resetToken → Gửi về phone
   ↓
   Response: { hasEmail: true/false, currentEmail: string/null }
   ↓
Step 2: Xác thực OTP
   ↓
   Backend kiểm tra:
   - OTP đúng?
   - Chưa hết hạn? (15 phút)
   - Số lần thử? (max 3 attempts)
   ↓
   OTP verified → Chuyển sang step 3
   ↓
Step 3: Nhập email mới
   ↓
   Validate email format + Check duplicate
   ↓
   Backend update email → Success
   ↓
   Refresh user profile trong Redux
```

---

## 🔐 BACKEND IMPLEMENTATION

### 1️⃣ **Service Layer** (`authService.js`)

#### **`requestUpdateEmail`**

```javascript
let requestUpdateEmail = async (userId, currentPassword, ipAddress, userAgent)
```

**Chức năng:**
- Xác thực mật khẩu hiện tại
- Lấy `phoneNumber` từ database
- Rate limiting (3 requests/15 phút)
- Generate `resetToken` + `otpCode`
- Gửi OTP qua SMS (console log trong dev)
- Trả về `hasEmail` và `currentEmail`

**Response:**
```javascript
{
   errCode: 0,
   message: "Mã OTP đã được gửi đến số điện thoại của bạn.",
   resetToken: "abc123...",
   expiresIn: 15,
   hasEmail: true/false,
   currentEmail: "user@example.com" | null
}
```

**Error Codes:**
- `1`: Người dùng không tồn tại
- `2`: Mật khẩu hiện tại không chính xác
- `3`: Tài khoản chưa có số điện thoại
- `4`: Quá nhiều yêu cầu (rate limiting)
- `5`: Không thể gửi OTP

---

#### **`updateEmail`**

```javascript
let updateEmail = async (resetToken, newEmail)
```

**Chức năng:**
- Validate email format (sử dụng `validator.isEmail`)
- Verify `resetToken` (check expiration + used status)
- Check email duplicate (không trùng với user khác)
- Update email vào database
- Mark token as used

**Response:**
```javascript
{
   errCode: 0,
   message: "Cập nhật email thành công!"
}
```

**Error Codes:**
- `1`: Email không hợp lệ
- `2`: Token không hợp lệ hoặc đã hết hạn
- `3`: Email này đã được sử dụng bởi tài khoản khác

---

### 2️⃣ **Controller Layer** (`authController.js`)

#### **`handleRequestUpdateEmail`**

```javascript
const handleRequestUpdateEmail = async (req, res)
```

**Input:**
- `req.body.currentPassword`: Mật khẩu hiện tại
- `req.user.id`: User ID từ JWT token (middleware `verifyToken`)

**Output:**
```javascript
{
   errCode: 0,
   message: "Mã OTP đã được gửi...",
   resetToken: "...",
   expiresIn: 15,
   hasEmail: true,
   currentEmail: "user@example.com"
}
```

---

#### **`handleUpdateEmail`**

```javascript
const handleUpdateEmail = async (req, res)
```

**Input:**
- `req.body.resetToken`: Token từ step 2
- `req.body.newEmail`: Email mới

**Output:**
```javascript
{
   errCode: 0,
   message: "Cập nhật email thành công!"
}
```

---

### 3️⃣ **Routes** (`apiUser.js`)

```javascript
// 📧 Update Email (for authenticated users)
router.post('/request-update-email',
   verifyToken,
   validateBodyFields(['currentPassword']),
   authController.handleRequestUpdateEmail
);

router.post('/verify-email-otp',
   verifyToken,
   validateBodyFields(['phoneNumber', 'otpCode']),
   authController.handleVerifyResetOTP // Reuse từ forgot password
);

router.post('/update-email',
   verifyToken,
   validateBodyFields(['resetToken', 'newEmail']),
   authController.handleUpdateEmail
);
```

**Middleware:**
- `verifyToken`: Bảo vệ route, chỉ cho phép user đã login
- `validateBodyFields`: Validate required fields

---

## 💻 FRONTEND IMPLEMENTATION

### 1️⃣ **Services** (`authService.js`)

```javascript
export const requestUpdateEmail = async (currentPassword) => {
   const res = await axios.post('/api/user/request-update-email', { currentPassword });
   return res;
};

export const verifyEmailOTP = async (phoneNumber, otpCode) => {
   const res = await axios.post('/api/user/verify-email-otp', { phoneNumber, otpCode });
   return res;
};

export const updateEmail = async (resetToken, newEmail) => {
   const res = await axios.post('/api/user/update-email', { resetToken, newEmail });
   return res;
};
```

---

### 2️⃣ **Component** (`UpdateEmail.js`)

#### **State Management**

```javascript
const [step, setStep] = useState(1);              // 1: Password, 2: OTP, 3: Email
const [currentPassword, setCurrentPassword] = useState('');
const [otpCode, setOTPCode] = useState('');
const [newEmail, setNewEmail] = useState('');
const [resetToken, setResetToken] = useState('');
const [countdown, setCountdown] = useState(0);    // OTP countdown (300s)
const [attemptsRemaining, setAttemptsRemaining] = useState(3);
const [hasEmail, setHasEmail] = useState(false);  // User có email chưa?
const [currentEmail, setCurrentEmail] = useState(''); // Email hiện tại
```

---

#### **Step 1: Xác thực mật khẩu**

```javascript
const handleVerifyPassword = async (e) => {
   e.preventDefault();
   
   const response = await requestUpdateEmail(currentPassword);
   
   if (response.errCode === 0) {
      setResetToken(response.resetToken);
      setHasEmail(response.hasEmail);        // ✅ Quan trọng
      setCurrentEmail(response.currentEmail);
      setStep(2);
      setCountdown(300); // 5 phút
   }
};
```

**Hiển thị:**
- Nếu `hasEmail && currentEmail`: Hiển thị email hiện tại
- Title: "Thêm Email" hoặc "Thay đổi Email" (dựa vào `hasEmail`)

---

#### **Step 2: Xác thực OTP**

```javascript
const handleVerifyOTP = async (e) => {
   e.preventDefault();
   
   const response = await verifyEmailOTP(phoneNumber, otpCode);
   
   if (response.errCode === 0) {
      setResetToken(response.resetToken);
      setStep(3);
   } else {
      setAttemptsRemaining(Math.max(0, attemptsRemaining - 1));
      
      if (attemptsRemaining === 0) {
         // Quay về step 1
         setStep(1);
      }
   }
};
```

**Features:**
- ⏱️ Countdown timer (5 phút)
- 🔄 Resend OTP
- ⬅️ Quay lại step 1
- ⚠️ Hiển thị số lần thử còn lại
- 🚫 Auto clear OTP khi hết hạn

---

#### **Step 3: Nhập email mới**

```javascript
const handleUpdateEmail = async (e) => {
   e.preventDefault();
   
   // Validate email format
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(newEmail)) {
      // Show error toast
      return;
   }
   
   const response = await updateEmail(resetToken, newEmail);
   
   if (response.errCode === 0) {
      // Success toast
      
      // Refresh user profile
      const profileResult = await getUserProfile();
      if (profileResult.errCode === 0) {
         dispatch(adminLoginSuccess(profileResult.user));
      }
      
      // Reset form
      setStep(1);
      setCurrentPassword('');
      setNewEmail('');
   }
};
```

**Validation:**
- Email không được để trống
- Email phải đúng format
- Backend kiểm tra duplicate

---

### 3️⃣ **Styling** (`UpdateEmail.scss`)

```scss
.update-email {
    max-width: 500px;
    margin: 0 auto;
    padding: 40px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    
    // ✅ Đồng bộ với ChangePassword.scss
    // ✅ Responsive design
    // ✅ Animations
}
```

**Các class chính:**
- `update-email__title`: Title mỗi step
- `update-email__current`: Hiển thị email hiện tại (nếu có)
- `update-email__form`: Container form
- `update-email__field`: Mỗi input field
- `update-email__btn--primary`: Button chính
- `update-email__btn--outline`: Button phụ
- `update-email__timer`: Countdown display

---

### 4️⃣ **Translations** (`vi.json`)

```json
"update_email": {
    "add_title": "Thêm Email",
    "change_title": "Thay đổi Email",
    "otp_title": "Xác thực OTP",
    "new_email_title": "Nhập Email mới",
    "current_email": "Email hiện tại",
    "password_label": "Mật khẩu hiện tại *",
    "email_label": "Email *",
    "new_email_label": "Email mới *",
    "add_button": "Thêm Email",
    "change_button": "Thay đổi Email",
    // ... và nhiều keys khác
}
```

**Sử dụng:**
```jsx
<FormattedMessage id={hasEmail ? "update_email.change_title" : "update_email.add_title"} />
```

---

### 5️⃣ **Integration** (`AccountPage.js`)

```javascript
import UpdateEmail from './UpdateEmail';

const menuItems = [
   // ...
   {
      id: 'email',
      icon: <FaEnvelope />,
      labelId: 'account.menu.email',
      defaultLabel: 'Cập nhật email',
      component: <UpdateEmail />  // ✅ Đã tích hợp
   },
   // ...
];
```

---

## 🛡️ BẢO MẬT

### **Backend Security**

1. ✅ **Xác thực mật khẩu hiện tại** trước khi gửi OTP
2. ✅ **Rate Limiting**: Max 3 OTP requests trong 15 phút
3. ✅ **OTP Expiration**: OTP có hiệu lực 15 phút
4. ✅ **OTP Attempts**: Max 3 lần verify OTP
5. ✅ **Token-based**: Sử dụng `resetToken` để liên kết các step
6. ✅ **Email Validation**: Validate format + check duplicate
7. ✅ **One-time use**: Token được mark as used sau khi update thành công

### **Frontend Security**

1. ✅ **Protected Routes**: Chỉ user đã login mới truy cập
2. ✅ **JWT Token**: Gửi kèm trong mọi request (axios interceptor)
3. ✅ **Input Validation**: Validate trước khi gửi request
4. ✅ **No session storage**: Không lưu sensitive data (khác với ChangePassword)
5. ✅ **Auto-clear OTP**: Xóa OTP khi hết countdown

---

## 📊 SO SÁNH VỚI CHANGE PASSWORD

| Đặc điểm | Change Password | Update Email |
|----------|-----------------|--------------|
| **OTP Destination** | Phone | Phone |
| **Session Storage** | ✅ Yes (persistence) | ❌ No |
| **Logout sau khi thành công** | ✅ Yes (force logout) | ❌ No |
| **Check duplicate** | N/A | ✅ Yes (email) |
| **Validation** | Password strength | Email format |
| **Refresh Profile** | N/A | ✅ Yes (update Redux) |

---

## 🧪 TESTING CHECKLIST

### **Scenario 1: Thêm email (User chưa có email)**

- [ ] User nhập mật khẩu đúng → OTP được gửi
- [ ] Title hiển thị "Thêm Email"
- [ ] Không hiển thị "Email hiện tại"
- [ ] OTP verify thành công → Chuyển step 3
- [ ] Nhập email mới → Update thành công
- [ ] Button hiển thị "Thêm Email"

### **Scenario 2: Đổi email (User đã có email)**

- [ ] User nhập mật khẩu đúng → OTP được gửi
- [ ] Title hiển thị "Thay đổi Email"
- [ ] Hiển thị email hiện tại
- [ ] OTP verify thành công → Chuyển step 3
- [ ] Nhập email mới → Update thành công
- [ ] Button hiển thị "Thay đổi Email"

### **Scenario 3: Error Handling**

- [ ] Mật khẩu sai → Error toast
- [ ] OTP sai (3 lần) → Quay về step 1
- [ ] OTP hết hạn → Toast warning
- [ ] Email trùng → Error toast "Email đã được sử dụng"
- [ ] Email sai format → Error toast "Email không hợp lệ"
- [ ] Rate limiting → Error toast "Quá nhiều yêu cầu"

### **Scenario 4: UX Testing**

- [ ] Countdown timer hoạt động đúng
- [ ] Resend OTP reset countdown
- [ ] Quay lại step 1 clear hết data
- [ ] Profile được refresh sau update
- [ ] Responsive trên mobile/tablet
- [ ] Loading states hoạt động

---

## 🚀 API ENDPOINTS

```bash
# 1. Request OTP (Protected)
POST /api/user/request-update-email
Authorization: Bearer <JWT_TOKEN>
Body: { "currentPassword": "123456" }

# 2. Verify OTP (Protected)
POST /api/user/verify-email-otp
Authorization: Bearer <JWT_TOKEN>
Body: { "phoneNumber": "0123456789", "otpCode": "123456" }

# 3. Update Email (Protected)
POST /api/user/update-email
Authorization: Bearer <JWT_TOKEN>
Body: { "resetToken": "abc123...", "newEmail": "newemail@example.com" }
```

---

## 📝 NOTES

1. **OTP luôn gửi về phone**, không gửi về email (vì user có thể mất access email cũ)
   - ⚠️ **TODO FUTURE**: Sau này sẽ thay đổi để gửi OTP về email thay vì phone number
2. **Không cần logout** sau khi update email thành công
3. **Profile được refresh** tự động sau update thành công
4. **Reuse `handleVerifyResetOTP`** controller từ forgot password flow
5. **CSS hoàn toàn đồng bộ** với ChangePassword
6. **Translation keys** rõ ràng, dễ maintain
7. **Import fix**: `getUserProfile` nằm trong `userService.js` chứ không phải `authService.js`

---

## ✅ HOÀN THÀNH

- [x] Backend services (`requestUpdateEmail`, `updateEmail`)
- [x] Backend controllers (`handleRequestUpdateEmail`, `handleUpdateEmail`)
- [x] Backend routes (`/request-update-email`, `/verify-email-otp`, `/update-email`)
- [x] Frontend services (axios calls)
- [x] Frontend component (`UpdateEmail.js`)
- [x] Frontend styling (`UpdateEmail.scss`)
- [x] Translations (`vi.json`)
- [x] Integration vào `AccountPage.js`
- [x] Linter check (No errors)

---

## 🎉 KẾT LUẬN

Tính năng **Update Email** đã được implement hoàn chỉnh với:
- ✅ Security tốt (password + OTP + validation)
- ✅ UX tốt (countdown, attempts, auto-refresh)
- ✅ Code clean, maintainable
- ✅ Đồng bộ với design system hiện tại
- ✅ Không có linter errors

User giờ có thể:
1. Thêm email nếu chưa có
2. Đổi email nếu đã có
3. Tất cả đều an toàn và dễ sử dụng!

---

**Ngày hoàn thành:** 2025-10-25
**Developer:** AI Assistant
**Version:** 1.0.0

