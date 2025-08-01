import homePageService from '../services/homePageService';
import dotenv from 'dotenv';
dotenv.config();

let handleGetBanners = async (req, res) => {
   try {
      const banners = await homePageService.getBanners();
      res.status(200).json(banners);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách banner' });
   }
};

let handleCreateBanner = async (req, res) => {
   try {
      console.log('Request body:', req.body);
      console.log('Uploaded file:', req.file);
      const { title, subtitle, link } = req.body;
      const imageUrl = req.file ? `/Uploads/${req.file.filename}` : null;

      if (!imageUrl) {
         return res.status(400).json({ errCode: 1, errMessage: 'Không có ảnh được tải lên' });
      }

      const newBanner = await homePageService.createBanner(imageUrl, title || null, subtitle || null, link || null);

      console.log('Banner created:', newBanner);
      res.status(201).json({
         errCode: 0,
         errMessage: 'Banner created',
         id: newBanner.id,
         banner: newBanner,
      });
   } catch (err) {
      console.error('Error in handleCreateBanner:', err.message, err.stack);
      res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi tạo banner: ' + err.message });
   }
};

let handleUpdateBanner = async (req, res) => {
   try {
      const { id, title, subtitle, link, isActive, order } = req.body;

      if (!id) {
         return res.status(400).json({ errCode: 1, errMessage: 'ID banner là bắt buộc' });
      }

      const result = await homePageService.updateBanner(id, title, subtitle, link, isActive, order);
      res.status(200).json(result);
   } catch (err) {
      console.error('Error in handleUpdateBanner:', err.message, err.stack);
      res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi cập nhật banner: ' + err.message });
   }
};

let handleDeleteBanner = async (req, res) => {
   try {
      const { id } = req.body;
      if (!id) {
         return res.status(400).json({ errCode: 1, errMessage: 'ID banner là bắt buộc' });
      }

      const result = await homePageService.deleteBanner(id);
      res.status(200).json({
         errCode: result.errCode,
         errMessage: result.errMessage
      });
   } catch (err) {
      console.error('Error in handleDeleteBanner:', err.message, err.stack);
      res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi xóa banner' });
   }
};

let handleGetActiveBanners = async (req, res) => {
   try {
      const banners = await homePageService.getActiveBanners();
      res.status(200).json(banners);
   } catch (err) {
      console.error(err);
      res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi lấy banner đang hoạt động' });
   }
};

export default {
   handleGetBanners: handleGetBanners,
   handleCreateBanner: handleCreateBanner,
   handleUpdateBanner: handleUpdateBanner,
   handleDeleteBanner: handleDeleteBanner,
   handleGetActiveBanners: handleGetActiveBanners
};