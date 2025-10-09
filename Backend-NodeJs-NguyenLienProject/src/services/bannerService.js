import db from '../models/index.js';

let getBanners = async () => {
   try {
      const banners = await db.Banner.findAll({
         order: [['order', 'ASC']]
      });
      return banners;
   } catch (err) {
      throw new Error('Lỗi khi lấy danh sách banner');
   }
};

let createBanner = async (imageUrl, title, subtitle, link) => {
   try {
      const banner = await db.Banner.create({
         imageUrl,
         title: title || null,
         subtitle: subtitle || null,
         link: link || null,
         isActive: false,
         order: 0,
      });
      return banner;
   } catch (err) {
      console.error('Error creating banner:', err);
      throw new Error('Lỗi khi tạo banner');
   }
};

let updateBanner = async (id, title, subtitle, link, isActive, order) => {
   const banner = await db.Banner.findByPk(id);
   if (!banner) {
      return { errCode: 1, errMessage: 'Banner không tồn tại' };
   }

   const hasChangedContent =
      (title !== undefined && title !== banner.title) ||
      (subtitle !== undefined && subtitle !== banner.subtitle) ||
      (link !== undefined && link !== banner.link);

   if (banner.isActive && hasChangedContent) {
      return {
         errCode: 2,
         errMessage: 'Không thể cập nhật nội dung banner đang hiển thị. Vui lòng ẩn trước.'
      };
   }

   const updateData = {};
   if (title !== undefined) updateData.title = title;
   if (subtitle !== undefined) updateData.subtitle = subtitle;
   if (link !== undefined) updateData.link = link;
   if (isActive !== undefined) updateData.isActive = isActive;
   if (order !== undefined) updateData.order = order;

   await banner.update(updateData);

   return { errCode: 0, errMessage: 'Cập nhật banner thành công', banner };
};

let deleteBanner = async (id) => {
   try {
      const banner = await db.Banner.findByPk(id);
      if (!banner) {
         return { errCode: 1, errMessage: 'Banner không tồn tại' };
      }

      await banner.destroy();
      return { errCode: 0, errMessage: 'Xóa banner thành công' };
   } catch (err) {
      throw new Error('Lỗi khi xóa banner');
   }
};

let getBannerById = async (id) => {
   try {
      const banner = await db.Banner.findByPk(id);
      return banner;
   } catch (err) {
      throw new Error('Lỗi khi lấy thông tin banner');
   }
};

let getActiveBanners = async () => {
   try {
      const banners = await db.Banner.findAll({
         where: { isActive: true },
         order: [['order', 'ASC']],
      });
      return banners;
   } catch (err) {
      throw new Error('Lỗi khi lấy banner đang hoạt động');
   }
};

export default {
   getBanners,
   getBannerById,
   createBanner,
   updateBanner,
   deleteBanner,
   getActiveBanners
};