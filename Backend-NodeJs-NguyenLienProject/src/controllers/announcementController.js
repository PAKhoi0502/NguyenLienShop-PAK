import announcementService from '../services/announcementService.js';

// ==============================================
// 📢 GET ALL ANNOUNCEMENTS
// ==============================================
let handleGetAnnouncements = async (req, res) => {
    try {
        const announcements = await announcementService.getAnnouncements();
        res.status(200).json({
            errCode: 0,
            errMessage: 'Lấy danh sách thông báo thành công',
            announcements: announcements
        });
    } catch (err) {
        console.error('Error in handleGetAnnouncements:', err.message, err.stack);
        res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi lấy danh sách thông báo: ' + err.message });
    }
};

// ==============================================
// 📢 GET ANNOUNCEMENT BY ID
// ==============================================
let handleGetAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ errCode: 1, errMessage: 'ID thông báo là bắt buộc' });
        }

        const announcement = await announcementService.getAnnouncementById(id);

        if (!announcement) {
            return res.status(404).json({ errCode: 1, errMessage: 'Không tìm thấy thông báo' });
        }

        res.status(200).json({
            errCode: 0,
            errMessage: 'Lấy thông tin thông báo thành công',
            announcement: announcement
        });
    } catch (err) {
        console.error('Error in handleGetAnnouncementById:', err.message, err.stack);
        res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi lấy thông tin thông báo: ' + err.message });
    }
};

// ==============================================
// 📢 CREATE ANNOUNCEMENT
// ==============================================
let handleCreateAnnouncement = async (req, res) => {
    try {
        const {
            title,
            content,
            icon,
            type,
            priority,
            isActive,
            startDate,
            endDate,
            isDismissible,
            backgroundColor,
            textColor,
            position
        } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Tiêu đề và nội dung là bắt buộc'
            });
        }

        const announcementData = {
            title,
            content,
            icon,
            type,
            priority,
            isActive,
            startDate,
            endDate,
            isDismissible,
            backgroundColor,
            textColor,
            position
        };

        const announcement = await announcementService.createAnnouncement(announcementData);

        res.status(201).json({
            errCode: 0,
            errMessage: 'Tạo thông báo thành công',
            announcement: announcement
        });
    } catch (err) {
        console.error('Error in handleCreateAnnouncement:', err.message, err.stack);
        res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi tạo thông báo: ' + err.message });
    }
};

// ==============================================
// 📢 UPDATE ANNOUNCEMENT
// ==============================================
let handleUpdateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return res.status(400).json({ errCode: 1, errMessage: 'ID thông báo là bắt buộc' });
        }

        const result = await announcementService.updateAnnouncement(id, updateData);

        if (result.errCode !== 0) {
            return res.status(400).json(result);
        }

        res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleUpdateAnnouncement:', err.message, err.stack);
        res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi cập nhật thông báo: ' + err.message });
    }
};

// ==============================================
// 📢 DELETE ANNOUNCEMENT
// ==============================================
let handleDeleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ errCode: 1, errMessage: 'ID thông báo là bắt buộc' });
        }

        const result = await announcementService.deleteAnnouncement(id);

        if (result.errCode !== 0) {
            return res.status(404).json(result);
        }

        res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleDeleteAnnouncement:', err.message, err.stack);
        res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi xóa thông báo: ' + err.message });
    }
};

// ==============================================
// 📢 TOGGLE ANNOUNCEMENT STATUS
// ==============================================
let handleToggleAnnouncementStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ errCode: 1, errMessage: 'ID thông báo là bắt buộc' });
        }

        const result = await announcementService.toggleAnnouncementStatus(id);

        if (result.errCode !== 0) {
            return res.status(404).json(result);
        }

        res.status(200).json(result);
    } catch (err) {
        console.error('Error in handleToggleAnnouncementStatus:', err.message, err.stack);
        res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi thay đổi trạng thái thông báo: ' + err.message });
    }
};

// ==============================================
// 📢 GET ACTIVE ANNOUNCEMENTS (PUBLIC API)
// ==============================================
let handleGetActiveAnnouncements = async (req, res) => {
    try {
        const announcements = await announcementService.getActiveAnnouncements();
        res.status(200).json({
            errCode: 0,
            errMessage: 'Lấy thông báo đang hoạt động thành công',
            announcements: announcements
        });
    } catch (err) {
        console.error('Error in handleGetActiveAnnouncements:', err.message, err.stack);
        res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi lấy thông báo đang hoạt động: ' + err.message });
    }
};

// ==============================================
// 📢 GET ANNOUNCEMENTS BY TYPE
// ==============================================
let handleGetAnnouncementsByType = async (req, res) => {
    try {
        const { type } = req.params;

        if (!type) {
            return res.status(400).json({ errCode: 1, errMessage: 'Loại thông báo là bắt buộc' });
        }

        const announcements = await announcementService.getAnnouncementsByType(type);
        res.status(200).json({
            errCode: 0,
            errMessage: `Lấy thông báo loại ${type} thành công`,
            announcements: announcements
        });
    } catch (err) {
        console.error('Error in handleGetAnnouncementsByType:', err.message, err.stack);
        res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi lấy thông báo theo loại: ' + err.message });
    }
};

// ==============================================
// 📢 GET ANNOUNCEMENTS BY POSITION
// ==============================================
let handleGetAnnouncementsByPosition = async (req, res) => {
    try {
        const { position } = req.params;

        if (!position) {
            return res.status(400).json({ errCode: 1, errMessage: 'Vị trí thông báo là bắt buộc' });
        }

        const announcements = await announcementService.getAnnouncementsByPosition(position);
        res.status(200).json({
            errCode: 0,
            errMessage: `Lấy thông báo vị trí ${position} thành công`,
            announcements: announcements
        });
    } catch (err) {
        console.error('Error in handleGetAnnouncementsByPosition:', err.message, err.stack);
        res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi lấy thông báo theo vị trí: ' + err.message });
    }
};

// ==============================================
// 📢 SEARCH ANNOUNCEMENTS
// ==============================================
let handleSearchAnnouncements = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ errCode: 1, errMessage: 'Từ khóa tìm kiếm là bắt buộc' });
        }

        const announcements = await announcementService.searchAnnouncements(q);
        res.status(200).json({
            errCode: 0,
            errMessage: `Tìm kiếm thông báo với từ khóa "${q}" thành công`,
            announcements: announcements
        });
    } catch (err) {
        console.error('Error in handleSearchAnnouncements:', err.message, err.stack);
        res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi tìm kiếm thông báo: ' + err.message });
    }
};

export default {
    handleGetAnnouncements,
    handleGetAnnouncementById,
    handleCreateAnnouncement,
    handleUpdateAnnouncement,
    handleDeleteAnnouncement,
    handleToggleAnnouncementStatus,
    handleGetActiveAnnouncements,
    handleGetAnnouncementsByType,
    handleGetAnnouncementsByPosition,
    handleSearchAnnouncements
};
