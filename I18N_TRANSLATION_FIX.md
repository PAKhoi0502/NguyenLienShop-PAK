# 🌐 Fix: Internationalization Translation Key Error

## ❌ Lỗi gặp phải

```
Error: [@formatjs/intl Error MISSING_TRANSLATION] Missing message: "header.language_en" for locale "en", using default message (Đã có lỗi xảy ra) as fallback.
```

## 🔍 Nguyên nhân gốc rễ

**Translation key không khớp** giữa component và file translation:

### Lỗi trong HeaderPublic.js:
```javascript
messageId={`header.language_${lang}`}  // ❌ Sai key
```

### Key đúng trong file translation:
```json
"header_public": {
   "language_vi": "Language: Vietnamese", 
   "language_en": "Language: English"
}
```

## 🔧 Chi tiết vấn đề

1. **Component sử dụng key sai**: `HeaderPublic.js` gọi `header.language_en`
2. **File translation có key đúng**: `en.json` có `header_public.language_en`  
3. **React Intl không tìm thấy**: Key không match → fallback message
4. **Console error**: Missing translation warning

## ✅ Giải pháp đã áp dụng

### Sửa trong HeaderPublic.js:
```javascript
// ❌ Trước khi sửa
messageId={`header.language_${lang}`}

// ✅ Sau khi sửa  
messageId={`header_public.language_${lang}`}
```

### Kết quả:
- ✅ `header_public.language_vi` → "Language: Vietnamese"
- ✅ `header_public.language_en` → "Language: English"  
- ✅ Không còn console error
- ✅ Toast hiển thị đúng message

## 🎯 Tại sao fix này hoạt động

1. **Key Consistency**: Đồng bộ key giữa component và translation file
2. **Namespace Structure**: Tuân theo pattern `section.subsection.key`
3. **React Intl**: FormattedMessage tìm được đúng translation
4. **Fallback Prevention**: Không còn dùng default message

## 🏗️ Pattern đúng cho Translation Keys

### Cấu trúc file translation:
```json
{
   "header_public": {
      "language_changed": "Language changed",
      "language_vi": "Language: Vietnamese", 
      "language_en": "Language: English"
   },
   "header_admin": {
      "language_changed": "Language changed",
      "language_vi": "Language: Vietnamese",
      "language_en": "Language: English" 
   }
}
```

### Cách sử dụng trong component:
```javascript
// ✅ Public header
titleId="header_public.language_changed"
messageId={`header_public.language_${lang}`}

// ✅ Admin header  
titleId="header_admin.language_changed"
messageId={`header_admin.language_${lang}`}
```

## 📊 Verification Steps

1. **Không còn console errors**: Check Developer Tools Console
2. **Toast hiển thị đúng**: Thay đổi ngôn ngữ và xem toast message
3. **Translation hoạt động**: Message hiển thị đúng tiếng Việt/English
4. **No fallback**: Không còn thấy "Đã có lỗi xảy ra"

## 🔮 Best Practices

1. **Consistent Naming**: Dùng underscore `_` thay vì dot `.` trong namespace
2. **Component Grouping**: Group keys theo component (header_public, header_admin)
3. **Validation**: Always check translation keys exist in ALL language files
4. **Fallback Messages**: Provide meaningful defaultMessage in FormattedMessage

---

## 🚀 Status: FIXED ✅

Lỗi i18n translation key đã được resolve:
- ✅ Fixed key mismatch in HeaderPublic.js
- ✅ Translation keys now consistent  
- ✅ No more console errors
- ✅ Toast messages display correctly