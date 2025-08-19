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

export const getProductById = async (id) => {
   try {
      if (!id) {
         return { errCode: 1, errMessage: 'ID không hợp lệ' };
      }

      const response = await instance.get('api/admin/product', {
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
            product: response.data,
            errMessage: 'OK'
         };
      }

      return {
         errCode: 404,
         errMessage: 'Không tìm thấy sản phẩm'
      };

   } catch (error) {

      if (error.response) {
         if (error.response.status === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy sản phẩm' };
         }
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền truy cập' };
         }
      }

      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi khi tải sản phẩm'
      };
   }
};

export const getAllProducts = async () => {
   try {
      const response = await instance.get('api/admin/product-management');
      return response.data;
   } catch (error) {
      return { errCode: -1, errMessage: 'Lỗi khi tải danh sách sản phẩm' };
   }
};

export const createProduct = async (productData) => {
   try {
      const response = await instance.post('api/admin/product-create', productData);
      return response.data;
   } catch (error) {
      return { errCode: -1, errMessage: 'Lỗi khi tạo sản phẩm' };
   }
};

export const updateProduct = async (data) => {
   try {
      if (!data || typeof data !== 'object' || !data.id) {
         return { errCode: 1, errMessage: 'Dữ liệu cập nhật không hợp lệ' };
      }


      const validFields = [
         'nameProduct',
         'description',
         'price',
         'discountPrice',
         'dimensions',
         'stock',
         'isNew',
         'isBestSeller'
      ];

      const filteredData = {
         id: data.id
      };

      validFields.forEach(field => {
         if (data[field] !== undefined) {
            filteredData[field] = data[field];
         }
      });

      if (Object.keys(filteredData).length <= 1) {
         return { errCode: 1, errMessage: 'Không có dữ liệu hợp lệ để cập nhật' };
      }


      const response = await instance.put('api/admin/product-update', filteredData);

      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
      }

      if (response.data.errCode !== undefined) {
         return response.data;
      }

      if (response.data.id) {
         return {
            errCode: 0,
            message: 'Cập nhật sản phẩm thành công',
            product: response.data
         };
      }

      return { errCode: -1, errMessage: 'Định dạng dữ liệu không hợp lệ' };
   } catch (error) {
      console.error('Error updating product:', error);
      console.error('Error response:', error.response);

      // Xử lý các lỗi HTTP cụ thể
      if (error.response) {
         if (error.response.status === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy sản phẩm' };
         }
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền cập nhật sản phẩm' };
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
         errMessage: error.response?.data?.errMessage || 'Lỗi khi cập nhật sản phẩm'
      };
   }
};

export const deleteProduct = async (id) => {
   try {
      if (!id) {
         return { errCode: 1, errMessage: 'ID sản phẩm không hợp lệ' };
      }


      const response = await instance.delete('api/admin/product-delete', {
         data: { id }
      });


      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
      }

      if (response.data.errCode !== undefined) {
         return response.data;
      }

      return {
         errCode: 0,
         message: 'Xóa sản phẩm thành công',
         ...response.data
      };

   } catch (error) {

      if (error.response) {
         if (error.response.status === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy sản phẩm' };
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
         if (error.response.status === 409) {
            return {
               errCode: 409,
               errMessage: 'Không thể xóa sản phẩm đang được sử dụng'
            };
         }
      }

      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi khi xóa sản phẩm'
      };
   }
};

export const getActiveProducts = async (id, isActive) => {
   try {
      if (!id) {
         return { errCode: 1, errMessage: 'ID sản phẩm không hợp lệ' };
      }

      if (typeof isActive !== 'boolean') {
         return { errCode: 1, errMessage: 'Trạng thái active không hợp lệ' };
      }


      const response = await instance.put('api/admin/product-active', {
         id,
         isActive
      });


      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
      }

      if (response.data.errCode !== undefined) {
         return response.data;
      }

      if (response.data.id) {
         return {
            errCode: 0,
            message: `${isActive ? 'Hiện' : 'Ẩn'} sản phẩm thành công`,
            product: response.data
         };
      }

      return { errCode: -1, errMessage: 'Định dạng dữ liệu không hợp lệ' };

   } catch (error) {

      if (error.response) {
         if (error.response.status === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy sản phẩm' };
         }
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền cập nhật trạng thái sản phẩm' };
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
         errMessage: error.response?.data?.errMessage || 'Lỗi khi cập nhật trạng thái sản phẩm'
      };
   }
};

