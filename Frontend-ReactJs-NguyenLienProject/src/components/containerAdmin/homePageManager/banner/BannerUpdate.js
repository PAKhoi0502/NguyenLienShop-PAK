import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllBanners, updateBanner } from '../../../../services/hompageService';
import { toast } from 'react-toastify';
import './BannerUpdate.scss';

const BannerUpdate = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const [form, setForm] = useState({
      title: '',
      subtitle: '',
      link: '',
      order: 0,
      isActive: false,
   });
   const [loading, setLoading] = useState(false);
   const [originalBanner, setOriginalBanner] = useState(null);
   const [error, setError] = useState('');
   const validateOrder = () => {
      const parsedOrder = parseInt(form.order);
      if (form.isActive && (!parsedOrder || parsedOrder < 1)) {
         setError('Thứ tự hiển thị phải từ 1 trở lên nếu đang bật banner');
         return false;
      }
      setError('');
      return true;
   };

   useEffect(() => {
      const fetchBanner = async () => {
         try {
            const res = await getAllBanners(); // lấy danh sách để tìm đúng banner
            const banner = res.find(b => String(b.id) === String(id));
            if (banner) {
               setForm({
                  title: banner.title || '',
                  subtitle: banner.subtitle || '',
                  link: banner.link || '',
                  order: banner.order || 0,
                  isActive: banner.isActive === 1 || banner.isActive === true
               });
               setOriginalBanner(banner);
            } else {
               toast.error('Không tìm thấy banner');
               navigate('/admin/homepage-management/banner-management');
            }
         } catch {
            toast.error('Lỗi khi tải banner');
         }
      };

      fetchBanner();
   }, [id, navigate]);

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setForm(prev => ({
         ...prev,
         [name]: type === 'checkbox' ? checked : value
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (originalBanner?.isActive === true) {
         toast.warning('Vui lòng tắt hiển thị trước khi cập nhật');
         return;
      }

      if (!validateOrder()) return;

      try {
         setLoading(true);
         const res = await updateBanner(id, {
            ...form,
            isActive: form.isActive ? 1 : 0,
         });

         if (res?.id) {
            toast.success('Cập nhật thành công!');
            navigate('/admin/homepage-management/banner-management');
         } else {
            toast.error('Cập nhật thất bại!');
         }
      } catch (err) {
         toast.error('Lỗi khi cập nhật banner');
      } finally {
         setLoading(false);
      }
   };


   return (
      <div className="banner-update-container">
         <h2>Cập nhật banner</h2>
         <form onSubmit={handleSubmit}>
            <div>
               <label>Tiêu đề</label>
               <input name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div>
               <label>Mô tả</label>
               <input name="subtitle" value={form.subtitle} onChange={handleChange} required />
            </div>
            <div>
               <label>Link chuyển (nếu có)</label>
               <input name="link" value={form.link} onChange={handleChange} />
            </div>
            <div>
               <label>Thứ tự hiển thị</label>
               <input name="order" type="number" value={form.order} onChange={handleChange} min="0" />
            </div>
            <div>
               <label>
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                  Hiển thị banner
               </label>
            </div>
            <div>
               <label>Thứ tự hiển thị</label>
               <input
                  name="order"
                  type="number"
                  value={form.order}
                  onChange={handleChange}
                  min="0"
               />
               {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
            </div>

            <button type="submit" disabled={loading}>
               {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
         </form>
      </div>
   );
};

export default BannerUpdate;
