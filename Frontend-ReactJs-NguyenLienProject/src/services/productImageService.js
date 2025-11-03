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

// Lấy tất cả ảnh của sản phẩm
export const getImagesByProductId = async (productId) => {
    try {
        if (!productId) {
            return { errCode: 1, errMessage: 'ID sản phẩm không hợp lệ' };
        }

        const response = await instance.get('api/admin/product-images', {
            params: { productId },
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
                images: response.data.images || []
            };
        }

        return response.data;
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
            errMessage: error.response?.data?.errMessage || 'Lỗi khi tải danh sách ảnh'
        };
    }
};

// Upload ảnh mới cho sản phẩm
export const createProductImage = async (productId, imageFile, isThumbnail = false) => {
    try {
        if (!productId) {
            return { errCode: 1, errMessage: 'ID sản phẩm không hợp lệ' };
        }

        if (!imageFile) {
            return { errCode: 1, errMessage: 'Không có ảnh được chọn' };
        }

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('productId', productId);
        formData.append('isThumbnail', isThumbnail);

        const response = await instance.post('api/admin/product-image-create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response || !response.data) {
            return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
        }

        if (response.data.errCode === 0) {
            return {
                errCode: 0,
                message: response.data.message || 'Thêm ảnh thành công',
                image: response.data.image
            };
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                return { errCode: 404, errMessage: 'Không tìm thấy sản phẩm' };
            }
            if (error.response.status === 401) {
                return { errCode: 401, errMessage: 'Không có quyền upload ảnh' };
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
            errMessage: error.response?.data?.errMessage || 'Lỗi khi upload ảnh'
        };
    }
};

// Đặt ảnh làm thumbnail
export const setThumbnail = async (productId, imageId) => {
    try {
        if (!productId || !imageId) {
            return { errCode: 1, errMessage: 'Thiếu productId hoặc imageId' };
        }

        const response = await instance.put('api/admin/product-image-set-thumbnail', {
            productId,
            imageId
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response || !response.data) {
            return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
        }

        if (response.data.errCode === 0) {
            return {
                errCode: 0,
                message: response.data.message || 'Đặt làm ảnh chính thành công',
                image: response.data.image
            };
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                return { errCode: 404, errMessage: 'Không tìm thấy ảnh hoặc sản phẩm' };
            }
            if (error.response.status === 401) {
                return { errCode: 401, errMessage: 'Không có quyền thực hiện' };
            }
        }

        return {
            errCode: -1,
            errMessage: error.response?.data?.errMessage || 'Lỗi khi đặt làm ảnh chính'
        };
    }
};

// Xóa ảnh
export const deleteProductImage = async (imageId) => {
    try {
        if (!imageId) {
            return { errCode: 1, errMessage: 'ID ảnh không hợp lệ' };
        }

        const response = await instance.delete('api/admin/product-image-delete', {
            data: { imageId },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response || !response.data) {
            return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
        }

        if (response.data.errCode === 0) {
            return {
                errCode: 0,
                message: response.data.message || 'Xóa ảnh thành công'
            };
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                return { errCode: 404, errMessage: 'Không tìm thấy ảnh' };
            }
            if (error.response.status === 401) {
                return { errCode: 401, errMessage: 'Không có quyền xóa ảnh' };
            }
        }

        return {
            errCode: -1,
            errMessage: error.response?.data?.errMessage || 'Lỗi khi xóa ảnh'
        };
    }
};

// Cập nhật trạng thái active của ảnh
export const updateImageActive = async (imageId, isActive) => {
    try {
        if (!imageId || isActive === undefined) {
            return { errCode: 1, errMessage: 'Thiếu imageId hoặc isActive' };
        }

        const response = await instance.put('api/admin/product-image-active', {
            imageId,
            isActive
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response || !response.data) {
            return { errCode: -1, errMessage: 'Không nhận được phản hồi từ server' };
        }

        if (response.data.errCode === 0) {
            return {
                errCode: 0,
                message: response.data.message || 'Cập nhật trạng thái thành công',
                image: response.data.image
            };
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                return { errCode: 404, errMessage: 'Không tìm thấy ảnh' };
            }
            if (error.response.status === 400) {
                return {
                    errCode: 400,
                    errMessage: error.response.data?.errMessage || 'Không thể ẩn ảnh chính'
                };
            }
            if (error.response.status === 401) {
                return { errCode: 401, errMessage: 'Không có quyền cập nhật' };
            }
        }

        return {
            errCode: -1,
            errMessage: error.response?.data?.errMessage || 'Lỗi khi cập nhật trạng thái ảnh'
        };
    }
};


