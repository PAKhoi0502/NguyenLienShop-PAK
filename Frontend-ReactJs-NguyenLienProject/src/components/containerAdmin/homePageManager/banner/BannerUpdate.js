import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllBanners, updateBanner } from '../../../../services/bannerService';

const BannerUpdate = () => {
   const { id } = useParams();
   const navigate = useNavigate();

   const [banner, setBanner] = useState(null);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      const fetchBanner = async () => {
         try {
            const res = await getAllBanners();
            const found = res.find(item => String(item.id) === String(id));
            if (!found) {
               toast.error('Không tìm thấy banner');
               return navigate('/admin/homepage-management/banner-management');
            }
            setBanner(found);
         } catch (err) {
            console.error(err);
            toast.error('Lỗi khi tải banner');
         }
      };
      fetchBanner();
   }, [id, navigate]);

   const handleChange = (field, value) => {
      setBanner({ ...banner, [field]: value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      // Validation
      if (!banner.title.trim()) {
         toast.error('Vui lòng nhập tiêu đề banner');
         return;
      }

      setLoading(true);

      try {
         const dataToSend = {
            id: banner.id,
            isActive: banner.isActive,
            order: banner.order,
         };

         if (!banner.isActive) {
            dataToSend.title = banner.title;
            dataToSend.subtitle = banner.subtitle;
            dataToSend.link = banner.link;
         }

         const res = await updateBanner(dataToSend);

         if (res && res.errCode === 0) {
            toast.success('Cập nhật banner thành công');
            navigate('/admin/homepage-management/banner-management');
         } else {
            toast.error(res?.errMessage || 'Không thể cập nhật banner');
         }
      } catch (err) {
         console.error(err);
         toast.error('Lỗi server khi cập nhật banner');
      } finally {
         setLoading(false);
      }
   };


   if (!banner) return <p>Đang tải dữ liệu...</p>;

   return (
      <div className="banner-create-container">
         <h1>Cập Nhật Banner</h1>
         <form onSubmit={handleSubmit} className="banner-create-form">
            <div className="form-group">
               <label>Hình ảnh hiện tại:</label>
               <img
                  src={`http://localhost:8080${banner.imageUrl}`}
                  alt="banner"
                  style={{ maxWidth: '300px' }}
               />
            </div>

            <div className="form-group">
               <label>Tiêu đề:</label>
               <input
                  type="text"
                  value={banner.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
               />
            </div>

            <div className="form-group">
               <label>Phụ đề:</label>
               <input
                  type="text"
                  value={banner.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
               />
            </div>

            <div className="form-group">
               <label>Link:</label>
               <input
                  type="text"
                  value={banner.link}
                  onChange={(e) => handleChange('link', e.target.value)}
               />
            </div>

            <div className="form-group">
               <label>Trạng thái: {banner.isActive ? 'Đang hiển thị' : 'Đã ẩn'}</label>
               {banner.isActive && (
                  <small style={{ color: 'red' }}>
                     * Vui lòng tắt “Hiển thị” để cập nhật nội dung
                  </small>
               )}
            </div>

            <div className="form-actions">
               <button
                  className='btn-submit'
                  type="submit"
                  disabled={loading}
               >
                  {loading ? 'Đang cập nhật...' : 'Cập Nhật'}
               </button>
               <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/admin/homepage-management/banner-management')}
                  disabled={loading}
               >
                  Hủy
               </button>
            </div>
         </form>
      </div>
   );
};

export default BannerUpdate;