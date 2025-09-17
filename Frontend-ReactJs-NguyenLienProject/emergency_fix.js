// 🚨 EMERGENCY FIX - Chạy file này nếu website reload liên tục
// Cách chạy: Mở Developer Tools (F12) > Console > Copy-paste code này và Enter

console.log('🔧 Đang clear storage và reset React state...');

// 1. Clear tất cả storage data
try {
   localStorage.clear();
   sessionStorage.clear();
   console.log('✅ Đã clear localStorage và sessionStorage');
} catch (error) {
   console.log('❌ Lỗi khi clear storage:', error);
}

// 2. Clear cookies (nếu có)
try {
   document.cookie.split(";").forEach(function (c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   console.log('✅ Đã clear cookies');
} catch (error) {
   console.log('❌ Lỗi khi clear cookies:', error);
}

// 3. Thông báo reload
console.log('🔄 Sẽ reload trang sau 2 giây...');
setTimeout(() => {
   window.location.reload();
}, 2000);

console.log(`
🎯 HƯỚNG DẪN TIẾP THEO:
1. Nếu vẫn reload liên tục sau khi chạy script này
2. Hãy tạm thời comment dòng <React.StrictMode> trong App.js  
3. Và comment component <AuthDebugSafe /> trong App.js
4. Sau đó restart cả Frontend và Backend

📋 Quick Fix trong App.js:
   {/* <React.StrictMode> */}
       {/* Nội dung app */}
   {/* </React.StrictMode> */}

   {/* {process.env.NODE_ENV === 'development' && <AuthDebugSafe />} */}
`);