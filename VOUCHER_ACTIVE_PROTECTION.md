# 🔒 Voucher Active Protection - Ngăn chặn Update/Delete khi đang hoạt động

## 🎯 Mục tiêu

Ngăn chặn admin vô tình **cập nhật** hoặc **xóa** voucher khi voucher đang hoạt động (`isActive: true`), tránh ảnh hưởng đến user đang sử dụng voucher.

**Logic:** Admin phải **TẮT voucher** trước khi có thể update hoặc delete.

---

## 🚫 Hành vi mới

### **Khi voucher đang hoạt động (isActive: true):**

| Hành động | Trước | Sau |
|-----------|-------|-----|
| **Cập nhật** | ✅ Cho phép | ❌ Block + Toast warning |
| **Xóa** | ✅ Cho phép | ❌ Block + Toast warning |
| **Toggle (Tắt)** | ✅ Cho phép | ✅ Cho phép |
| **Xem chi tiết** | ✅ Cho phép | ✅ Cho phép |

### **Khi voucher đã tắt (isActive: false):**

| Hành động | Trạng thái |
|-----------|-----------|
| **Cập nhật** | ✅ Cho phép |
| **Xóa** | ✅ Cho phép |
| **Toggle (Bật)** | ✅ Cho phép |
| **Xem chi tiết** | ✅ Cho phép |

---

## 🎬 Demo Flow

### **Scenario 1: Cố gắng update voucher đang hoạt động**

1. Voucher có trạng thái: ✅ **Hoạt động**
2. Admin click nút **"Cập nhật"**
3. ❌ **Toast error:** _"Vui lòng tắt voucher trước khi cập nhật"_
4. Không navigate đến trang update

**✅ Cách đúng:**
1. Click nút **Toggle** để tắt voucher → Trạng thái: ❌ **Đã tắt**
2. Click nút **"Cập nhật"** → ✅ Navigate đến trang update
3. Sau khi update xong → Toggle lại để bật

---

### **Scenario 2: Cố gắng xóa voucher đang hoạt động**

1. Voucher có trạng thái: ✅ **Hoạt động**
2. Admin click nút **"Xóa"**
3. ❌ **Toast error:** _"Không thể xóa voucher đang hoạt động. Vui lòng tắt voucher trước khi xóa."_
4. Không hiển thị SweetAlert confirmation

**✅ Cách đúng:**
1. Click nút **Toggle** để tắt voucher → Trạng thái: ❌ **Đã tắt**
2. Click nút **"Xóa"** → ✅ Hiển thị SweetAlert confirmation
3. Xác nhận xóa → Voucher bị xóa

---

## 🔧 Implementation Details

### **1. VoucherDelete.js**

**Logic:**
- Kiểm tra `voucher.isActive` trước khi show SweetAlert
- Nếu `isActive = true` → Show toast error và return
- Nếu `isActive = false` → Tiếp tục flow xóa bình thường

```javascript
const handleDelete = async () => {
    if (!voucher || !voucher.id) {
        showToast("error", 'Không tìm thấy voucher');
        return;
    }

    // Check if voucher is active - cannot delete active vouchers
    if (voucher.isActive) {
        showToast("error", 'Không thể xóa voucher đang hoạt động. Vui lòng tắt voucher trước khi xóa.');
        return;
    }

    // Bước 1: Xác nhận lần 1 (tiếp tục flow như cũ)
    // ...
};
```

**UI:**
- Nút "Xóa" vẫn hiển thị bình thường
- Khi click → Check logic và show toast nếu không được phép

---

### **2. VoucherManager.js**

**Logic:**
- Trong `handleUpdateClick`, tìm voucher từ state `vouchers`
- Kiểm tra `isActive` trước khi navigate
- Nếu `isActive = true` → Show toast error và return
- Nếu `isActive = false` → Navigate đến trang update

```javascript
const handleUpdateClick = (clickedVoucher) => {
    const realVoucher = vouchers.find(v => v.id === clickedVoucher.id);
    if (realVoucher?.isActive) {
        showToast("error", 'Vui lòng tắt voucher trước khi cập nhật');
        return;
    }
    navigate(`/admin/homepage-management/voucher-management/voucher-update/${clickedVoucher.id}`);
};
```

