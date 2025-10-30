/**
 * Vietnam Location Service
 * Service để lấy dữ liệu Tỉnh/Thành phố, Quận/Huyện, Phường/Xã
 * Sử dụng API: provinces.open-api.vn
 */

const API_BASE_URL = 'https://provinces.open-api.vn/api';

// Cache để tránh gọi API nhiều lần
let provincesCache = null;
let districtsCache = {};
let wardsCache = {};

/**
 * Lấy danh sách tất cả Tỉnh/Thành phố
 */
export const getProvinces = async () => {
    try {
        // Return cache if available
        if (provincesCache) {
            return {
                errCode: 0,
                provinces: provincesCache
            };
        }

        const response = await fetch(`${API_BASE_URL}/p/`);

        if (!response.ok) {
            throw new Error('Failed to fetch provinces');
        }

        const data = await response.json();

        // Cache the result
        provincesCache = data.map(p => ({
            code: p.code,
            name: p.name,
            nameEn: p.name_en,
            fullName: p.full_name,
            fullNameEn: p.full_name_en,
            codeName: p.code_name
        }));

        return {
            errCode: 0,
            provinces: provincesCache
        };
    } catch (error) {
        console.error('getProvinces error:', error);
        return {
            errCode: -1,
            errMessage: 'Không thể tải danh sách tỉnh/thành phố'
        };
    }
};

/**
 * Lấy danh sách Quận/Huyện theo Tỉnh/Thành phố
 * @param {number} provinceCode - Mã tỉnh/thành phố
 */
export const getDistricts = async (provinceCode) => {
    try {
        if (!provinceCode) {
            return {
                errCode: 1,
                errMessage: 'Thiếu mã tỉnh/thành phố'
            };
        }

        // Return cache if available
        const cacheKey = `province_${provinceCode}`;
        if (districtsCache[cacheKey]) {
            return {
                errCode: 0,
                districts: districtsCache[cacheKey]
            };
        }

        const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`);

        if (!response.ok) {
            throw new Error('Failed to fetch districts');
        }

        const data = await response.json();

        // Cache the result
        const districts = data.districts.map(d => ({
            code: d.code,
            name: d.name,
            nameEn: d.name_en,
            fullName: d.full_name,
            fullNameEn: d.full_name_en,
            codeName: d.code_name,
            provinceCode: provinceCode
        }));

        districtsCache[cacheKey] = districts;

        return {
            errCode: 0,
            districts: districts
        };
    } catch (error) {
        console.error('getDistricts error:', error);
        return {
            errCode: -1,
            errMessage: 'Không thể tải danh sách quận/huyện'
        };
    }
};

/**
 * Lấy danh sách Phường/Xã theo Quận/Huyện
 * @param {number} districtCode - Mã quận/huyện
 */
export const getWards = async (districtCode) => {
    try {
        if (!districtCode) {
            return {
                errCode: 1,
                errMessage: 'Thiếu mã quận/huyện'
            };
        }

        // Return cache if available
        const cacheKey = `district_${districtCode}`;
        if (wardsCache[cacheKey]) {
            return {
                errCode: 0,
                wards: wardsCache[cacheKey]
            };
        }

        const response = await fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`);

        if (!response.ok) {
            throw new Error('Failed to fetch wards');
        }

        const data = await response.json();

        // Cache the result
        const wards = data.wards.map(w => ({
            code: w.code,
            name: w.name,
            nameEn: w.name_en,
            fullName: w.full_name,
            fullNameEn: w.full_name_en,
            codeName: w.code_name,
            districtCode: districtCode
        }));

        wardsCache[cacheKey] = wards;

        return {
            errCode: 0,
            wards: wards
        };
    } catch (error) {
        console.error('getWards error:', error);
        return {
            errCode: -1,
            errMessage: 'Không thể tải danh sách phường/xã'
        };
    }
};

/**
 * Clear cache (optional - để reset cache khi cần)
 */
export const clearLocationCache = () => {
    provincesCache = null;
    districtsCache = {};
    wardsCache = {};
};

/**
 * Tìm tỉnh theo tên
 * @param {string} provinceName - Tên tỉnh cần tìm
 */
export const findProvinceByName = async (provinceName) => {
    try {
        const result = await getProvinces();
        if (result.errCode !== 0) {
            return null;
        }

        return result.provinces.find(
            p => p.name === provinceName || p.fullName === provinceName
        );
    } catch (error) {
        console.error('findProvinceByName error:', error);
        return null;
    }
};

/**
 * Tìm quận/huyện theo tên và mã tỉnh
 * @param {number} provinceCode - Mã tỉnh
 * @param {string} districtName - Tên quận/huyện
 */
export const findDistrictByName = async (provinceCode, districtName) => {
    try {
        const result = await getDistricts(provinceCode);
        if (result.errCode !== 0) {
            return null;
        }

        return result.districts.find(
            d => d.name === districtName || d.fullName === districtName
        );
    } catch (error) {
        console.error('findDistrictByName error:', error);
        return null;
    }
};

