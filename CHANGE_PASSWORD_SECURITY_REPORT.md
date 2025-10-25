# 🔒 CHANGE PASSWORD - SECURITY FLOW ANALYSIS

## 📊 **EDGE CASES TESTING REPORT**

### **1️⃣ NHẬP SAI OTP QUÁ NHIỀU LẦN**

#### **Hiện tại:**
- **Frontend**: `attemptsRemaining` khởi tạo = **5 lần**
- **Backend**: `maxAttempts` trong database = **3 lần** ❌ **KHÔNG KHỚP!**

#### **Logic Flow:**
```
User nhập OTP sai lần 1
  ↓
Backend: attempts = 1/3
Frontend: attemptsRemaining = 4/5 ❌ SAI!
  ↓
User nhập OTP sai lần 2
  ↓
Backend: attempts = 2/3
Frontend: attemptsRemaining = 3/5 ❌ SAI!
  ↓
User nhập OTP sai lần 3
  ↓
Backend: attempts = 3/3 → XÓA TOKEN
Frontend: attemptsRemaining = 2/5 ❌ HIỂN THỊ SAI!
  ↓
Backend trả về errCode 429 "too many attempts"
  ↓
Frontend: Reset về step 1 ✅
```

#### **Vấn đề:**
- Số lần thử hiển thị sai lệch giữa frontend và backend
- User thấy "Còn 2 lần thử" nhưng thực tế đã hết

#### **Giải pháp:**
```javascript
// Frontend - ChangePassword.js line 23
const [attemptsRemaining, setAttemptsRemaining] = useState(3); // Thay đổi từ 5 → 3
```

---

### **2️⃣ THOÁT RA GIỮA CHỪNG KHI ĐANG XÁC THỰC OTP**

#### **Trường hợp A: Thoát ra tab khác / Đóng tab**
```javascript
// ChangePassword.js lines 37-53
React.useEffect(() => {
    const handleBeforeUnload = () => {
        if (step >= 2) {
            sessionStorage.removeItem('changePasswordFlow');
        }
    };
    
    return () => {
        if (step >= 2) {
            sessionStorage.removeItem('changePasswordFlow'); // ✅ XÓA SESSION
        }
    };
}, [step]);
```

**Kết quả:** ✅ Session được xóa khi đóng tab

#### **Trường hợp B: Refresh trang (F5)**
```javascript
// ChangePassword.js lines 55-115
React.useEffect(() => {
    const savedState = sessionStorage.getItem('changePasswordFlow');
    if (savedState) {
        const { step, resetToken, expiryTime, attempts } = JSON.parse(savedState);
        
        if (expiryTime && now < expiryTime) {
            setStep(step);
            setResetToken(resetToken);
            setAttemptsRemaining(attempts);
            // ✅ RESTORE STATE
        } else {
            sessionStorage.removeItem('changePasswordFlow');
            // ✅ HẾT HẠN → XÓA
        }
    }
}, []);
```

**Kết quả:** ✅ State được restore nếu còn trong thời hạn

#### **Trường hợp C: Navigate sang page khác trong app**
```javascript
return () => {
    if (step >= 2) {
        sessionStorage.removeItem('changePasswordFlow'); // ✅ XÓA
    }
};
```

**Kết quả:** ✅ Session được xóa khi unmount component

---

### **3️⃣ HẾT THỜI GIAN COUNTDOWN (TIMEOUT)**

#### **Countdown Logic:**
```javascript
// ChangePassword.js lines 164-172
React.useEffect(() => {
    let timer;
    if (countdown > 0) {
        timer = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
    }
    return () => clearInterval(timer);
}, [countdown]);
```

#### **Khi countdown = 0:**
- ✅ Không thể submit OTP (button disabled)
- ✅ Hiện button "Resend OTP" 
- ❌ **KHÔNG TỰ ĐỘNG RESET về step 1**
- ❌ **User vẫn có thể nhập OTP (input không disabled)**

