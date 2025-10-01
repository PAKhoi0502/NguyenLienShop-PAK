import axios from '../axios';

const instance = axios.create({
   baseURL: 'http://localhost:8080',
   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

instance.interceptors.request.use(
   (config) => {
      const token = localStorage.getItem('token');
      if (token && config.url.includes('/admin/')) {
         config.headers.Authorization = `Bearer ${token}`;
      } else {
         delete config.headers.Authorization;
      }
      return config;
   },
   (error) => Promise.reject(error)
);

export const getCategoryById = async (id) => {
   try {
      if (!id) {
         return { errCode: 1, errMessage: 'ID không hợp lệ' };
      }

      const response = await instance.get('api/admin/category', {
         params: { id },
         headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
         }
      });

      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server' };
      }

      if (response.data.id) {
         return {
            errCode: 0,
            category: response.data,
            errMessage: 'OK'
         };
      }

      return {
         errCode: 404,
         errMessage: 'Không tìm thấy danh mục'
      };

   } catch (error) {
      if (error.response) {
         if (error.response.status === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy danh mục' };
         }
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền truy cập' };
         }
      }
      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi khi tải danh mục'
      };
   }
};

export const getAllCategories = async () => {
   try {
      const response = await instance.get('api/admin/category-management');
      return response.data;
   } catch (error) {
      return { errCode: -1, errMessage: 'Không thể lấy danh sách danh mục.' };
   }
};

export const createCategory = async (categoryData) => {
   try {
      const response = await instance.post('api/admin/category-create', categoryData);
      return response.data;
   } catch (error) {
      return { errCode: -1, errMessage: 'Lỗi khi tạo danh mục' };
   }
};

export const updateCategory = async (data) => {
   try {
      if (!data || typeof data !== 'object' || !data.id) {
         return { errCode: 1, errMessage: 'Dữ liệu cập nhật không hợp lệ' };
      }

      const allowedFields = ['id', 'nameCategory', 'description'];
      const filteredData = {};
      allowedFields.forEach(field => {
         if (data[field] !== undefined) {
            filteredData[field] = data[field];
         }
      });
      if (!filteredData.id || !filteredData.nameCategory) {
         return { errCode: 1, errMessage: 'Thiếu thông tin bắt buộc' };
      }

      const response = await instance.put('api/admin/category-update', filteredData);
      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server' };
      }
      if (response.data.errCode === 0) {
         return response.data;
      }
      if (response.data.errCode === 1) {
         return { errCode: 1, errMessage: response.data.errMessage || 'Không tìm thấy danh mục' };
      }
      return { errCode: -1, errMessage: response.data.errMessage || 'Lỗi khi cập nhật danh mục' };
   } catch (error) {
      if (error.response) {
         if (error.response.status === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy danh mục' };
         }
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền truy cập' };
         }
      }
      return { errCode: -1, errMessage: error.response?.data?.errMessage || 'Lỗi khi cập nhật danh mục' };
   }
};

export const deleteCategory = async (id) => {
   try {
      if (!id) {
         return { errCode: 1, errMessage: 'ID danh mục không hợp lệ' };
      }
      const response = await instance.delete('api/admin/category-delete', {
         data: { id }
      });
      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
      }
      if (typeof response.data.errCode !== 'undefined') {
         return response.data;
      }
      return {
         errCode: 0,
         message: 'Xóa danh mục thành công',
         ...response.data
      };
   } catch (error) {
      if (error.response) {
         if (error.response.status === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy danh mục' };
         }
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền xóa danh mục' };
         }
         if (error.response.status === 400) {
            return {
               errCode: 1,
               errMessage: error.response.data?.errMessage || 'Dữ liệu không hợp lệ'
            };
         }
         if (error.response.status === 409) {
            return {
               errCode: 409,
               errMessage: 'Không thể xóa danh mục đang được sử dụng'
            };
         }
      }
      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi khi xóa danh mục'
      };
   }
};

export const getActiveCategories = async (id, isActive) => {
   try {
      if (!id) {
         return { errCode: 1, errMessage: 'ID danh mục không hợp lệ' };
      }

      if (typeof isActive !== 'boolean') {
         return { errCode: 1, errMessage: 'Trạng thái hoạt động không hợp lệ' };
      }

      const response = await instance.put('api/admin/category-active', {
         id,
         isActive
      });

      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
      }

      if (typeof response.data.errCode !== 'undefined') {
         return response.data;
      }

      return {
         errCode: 0,
         message: 'Cập nhật trạng thái danh mục thành công',
         ...response.data
      };

   } catch (error) {
      if (error.response) {
         if (error.response.status === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy danh mục' };
         }
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền cập nhật trạng thái danh mục' };
         }
         if (error.response.status === 400) {
            return {
               errCode: 1,
               errMessage: error.response.data?.errMessage || 'Dữ liệu không hợp lệ'
            };
         }
      }

      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi khi cập nhật trạng thái danh mục'
      };
   }
};

