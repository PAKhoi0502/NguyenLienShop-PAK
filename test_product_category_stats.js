// Test script để kiểm tra API product-category-stats
// Chạy script này để test endpoint mới

const testProductCategoryStats = async () => {
    const API_BASE = 'http://localhost:8080/api/admin';

    console.log('🧪 Testing Product Category Stats API...');

    try {
        // Test API call (cần có valid auth token)
        const response = await fetch(`${API_BASE}/product-category-stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE', // Thay bằng token thực
            },
            credentials: 'include'
        });

        console.log('📡 Response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Response:');
            console.log('📊 Products:', data.data.products);
            console.log('📁 Categories:', data.data.categories);
            console.log('📈 Summary:', data.data.summary);
        } else {
            console.log('❌ API Error:', response.status, response.statusText);
            const errorData = await response.json().catch(() => null);
            if (errorData) {
                console.log('Error details:', errorData);
            }
        }
    } catch (error) {
        console.error('🔥 Network Error:', error);
    }
};

// Hướng dẫn sử dụng:
console.log(`
🔧 HƯỚNG DẪN TEST API:

1. Đảm bảo backend server đang chạy trên port 8080
2. Login để lấy token hợp lệ  
3. Thay 'YOUR_TOKEN_HERE' bằng token thực
4. Chạy: testProductCategoryStats()

📋 Hoặc test trực tiếp với curl:
curl -X GET "http://localhost:8080/api/admin/product-category-stats" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  --cookie-jar cookies.txt

🎯 Expected response format:
{
  "errCode": 0,
  "data": {
    "products": { "total": X, "active": Y, "inactive": Z },
    "categories": { "total": A, "active": B, "inactive": C },
    "summary": { "totalItems": X+A, "activeItems": Y+B }
  },
  "message": "Lấy thống kê sản phẩm và danh mục thành công"
}
`);

// Export for use
if (typeof module !== 'undefined') {
    module.exports = { testProductCategoryStats };
}