#### **Backend validation:**
```javascript
// authService.js
const resetToken = await db.PasswordResetToken.findOne({
    where: {
        expiresAt: { [Op.gt]: new Date() } // ✅ Check expiry
    }
});

if (!resetToken) {
    return { errCode: 1, errMessage: "Token đã hết hạn" };
}
```

**Kết quả:** 
- ⚠️ Frontend cho phép user nhập OTP sau khi hết countdown
- ✅ Backend reject nếu token expired
- ⚠️ UX không tốt: User nhập xong mới biết hết hạn

---

### **4️⃣ THOÁT RA KHI ĐANG Ở BƯỚC NHẬP MẬT KHẨU MỚI (STEP 3)**

#### **Security Policy:**
```javascript
// ChangePassword.js lines 66-78
if (savedStep === 3) {
    sessionStorage.removeItem('changePasswordFlow');
    toast("Phiên đã được xóa vì lý do bảo mật");
    return; // ❌ KHÔNG RESTORE STEP 3
}
```

#### **Expiry Time:**
```javascript
// ChangePassword.js lines 127-130
const isPasswordStep = step === 3;
const securityExpiryTime = isPasswordStep ?
    Date.now() + (2 * 60 * 1000) : // ⚠️ CHỈ 2 PHÚT cho step 3
    actualExpiryTime; // 5 phút cho step 2
```

#### **Kết quả:**
✅ **Bảo mật tốt:**
- Step 3 KHÔNG được restore sau refresh
- Chỉ có 2 phút để nhập mật khẩu mới (vs 5 phút ở step 2)
- Phải verify OTP lại nếu refresh

---

## 🐛 **CÁC VẤN ĐỀ CẦN FIX**

### **❌ CRITICAL: Attempts mismatch**
```javascript
// File: ChangePassword.js line 23
const [attemptsRemaining, setAttemptsRemaining] = useState(5); // ❌ SAI

// Fix:
const [attemptsRemaining, setAttemptsRemaining] = useState(3); // ✅ ĐÚNG
```

### **⚠️ MEDIUM: Countdown expired UX**
```javascript
// Khi countdown = 0, nên:
// 1. Disable OTP input
// 2. Auto clear OTP value
// 3. Show message "OTP đã hết hạn"

// Thêm vào useEffect countdown:
React.useEffect(() => {
    if (countdown === 0 && step === 2) {
        setOTPCode(''); // Clear OTP
        toast("OTP đã hết hạn. Vui lòng gửi lại mã mới.");
    }
}, [countdown, step]);
```

### **⚠️ MINOR: Resend OTP reset attempts**
```javascript
// ChangePassword.js lines 408-410
const handleResendOTP = async () => {
    // ...
    setAttemptsRemaining(5); // ❌ SAI - phải là 3
    
    // Fix:
    setAttemptsRemaining(3); // ✅ ĐÚNG
}
```

---

## ✅ **CÁC ĐIỂM MẠNH**

1. ✅ **Session management tốt**: Clear khi unmount
2. ✅ **Security timeout**: Step 3 chỉ có 2 phút
3. ✅ **No restore step 3**: Bảo mật cao
4. ✅ **Backend validation**: Check expiry và attempts
5. ✅ **Force logout**: Invalidate all sessions sau đổi mật khẩu
6. ✅ **Rate limiting**: 3 requests / 15 phút

---

## 📝 **KHUYẾN NGHỊ**

### **Ưu tiên cao:**
1. Fix attempts mismatch (5 → 3)
2. Disable OTP input khi countdown = 0
3. Auto clear OTP và show message khi hết hạn

### **Ưu tiên trung bình:**
4. Thêm visual indicator khi còn < 30s
5. Confirm dialog trước khi navigate away

### **Cải thiện UX:**
6. Progress bar cho countdown
7. Show token expiry time (không chỉ countdown)
8. Better error messages với retry suggestions

