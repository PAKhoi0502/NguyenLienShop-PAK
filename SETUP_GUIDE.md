# 🚀 Hướng dẫn Setup NguyenLienShop trên máy tính mới

## ⚠️ Vấn đề thường gặp: Website reload liên tục

Nếu bạn gặp tình trạng website reload liên tục khi chạy trên máy tính khác, đây là các nguyên nhân và giải pháp:

### 🔧 Các bước setup cần thiết

#### 1. Cài đặt Dependencies
```bash
# Backend
cd Backend-NodeJs-NguyenLienProject
npm install

# Frontend
cd Frontend-ReactJs-NguyenLienProject
npm install
```

#### 2. Kiểm tra file .env
**Backend (.env trong Backend-NodeJs-NguyenLienProject/)**
```env
PORT=8080
NODE_ENV=development
JWT_SECRET=nguyenlien-secret-key
JWT_EXPIRES=1d
```

**Frontend (.env trong Frontend-ReactJs-NguyenLienProject/)**
```env
PORT=3000
NODE_ENV=development
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_ROUTER_BASE_NAME=
```

#### 3. Cài đặt Database
- Tạo database MySQL với tên phù hợp
- Chạy migrations: `npm run migrate` (trong Backend)
- Chạy seeders nếu có: `npm run seed`

### 🚨 Nguyên nhân gây RELOAD LIÊN TỤC

#### A. React Strict Mode
- File `App.js` đang sử dụng `<React.StrictMode>`
- Strict Mode gây re-render 2 lần trong development
- **Giải pháp tạm thời**: Tắt Strict Mode

#### B. AuthDebugSafe Component
- Component debug này chạy liên tục trong development
- Có thể gây infinite loop nếu có lỗi trong auth logic
- **Giải pháp**: Tạm thời comment component này

#### C. Hot Reload Issues
- React Hot Reloading có thể conflict với một số extension VS Code
- Fast Refresh có thể bị lỗi với Redux state

#### D. Port Conflicts
- Đảm bảo port 3000 và 8080 không bị chiếm
- Kiểm tra firewall/antivirus không block các port này

### 🛠️ Giải pháp cụ thể

#### Giải pháp 1: Tạm thời tắt Strict Mode
Trong `Frontend-ReactJs-NguyenLienProject/src/App.js`, comment Strict Mode:
```javascript
function App() {
    return (
        <Provider store={reduxStore}>
            <BrowserRouter>
                {/* <React.StrictMode> */}
                    <CustomScrollbars style={{ height: '100vh', width: '100%' }}>
                        {/* Nội dung app */}
                    </CustomScrollbars>
                {/* </React.StrictMode> */}
            </BrowserRouter>
        </Provider>
    );
}
```

#### Giải pháp 2: Tắt Debug Component
Trong `App.js`, comment debug component:
```javascript
{/* Debug panel - Tạm thời tắt nếu gây reload */}
{/* {process.env.NODE_ENV === 'development' && <AuthDebugSafe />} */}
```

#### Giải pháp 3: Kiểm tra Extensions
Tắt các VS Code extensions có thể xung đột:
- Auto Refresh
- Live Server
- Any React/hot-reload extensions

#### Giải pháp 4: Clear Browser Cache & Storage
```javascript
// Chạy script này trong Console để clear storage
localStorage.clear();
sessionStorage.clear();
// Hoặc chạy file clear_storage.js có sẵn
```

### 📝 Thứ tự chạy ứng dụng

1. **Chạy Backend trước:**
```bash
cd Backend-NodeJs-NguyenLienProject
npm start
# Đợi thấy: "Dự án NguyenLien đã chạy THÀNH CÔNG trên CỔNG 8080"
```

2. **Chạy Frontend sau:**
```bash
cd Frontend-ReactJs-NguyenLienProject  
npm start
# Sẽ tự mở http://localhost:3000
```

### 🔍 Debug Steps nếu vẫn bị reload

1. **Mở Developer Tools (F12)**
2. **Check Console errors** - tìm error messages
3. **Check Network tab** - xem có request lỗi nào không
4. **Check Application tab** - xem localStorage, cookies

### 💡 Lưu ý quan trọng

- **Node.js version**: Khuyến khích >= 16.x
- **npm version**: Khuyến khích >= 8.x  
- **Browser**: Chrome/Edge (tránh Internet Explorer)
- **Antivirus**: Tạm thời tắt hoặc whitelist thư mục project

### 🎯 Test nhanh

Sau khi setup, test bằng cách:
1. Mở http://localhost:3000
2. **Không reload trong 10 giây** = OK ✅
3. **Reload liên tục** = áp dụng các giải pháp trên ❌

---

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề, hãy check:
1. Console log có error gì không
2. Network requests có fail không  
3. Database connection có OK không
4. Ports có bị conflict không

**Tip**: Chạy từng phần riêng lẻ để isolate vấn đề!