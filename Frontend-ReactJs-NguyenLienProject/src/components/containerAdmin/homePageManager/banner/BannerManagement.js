import React, { useEffect, useState } from 'react';
import { getAllBanners } from '../../../../services/hompageService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './BannerManager.scss';

const BannerManager = () => {
   const [banners, setBanners] = useState([]);
   const [filteredBanners, setFilteredBanners] = useState([]);
   const [search, setSearch] = useState('');
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

   const fetchBanners = async () => {
      try {
         const res = await getAllBanners();
         setBanners(Array.isArray(res) ? res : []);
      } catch (err) {
         console.error('Fetch banners error:', err);
         toast.error('Không thể tải danh sách banner');
      } finally {
         setLoading(false);
      }
   };

   const [filterStatus, setFilterStatus] = useState('all');


   useEffect(() => {
      fetchBanners();
   }, []);

   useEffect(() => {
      const keyword = search.trim().toLowerCase();
      const filtered = banners.filter(banner => {
         const matchSearch =
            banner.title?.toLowerCase().includes(keyword) ||
            banner.subtitle?.toLowerCase().includes(keyword) ||
            String(banner.id).includes(keyword);

         const matchStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && banner.isActive) ||
            (filterStatus === 'inactive' && !banner.isActive);

         return matchSearch && matchStatus;
      });

      setFilteredBanners(filtered);
   }, [search, banners, filterStatus]);


   return (
      <div className="banner-manager-container">
         <div className="banner-manager-top">
            <h1 className="banner-title">Quản lý banner</h1>
            <button
               className="btn-create-banner"
               onClick={() => navigate('/admin/homepage-management/banner-management/banner-create')}
            >
               + Tạo banner
            </button>
         </div>
         <div className="banner-filters">
            <label>Lọc trạng thái:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
               <option value="all">Tất cả</option>
               <option value="active">Đang hiển thị</option>
               <option value="inactive">Đã ẩn</option>
            </select>
         </div>

         <div className="banner-search-bar">
            <input
               type="text"
               placeholder="Tìm theo tiêu đề, phụ đề, ID..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         {loading ? (
            <p className="banner-loading">Đang tải banner...</p>
         ) : (
            <div className="banner-table-wrapper">
               <table className="banner-table">
                  <thead>
                     <tr>
                        <th>ID</th>
                        <th>Hình ảnh</th>
                        <th>Tiêu đề</th>
                        <th>Phụ đề</th>
                        <th>Thứ tự</th>
                        <th>Hiển thị</th>
                        <th>Hành động</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredBanners.length === 0 ? (
                        <tr>
                           <td colSpan={7} style={{ textAlign: 'center', color: '#888' }}>
                              Không có banner nào phù hợp.
                           </td>
                        </tr>
                     ) : (
                        filteredBanners.map((banner) => (
                           <tr key={banner.id}>
                              <td>{banner.id}</td>
                              <td>
                                 <img src={`http://localhost:8080${banner.imageUrl}`} alt="banner" width="100" />
                              </td>
                              <td>{banner.title}</td>
                              <td>{banner.subtitle}</td>
                              <td>{banner.order}</td>
                              <td>{banner.isActive ? '✅' : '❌'}</td>
                              <td>
                                 <div className="action-buttons">
                                    <button
                                       className="btn-action btn-update"
                                       onClick={() => navigate(`/admin/homepage-management/banner-update/${banner.id}`)}
                                    >
                                       Cập nhật
                                    </button>
                                    <button
                                       className="btn-action btn-activate"
                                       onClick={() => toast.info('Chức năng kích hoạt sẽ xử lý sau')}
                                    >
                                       {banner.isActive ? '👁 Đang hiển thị' : '🚫 Ẩn - Kích hoạt'}
                                    </button>

                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
};

export default BannerManager;
