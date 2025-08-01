import db from '../models';

const getActiveBanners = async () => {
   try {
      const banners = await db.Banner.findAll({
         where: { isActive: true },
         order: [['order', 'ASC']],
         attributes: ['id', 'imageUrl', 'title', 'subtitle', 'link', 'order']
      });
      return banners;
   } catch (err) {
      console.error('Error in getActiveBanners:', err.message, err.stack);
      throw new Error('Lỗi khi lấy danh sách banner đang hoạt động');
   }
};

export default {
   getActiveBanners
};