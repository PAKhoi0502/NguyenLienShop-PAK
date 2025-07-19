import homePageService from '../services/homePageService.js';
import dotenv from 'dotenv';
dotenv.config();

//Banner management

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
      const { imageUrl, title, subtitle, link, isActive, order } = req.body;
      const newBanner = await homePageService.createBanner(imageUrl, title, subtitle, link, isActive, order);
      res.status(201).json(newBanner);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi khi tạo banner' });
   }
};

let handleUpdateBanner = async (req, res) => {
   try {
      const { id } = req.params;
      const { imageUrl, title, subtitle, link, isActive, order } = req.body;
      const updatedBanner = await homePageService.updateBanner(id, imageUrl, title, subtitle, link, isActive, order);
      if (updatedBanner) {
         res.status(200).json(updatedBanner);
      } else {
         res.status(404).json({ message: 'Banner không tìm thấy' });
      }
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi khi cập nhật banner' });
   }
};

let handleDeleteBanner = async (req, res) => {
   try {
      const { id } = req.params;
      const deletedBanner = await homePageService.deleteBanner(id);
      if (deletedBanner) {
         res.status(200).json({ message: 'Xóa banner thành công' });
      } else {
         res.status(404).json({ message: 'Banner không tìm thấy' });
      }
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi khi xóa banner' });
   }
};

export default {
   handleGetBanners: handleGetBanners,
   handleCreateBanner: handleCreateBanner,
   handleUpdateBanner: handleUpdateBanner,
   handleDeleteBanner: handleDeleteBanner,
};