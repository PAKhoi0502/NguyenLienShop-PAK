import publicHomePageService from '../services/publicHomePageService.js';

const handleViewsBanner = async (req, res) => {
   try {
      const banners = await publicHomePageService.getActiveBanners();
      res.status(200).json({
         errCode: 0,
         errMessage: 'Lấy danh sách banner thành công',
         data: banners
      });
   } catch (err) {
      console.error('Error in handleViewsBanner:', err.message, err.stack);
      res.status(500).json({
         errCode: -1,
         errMessage: 'Lỗi khi lấy danh sách banner: ' + err.message
      });
   }
};

export default {
   handleViewsBanner: handleViewsBanner
};