export const getAllProducts = async () => {
   try {
      const response = await instance.get('api/admin/product-management', {
         headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
         }
      });

      if (!response || !response.data) {
         return {
            errCode: -1,
            errMessage: 'Không nhận được phản hồi từ server',
            products: []
         };
      }

      if (Array.isArray(response.data)) {
         return {
            errCode: 0,
            message: 'Lấy danh sách sản phẩm thành công',
            products: response.data
         };
      }

      if (typeof response.data === 'object') {
         if (response.data.errCode === 0) {
            return {
               errCode: 0,
               message: 'Lấy danh sách sản phẩm thành công',
               products: Array.isArray(response.data.products) ? response.data.products : []
            };
         }

         if (response.data.errCode !== undefined) {
            return {
               ...response.data,
               products: []
            };
         }
      }

      return {
         errCode: -1,
         errMessage: 'Định dạng dữ liệu không hợp lệ',
         products: []
      };

   } catch (error) {
      if (error.response) {
         if (error.response.status === 401) {
            return {
               errCode: 401,
               errMessage: 'Không có quyền truy cập sản phẩm',
               products: []
            };
         }
         if (error.response.status === 400) {
            return {
               errCode: 1,
               errMessage: error.response.data?.errMessage || 'Yêu cầu không hợp lệ',
               products: []
            };
         }
      }

      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi khi lấy danh sách sản phẩm',
         products: []
      };
   }
};

export const addProductForCategory = async (categoryId, productIds) => {
   try {
      if (!categoryId) {
         return { errCode: 1, errMessage: 'ID danh mục không hợp lệ' };
      }

      if (!Array.isArray(productIds) || productIds.length === 0) {
         return { errCode: 1, errMessage: 'Danh sách sản phẩm không hợp lệ' };
      }

      const response = await instance.post('api/admin/category-add-product', {
         categoryId,
         productIds
      });

      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
      }

      if (response.data.errCode !== undefined) {
         return response.data;
      }

      return {
         errCode: 0,
         message: 'Thêm sản phẩm cho danh mục thành công',
         data: response.data
      };

   } catch (error) {
      if (error.response) {
         if (error.response.status === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy danh mục' };
         }
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền thêm sản phẩm' };
         }
         if (error.response.status === 400) {
            return {
               errCode: 1,
               errMessage: error.response.data?.errMessage || 'Dữ liệu không hợp lệ'
            };
         }
      }

      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi khi thêm sản phẩm cho danh mục'
      };
   }
};

export const getProductsByCategoryId = async (categoryId) => {
   try {
      if (!categoryId) {
         return { errCode: 1, errMessage: 'ID danh mục không hợp lệ' };
      }

      const response = await instance.get('api/admin/get-product', {
         params: { categoryId },
         headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
         }
      });

      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server' };
      }

      // Backend trả về { errCode, errMessage, products }
      return {
         errCode: response.data.errCode,
         errMessage: response.data.errMessage,
         products: response.data.products || []
      };

   } catch (error) {
      if (error.response) {
         if (error.response.status === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy danh mục' };
         }
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền truy cập' };
         }
         if (error.response.status === 400) {
            return { errCode: 1, errMessage: 'Thiếu thông tin ID danh mục' };
         }
      }

      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi khi lấy danh sách sản phẩm'
      };
   }
};

export const deleteProductForCategory = async (categoryId, productIds) => {
   try {
      if (!categoryId) {
         return { errCode: 1, errMessage: 'ID danh mục không hợp lệ' };
      }

      if (!Array.isArray(productIds) || productIds.length === 0) {
         return { errCode: 1, errMessage: 'Danh sách sản phẩm không hợp lệ' };
      }

      const response = await instance.post('api/admin/category-delete-product', {
         categoryId,
         productIds
      });

      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
      }

      if (typeof response.data.errCode !== 'undefined') {
         return response.data;
      }

      return {
         errCode: 0,
         message: 'Xóa sản phẩm khỏi danh mục thành công',
         data: response.data
      };

   } catch (error) {
      if (error.response) {
         if (error.response.status === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy danh mục' };
         }
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền xóa sản phẩm' };
         }
         if (error.response.status === 400) {
            return {
               errCode: 1,
               errMessage: error.response.data?.errMessage || 'Dữ liệu không hợp lệ'
            };
         }
      }

      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi khi xóa sản phẩm khỏi danh mục'
      };
   }
};

// Lấy số lượng sản phẩm trong tất cả danh mục
export const getProductCountForAllCategories = async () => {
   try {
      const response = await instance.get('api/admin/product-count-all-categories', {
         headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
         }
      });

      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server' };
      }

      if (response.data.errCode === 0) {
         return {
            errCode: 0,
            data: response.data.data,
            errMessage: 'OK'
         };
      }

      return {
         errCode: response.data.errCode,
         errMessage: response.data.errMessage || 'Lỗi khi lấy số lượng sản phẩm'
      };

   } catch (error) {
      if (error.response) {
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền truy cập' };
         }
         if (error.response.status === 500) {
            return { errCode: -1, errMessage: 'Lỗi server' };
         }
      }

      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi khi lấy số lượng sản phẩm'
      };
   }
};

// Lấy số lượng sản phẩm trong danh mục cụ thể
export const getProductCountByCategoryId = async (categoryId) => {
   try {
      if (!categoryId) {
         return { errCode: 1, errMessage: 'ID danh mục không hợp lệ' };
      }

      const response = await instance.get('api/admin/product-count-by-category', {
         params: { categoryId },
         headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
         }
      });

      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được dữ liệu từ server' };
      }

      if (response.data.errCode === 0) {
         return {
            errCode: 0,
            data: response.data.data,
            errMessage: 'OK'
         };
      }

      return {
         errCode: response.data.errCode,
         errMessage: response.data.errMessage || 'Lỗi khi lấy số lượng sản phẩm'
      };

   } catch (error) {
      if (error.response) {
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền truy cập' };
         }
         if (error.response.status === 500) {
            return { errCode: -1, errMessage: 'Lỗi server' };
         }
      }

      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi khi lấy số lượng sản phẩm'
      };
   }
};