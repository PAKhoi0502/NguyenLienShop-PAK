import db from '../models';

// Lấy tất cả banner
let getBanners = async () => {
   try {
      const banners = await db.Banner.findAll({
         order: [['order', 'ASC']] // hoặc tùy theo yêu cầu
      });
      return banners;
   } catch (err) {
      throw new Error('Lỗi khi lấy danh sách banner');
   }
};
// Tạo mới banner
let createBanner = async (imageUrl, title, subtitle, link, isActive, order) => {
   try {
      if (!isActive) {
         // Nếu banner không active, order mặc định = 0
         order = 0;
      } else {
         // Nếu banner active, xử lý dồn order
         const existingBanners = await db.Banner.findAll({
            where: { isActive: true },
            order: [['order', 'ASC']],
         });

         // Nếu không truyền order, thêm vào cuối
         if (!order || order <= 0 || order > existingBanners.length + 1) {
            order = existingBanners.length + 1;
         }

         // Dồn các banner phía sau (>= order) lên +1
         for (const b of existingBanners) {
            if (b.order >= order) {
               b.order += 1;
               await b.save(); // cập nhật vào DB
            }
         }
      }

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
   createBanner,
   updateBanner,
   deleteBanner,
   getActiveBanners
};
