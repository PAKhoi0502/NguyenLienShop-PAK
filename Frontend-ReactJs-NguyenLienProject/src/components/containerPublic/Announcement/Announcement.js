import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { getActiveAnnouncements } from '../../../services/publicAnnouncementService';
import './Announcement.scss';

const Announcement = () => {
    const [hideBanner, setHideBanner] = useState(false);
    const [showBanner, setShowBanner] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

    const handleCloseBanner = () => {
        setHideBanner(true);
        setTimeout(() => setShowBanner(false), 400);
    }

    // Fallback notifications nếu không có data từ API
    const fallbackNotifications = React.useMemo(() => [
        'SALE UP 25% – Áp dụng từ hôm nay',
        'MUA 10 TẶNG 1 – Dành cho khách thân thiết',
        'Miễn phí vận chuyển toàn quốc',
    ], []);

    // Fetch active announcements from API
    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await getActiveAnnouncements();
                if (res.errCode === 0 && res.announcements && res.announcements.length > 0) {
                    // Sắp xếp theo priority (1 = cao nhất, 5 = thấp nhất)
                    const sortedAnnouncements = [...res.announcements].sort((a, b) => {
                        const priorityA = a.priority || 5; // Default priority 5 nếu không có
                        const priorityB = b.priority || 5;
                        return priorityA - priorityB; // Sắp xếp tăng dần (1,2,3,4,5)
                    });
                    setAnnouncements(sortedAnnouncements);
                } else {
                    // Sử dụng fallback notifications nếu không có data
                    setAnnouncements(fallbackNotifications.map((text, index) => ({
                        id: `fallback-${index}`,
                        title: text,
                        content: '',
                        icon: '🔔',
                        priority: 3 // Default priority cho fallback
                    })));
                }
            } catch (error) {
                console.error('Error fetching announcements:', error);
                // Sử dụng fallback notifications khi có lỗi
                setAnnouncements(fallbackNotifications.map((text, index) => ({
                    id: `fallback-${index}`,
                    title: text,
                    content: '',
                    icon: '🔔',
                    priority: 3 // Default priority cho fallback
                })));
            } finally {
                setLoadingAnnouncements(false);
            }
        };

        fetchAnnouncements();
    }, []);

    // Helper function để lấy class CSS dựa trên priority
    const getPriorityClass = (priority) => {
        const p = priority || 5;
        if (p <= 1) return 'priority-critical';      // Priority 1: Cao nhất - màu đỏ
        if (p <= 2) return 'priority-high';          // Priority 2: Cao - màu cam
        if (p <= 3) return 'priority-medium';        // Priority 3: Trung bình - màu vàng
        if (p <= 4) return 'priority-low';           // Priority 4: Thấp - màu xanh nhạt
        return 'priority-minimal';                   // Priority 5: Thấp nhất - màu xám
    };

    // Helper function để lấy styling dựa trên priority (không cần nữa vì đã dùng CSS)
    // const getPriorityStyle = (priority) => {
    //     // Không cần inline styles nữa, chỉ dùng CSS classes
    //     return {};
    // };

    if (!showBanner || loadingAnnouncements || announcements.length === 0) {
        return null;
    }

    return (
        <div className="announcement-container">
            <div className={`top-banner ${hideBanner ? 'hide' : ''}`}>
                <div className="banner-marquee-wrapper">
                    <div className="banner-marquee">
                        {/* Duplicate announcements để tạo hiệu ứng marquee liên tục */}
                        {announcements.map((announcement) => (
                            <span
                                key={`first-${announcement.id}`}
                                className={`marquee-item ${getPriorityClass(announcement.priority)}`}
                                data-icon={announcement.icon}
                            >
                                {announcement.title}
                                {announcement.content && ` - ${announcement.content}`}
                            </span>
                        ))}
                        {announcements.map((announcement) => (
                            <span
                                key={`second-${announcement.id}`}
                                className={`marquee-item ${getPriorityClass(announcement.priority)}`}
                                data-icon={announcement.icon}
                            >
                                {announcement.title}
                                {announcement.content && ` - ${announcement.content}`}
                            </span>
                        ))}
                    </div>
                </div>
                <button className="close-btn" onClick={handleCloseBanner}>
                    <FaTimes />
                </button>
            </div>
        </div>
    );
};

export default Announcement;
