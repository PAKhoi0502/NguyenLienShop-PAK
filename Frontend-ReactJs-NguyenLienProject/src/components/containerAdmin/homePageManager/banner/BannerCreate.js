import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createBanner } from '../../../../services/hompageService';
import './BannerCreate.scss';

const BannerCreate = () => {
   const [title, setTitle] = useState('');
   const [subtitle, setSubtitle] = useState('');
   const [link, setLink] = useState('');
   const [order, setOrder] = useState('');
   const [isActive, setIsActive] = useState(false);
   const [image, setImage] = useState(null);
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      const formData = new FormData();
      formData.append('image', image);
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('link', link);
      formData.append('isActive', isActive);
      formData.append('order', order || 0);

      try {
         const res = await createBanner(formData);
         if (res && res.id) {
            toast.success('Tạo banner thành công');
            navigate('/admin/homepage-management/banner-management');
         } else {
            toast.error('Không thể tạo banner');
         }
      } catch (err) {
         console.error('Create banner error:', err);
         toast.error('Lỗi server khi tạo banner');
      } finally {
         setLoading(false);
      }
   };

   const handleImageChange = (e) => {
      setImage(e.target.files[0]);
   };

   return (
      <div className="banner-create-container">
         <h1>Tạo Banner Mới</h1>
         <form onSubmit={handleSubmit} className="banner-create-form">
            <div className="form-group">
               <div className="form-group">
                  <label>Hình ảnh:</label>
                  <input
                     type="file"
                     accept="image/*"
                     onChange={handleImageChange}
                     required
                  />
               </div>
               <label>Tiêu đề:</label>
               <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
               />
            </div>
            <div className="form-group">
               <label>Phụ đề:</label>
               <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
               />
            </div>
            <div className="form-group">
               <label>Link:</label>
               <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
               />
            </div>
            <div className="form-group">
               <label>Thứ tự:</label>
               <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  min="0"
               />
            </div>
            <div className="form-group">
               <label>
                  <input
                     type="checkbox"
                     checked={isActive}
                     onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Hiển thị
               </label>
            </div>
            <div className="form-actions">
               <button className='btn-submit' type="submit" disabled={loading}>
                  {loading ? 'Đang tạo...' : 'Tạo Banner'}
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

export default BannerCreate;