export const addCategoryForProduct = async (productId, categoryIds) => {
   try {
      if (!productId) {
         return { errCode: 1, errMessage: 'ID sản phẩm không hợp lệ' };
      }

      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
         return { errCode: 1, errMessage: 'Danh sách danh mục không hợp lệ' };
      }


      const response = await instance.post('api/admin/product-add-category', {
         productId,
         categoryIds
      });


      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
      }

      if (response.data.errCode !== undefined) {
         return response.data;
      }

      return {
         errCode: 0,
         message: 'Thêm danh mục cho sản phẩm thành công',
         data: response.data
      };

   } catch (error) {

      if (error.response) {
         if (error.response.status === 404) {
            return { errCode: 404, errMessage: 'Không tìm thấy sản phẩm' };
         }
         if (error.response.status === 401) {
            return { errCode: 401, errMessage: 'Không có quyền thêm danh mục' };
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
         errMessage: error.response?.data?.errMessage || 'Lỗi khi thêm danh mục cho sản phẩm'
      };
   }
};

export const deleteCategoryForProduct = async (productId, categoryIds) => {
   try {
      const response = await instance.post('api/admin/product-delete-category', {
         productId,
         categoryIds
      });
      return response.data;
   } catch (error) {
      return { errCode: -1, errMessage: 'Lỗi khi xóa danh mục khỏi sản phẩm' };
   }
};

export const getCategoriesByProductId = async (productId) => {
   try {
      if (!productId) {
         return { errCode: 1, errMessage: 'ID sản phẩm không hợp lệ' };
      }


      const response = await instance.get('api/admin/get-category', {
         params: { productId }
      });


      if (!response || !response.data) {
         return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
      }

      if (response.data.errCode !== undefined) {
         return response.data;
      }

      if (Array.isArray(response.data)) {
         return {
            errCode: 0,
            message: 'Lấy danh mục thành công',
            categories: response.data
         };
      }

      if (response.data.categories) {
         return {
            errCode: 0,
            message: 'Lấy danh mục thành công',
            categories: response.data.categories
         };
      }

      return {
         errCode: 0,
         message: 'Không có danh mục nào',
         categories: []
      };

   } catch (error) {

      if (error.response) {
         if (error.response.status === 404) {
            return {
               errCode: 404,
               errMessage: 'Không tìm thấy sản phẩm',
               categories: []
            };
         }
         if (error.response.status === 401) {
            return {
               errCode: 401,
               errMessage: 'Không có quyền truy cập danh mục'
            };
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
         errMessage: error.response?.data?.errMessage || 'Lỗi khi lấy danh mục của sản phẩm',
         categories: []
      };
   }
};

export const getAllCategories = async () => {
   try {

      const response = await instance.get('api/admin/category-management', {
         headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
         }
      });


      if (!response || !response.data) {
         return {
            errCode: -1,
            errMessage: 'Không nhận được phản hồi từ server',
            categories: []
         };
      }

      if (Array.isArray(response.data)) {
         return {
            errCode: 0,
            message: 'Lấy danh sách danh mục thành công',
            categories: response.data
         };
      }

      if (typeof response.data === 'object') {
         if (response.data.errCode === 0) {
            return {
               errCode: 0,
               message: 'Lấy danh sách danh mục thành công',
               categories: Array.isArray(response.data.categories) ? response.data.categories : []
            };
         }

         if (response.data.errCode !== undefined) {
            return {
               ...response.data,
               categories: []
            };
         }
      }

      return {
         errCode: -1,
         errMessage: 'Định dạng dữ liệu không hợp lệ',
         categories: []
      };

   } catch (error) {

      if (error.response) {
         if (error.response.status === 401) {
            return {
               errCode: 401,
               errMessage: 'Không có quyền truy cập danh mục',
               categories: []
            };
         }
         if (error.response.status === 400) {
            return {
               errCode: 1,
               errMessage: error.response.data?.errMessage || 'Yêu cầu không hợp lệ',
               categories: []
            };
         }
      }

      return {
         errCode: -1,
         errMessage: error.response?.data?.errMessage || 'Lỗi khi lấy danh sách danh mục',
         categories: []
      };
   }
};
