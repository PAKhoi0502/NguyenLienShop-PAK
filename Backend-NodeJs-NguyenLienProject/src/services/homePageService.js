import db from '../models';

// Lấy tất cả banner
let getBanners = async () => {
   try {
      const banners = await db.Banner.findAll({
         where: { isActive: true },
         order: [['order', 'ASC']],  // Sắp xếp theo thứ tự hiển thị
      });
      return banners;
   } catch (err) {
      throw new Error('Lỗi khi lấy dữ liệu banner');
   }
};

// Tạo mới banner
let createBanner = async (imageUrl, title, subtitle, link, isActive, order) => {
   try {
      const banner = await db.Banner.create({
         imageUrl,
         title,
         subtitle,
         link,
         isActive,
         order,
      });
      return banner;
   } catch (err) {
      throw new Error('Lỗi khi tạo banner');
   }
};

// Cập nhật banner
let updateBanner = async (id, imageUrl, title, subtitle, link, isActive, order) => {
   try {
      const banner = await db.Banner.findByPk(id);
      if (!banner) {
         return null;  // Không tìm thấy banner
      }

      banner.imageUrl = imageUrl || banner.imageUrl;
      banner.title = title || banner.title;
      banner.subtitle = subtitle || banner.subtitle;
      banner.link = link || banner.link;
      banner.isActive = isActive !== undefined ? isActive : banner.isActive;
      banner.order = order || banner.order;

      await banner.save();  // Lưu thông tin đã cập nhật
      return banner;
   } catch (err) {
      throw new Error('Lỗi khi cập nhật banner');
   }
};

// Xóa banner
let deleteBanner = async (id) => {
   try {
      const banner = await db.Banner.findByPk(id);
      if (!banner) {
         return null;  // Không tìm thấy banner
      }
      await banner.destroy();  // Xóa banner
      return true;
   } catch (err) {
      throw new Error('Lỗi khi xóa banner');
   }
};

export default {
   getBanners,
   createBanner,
   updateBanner,
   deleteBanner,
};
