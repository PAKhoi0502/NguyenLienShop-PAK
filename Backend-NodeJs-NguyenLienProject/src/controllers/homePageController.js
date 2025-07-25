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
      const { title, subtitle, link, isActive, order } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      if (!imageUrl) {
         return res.status(400).json({ message: 'Không có ảnh được tải lên' });
      }

      const newBanner = await homePageService.createBanner(
         imageUrl,
         title,
         subtitle,
         link,
         isActive === 'true' || isActive === true,
         Number(order)
      );
      res.status(201).json({
         message: 'Banner created',
         id: newBanner.id,
         banner: newBanner,
      });

   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi khi tạo banner' });
   }
};

let handleUpdateBanner = async (req, res) => {
   try {
      const data = req.body;
      const { id } = data;
      if (!id) return res.status(400).json({ message: 'Thiếu ID banner' });

      const updatedBanner = await homePageService.updateBanner(
         id, data.imageUrl, data.title, data.subtitle, data.link, data.isActive, data.order
      );

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
      const { id } = req.body;
      if (!id) return res.status(400).json({ message: 'Thiếu ID banner' });

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

let handleGetActiveBanners = async (req, res) => {
   try {
      const banners = await homePageService.getActiveBanners();
      res.status(200).json(banners);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi khi lấy banner đang hoạt động' });
   }
};

export default {
   handleGetBanners: handleGetBanners,
   handleCreateBanner: handleCreateBanner,
   handleUpdateBanner: handleUpdateBanner,
   handleDeleteBanner: handleDeleteBanner,
   handleGetActiveBanners: handleGetActiveBanners
};