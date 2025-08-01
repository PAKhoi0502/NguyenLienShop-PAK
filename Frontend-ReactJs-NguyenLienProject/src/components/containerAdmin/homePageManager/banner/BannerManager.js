import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { getAllBanners } from '../../../../services/hompageService';
import BannerActive from './BannerActive';
import BannerDelete from './BannerDelete';
import CustomToast from '../../../../components/CustomToast';
import HintBox from '../../../../components/HintBox';
import './BannerManager.scss';

const BannerManager = () => {
   const [banners, setBanners] = useState([]);
   const [filteredBanners, setFilteredBanners] = useState([]);
   const [search, setSearch] = useState('');
   const [loading, setLoading] = useState(true);
   const [filterStatus, setFilterStatus] = useState('all');
   const navigate = useNavigate();
   const intl = useIntl();

   const showToast = (type, message) => {
      toast(
         (props) => (
            <CustomToast
               {...props}
               type={type}
               titleId={type === "error" ? "banner.manager.error_title" : "banner.manager.success_title"}
               message={message}
               time={new Date()}
            />
         ),
         { closeButton: false, type }
      );
   };

   const fetchBanners = async () => {
      try {
         const res = await getAllBanners();
         setBanners(Array.isArray(res) ? res : []);
      } catch (err) {
         console.error('Fetch banners error:', err);
         toast.error(intl.formatMessage({ id: 'banner.manager.load_error', defaultMessage: 'Không thể tải danh sách banner' }));
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchBanners();
   }, []);

   useEffect(() => {
      const keyword = search.trim().toLowerCase();
      const filtered = banners.filter(banner => {
         const matchSearch =
            (banner.title || '').toLowerCase().includes(keyword) ||
            (banner.subtitle || '').toLowerCase().includes(keyword) ||
            String(banner.id).includes(keyword);

         const matchStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && banner.isActive) ||
            (filterStatus === 'inactive' && !banner.isActive);

         return matchSearch && matchStatus;
      });

      setFilteredBanners(filtered);
   }, [search, banners, filterStatus]);

   const handleUpdateClick = (clickedBanner) => {
      const realBanner = banners.find(b => b.id === clickedBanner.id);
      if (realBanner?.isActive) {
         showToast("error", intl.formatMessage({
            id: 'banner.manager.update_blocked',
            defaultMessage: 'Vui lòng ẩn banner trước khi cập nhật'
         }));
         return;
      }
      navigate(`/admin/homepage-management/banner-management/banner-update/${clickedBanner.id}`);
   };


   return (
      <div className="banner-manager-container">
         <div className="banner-manager-top">
            <h1 className="banner-title">
               <FormattedMessage id="banner.manager.title_head" defaultMessage="Quản lý banner" />
            </h1>
            <button
               className="btn-create-banner"
               onClick={() => navigate('/admin/homepage-management/banner-management/banner-create')}
            >
               + <FormattedMessage id="banner.manager.create_button" defaultMessage="Tạo banner" />
            </button>
         </div>

         <div className="banner-filters">
            <label><FormattedMessage id="banner.manager.filter_status" defaultMessage="Lọc trạng thái:" /></label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
               <option value="all"><FormattedMessage id="banner.manager.filter_all" defaultMessage="Tất cả" /></option>
               <option value="active"><FormattedMessage id="banner.manager.filter_active" defaultMessage="Đang hiển thị" /></option>
               <option value="inactive"><FormattedMessage id="banner.manager.filter_inactive" defaultMessage="Đã ẩn" /></option>
            </select>
         </div>
         <HintBox
            content={
               <div>
                  <p><FormattedMessage id="banner.manager.hint_title" /></p>
               </div>
            }
         />
         <div className="banner-search-bar">
            <input
               type="text"
               placeholder={intl.formatMessage({ id: 'banner.manager.search_placeholder', defaultMessage: 'Tìm theo tiêu đề, phụ đề, ID...' })}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         {loading ? (
            <p className="banner-loading"><FormattedMessage id="banner.manager.loading" defaultMessage="Đang tải banner..." /></p>
         ) : (
            <div className="banner-table-wrapper">
               <table className="banner-table">
                  <thead>
                     <tr>
                        <th>ID</th>
                        <th><FormattedMessage id="banner.manager.image" defaultMessage="Hình ảnh" /></th>
                        <th><FormattedMessage id="banner.manager.title" defaultMessage="Tiêu đề" /></th>
                        <th><FormattedMessage id="banner.manager.subtitle" defaultMessage="Phụ đề" /></th>
                        <th><FormattedMessage id="banner.manager.order" defaultMessage="Thứ tự" /></th>
                        <th><FormattedMessage id="banner.manager.status" defaultMessage="Hiển thị" /></th>
                        <th><FormattedMessage id="banner.manager.actions" defaultMessage="Hành động" /></th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredBanners.length === 0 ? (
                        <tr>
                           <td colSpan={7} style={{ textAlign: 'center', color: '#888' }}>
                              <FormattedMessage id="banner.manager.empty_body" defaultMessage="Không có banner nào phù hợp." />
                           </td>
                        </tr>
                     ) : (
                        filteredBanners.map((banner) => (
                           <tr key={banner.id}>
                              <td>{banner.id}</td>
                              <td>
                                 <img src={`http://localhost:8080${banner.imageUrl}`} alt="banner" width="100" />
                              </td>
                              <td>{banner.title || ''}</td>
                              <td>{banner.subtitle || ''}</td>
                              <td>{banner.order}</td>
                              <td>{banner.isActive ? '✅' : '❌'}</td>
                              <td>
                                 <div className="action-buttons">
                                    <button
                                       className="btn-action btn-update"
                                       onClick={() => handleUpdateClick(banner)}
                                    >
                                       <FormattedMessage id="banner.manager.update" defaultMessage="Cập nhật" />
                                    </button>
                                    <BannerActive
                                       banner={banner}
                                       onSuccess={(bannerId, updatedBanner) => {
                                          setBanners(prev => prev.map(b => b.id === bannerId ? updatedBanner : b));
                                       }}
                                    />
                                    <BannerDelete
                                       banner={banner}
                                       onSuccess={(deletedBannerId) => {
                                          setBanners(prev => prev.filter(b => b.id !== deletedBannerId));
                                       }}
                                    />
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