**UI:**
- Nút "Cập nhật" vẫn hiển thị bình thường
- Khi click → Check logic và show toast nếu không được phép

---

## 💡 Lý do thiết kế

### **Tại sao không disable nút?**

✅ **UI nhất quán** - Tất cả voucher đều hiển thị đủ 4 nút  
✅ **Rõ ràng hơn** - Toast error giải thích lý do không được phép  
✅ **Workflow tự nhiên** - Admin click vào mới biết cần tắt voucher trước  
✅ **Tương thích với AnnouncementManager** - Cùng pattern  

### **Tại sao phải tắt trước khi update?**

🔒 **An toàn dữ liệu** - Tránh thay đổi voucher đang được user sử dụng  
🔒 **Tránh nhầm lẫn** - User có thể đang claim voucher lúc admin update  
🔒 **Best practice** - Giống như deploy production (downtime → update → uptime)  

---

## 📊 So sánh với Announcement

| Feature | Announcement | Voucher |
|---------|-------------|---------|
| **Block Update khi Active** | ✅ Yes | ✅ Yes |
| **Block Delete khi Active** | ✅ Yes | ✅ Yes |
| **Toast message** | ✅ Yes | ✅ Yes |
| **Toggle button** | ✅ Yes | ✅ Yes |
| **Disable button** | ❌ No (show toast) | ❌ No (show toast) |

---

## 🎨 User Experience

### **Admin workflow:**

```
┌─────────────────────────────────────┐
│  Muốn update/delete voucher          │
└──────────────┬──────────────────────┘
               │
               ▼
         ┌──────────┐
         │ isActive? │
         └─────┬────┘
               │
       ┌───────┴────────┐
       │                │
      YES              NO
       │                │
       ▼                ▼
  ┌─────────┐    ┌───────────┐
  │ 1. Tắt   │    │ Cho phép  │
  │ voucher  │    │ ngay      │
  │ (Toggle) │    └───────────┘
  └────┬────┘
       │
       ▼
  ┌─────────┐
  │ 2. Update│
  │ hoặc Xóa │
  └────┬────┘
       │
       ▼
  ┌─────────┐
  │ 3. Bật   │
  │ lại (nếu│
  │ cần)     │
  └─────────┘
```

---

## 📂 Files Changed

| File | Changes |
|------|---------|
| `VoucherDelete.js` | ✅ Added `isActive` check before delete<br>✅ Show toast error if active |
| `VoucherManager.js` | ✅ Added `isActive` check in `handleUpdateClick`<br>✅ Show toast error if active |

---

## ✅ Testing Checklist

- [ ] **Update voucher đang hoạt động** → Toast error
- [ ] **Update voucher đã tắt** → Navigate thành công
- [ ] **Xóa voucher đang hoạt động** → Toast error
- [ ] **Xóa voucher đã tắt** → SweetAlert confirmation hiển thị
- [ ] **Tắt voucher → Update** → Thành công
- [ ] **Tắt voucher → Xóa** → Thành công
- [ ] **Toggle voucher** → Vẫn hoạt động bình thường
- [ ] **Xem chi tiết** → Không bị ảnh hưởng

---

## 🐛 Known Warnings

```
Line 20:11: 'intl' is assigned a value but never used.
Line 63:8: React Hook useEffect has a missing dependency: 'fetchVouchers'.
```

**Status:** ⚠️ Non-critical warnings (không ảnh hưởng functionality)

---

## 🔗 Tài liệu liên quan

- [VOUCHER_NUMBER_FORMAT_UPDATE.md](./VOUCHER_NUMBER_FORMAT_UPDATE.md) - Number formatting & default status
- [VOUCHER_MANAGER_SIMPLIFIED.md](./VOUCHER_MANAGER_SIMPLIFIED.md) - Simplified table view
- [VOUCHER_SYSTEM_IMPLEMENTATION.md](./VOUCHER_SYSTEM_IMPLEMENTATION.md) - Voucher system overview

---

**Ngày cập nhật:** 2025-10-30  
**Version:** 1.0.0  
**Tham khảo:** AnnouncementManager pattern

