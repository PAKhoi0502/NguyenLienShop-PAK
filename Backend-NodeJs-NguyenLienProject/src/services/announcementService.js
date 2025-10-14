import db from '../models/index.js';

// ==============================================
// 📢 GET ALL ANNOUNCEMENTS
// ==============================================
let getAnnouncements = async () => {
    try {
        const announcements = await db.Announcement.findAll({
            order: [['priority', 'DESC'], ['createdAt', 'DESC']]
        });
        return announcements;
    } catch (err) {
        throw new Error('Lỗi khi lấy danh sách thông báo');
    }
};

// ==============================================
// 📢 GET ANNOUNCEMENT BY ID
// ==============================================
let getAnnouncementById = async (id) => {
    try {
        const announcement = await db.Announcement.findByPk(id);
        return announcement;
    } catch (err) {
        throw new Error('Lỗi khi lấy thông tin thông báo');
    }
};

// ==============================================
// 📢 CREATE ANNOUNCEMENT
// ==============================================
let createAnnouncement = async (data) => {
    try {
        const announcement = await db.Announcement.create({
            title: data.title,
            content: data.content,
            icon: data.icon || '📢',
            type: data.type || 'info',
            priority: data.priority || 1,
            isActive: data.isActive !== undefined ? data.isActive : true,
            startDate: data.startDate || null,
            endDate: data.endDate || null,
            isDismissible: data.isDismissible !== undefined ? data.isDismissible : true,
            backgroundColor: data.backgroundColor || '#3b82f6',
            textColor: data.textColor || '#ffffff',
            position: data.position || 'top'
        });
        return announcement;
    } catch (err) {
        console.error('Error creating announcement:', err);
        throw new Error('Lỗi khi tạo thông báo: ' + err.message);
    }
};

// ==============================================
// 📢 UPDATE ANNOUNCEMENT
// ==============================================
let updateAnnouncement = async (id, data) => {
    try {
        const announcement = await db.Announcement.findByPk(id);
        if (!announcement) {
            return { errCode: 1, errMessage: 'Thông báo không tồn tại' };
        }

        // Validate date range if both dates are provided
        if (data.startDate && data.endDate) {
            if (new Date(data.startDate) >= new Date(data.endDate)) {
                return { errCode: 2, errMessage: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc' };
            }
        }

        const updateData = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.content !== undefined) updateData.content = data.content;
        if (data.icon !== undefined) updateData.icon = data.icon;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.priority !== undefined) updateData.priority = data.priority;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.startDate !== undefined) updateData.startDate = data.startDate;
        if (data.endDate !== undefined) updateData.endDate = data.endDate;
        if (data.isDismissible !== undefined) updateData.isDismissible = data.isDismissible;
        if (data.backgroundColor !== undefined) updateData.backgroundColor = data.backgroundColor;
        if (data.textColor !== undefined) updateData.textColor = data.textColor;
        if (data.position !== undefined) updateData.position = data.position;

        await announcement.update(updateData);

        return { errCode: 0, errMessage: 'Cập nhật thông báo thành công', announcement };
    } catch (err) {
        console.error('Error updating announcement:', err);
        throw new Error('Lỗi khi cập nhật thông báo: ' + err.message);
    }
};

// ==============================================
// 📢 DELETE ANNOUNCEMENT
// ==============================================
let deleteAnnouncement = async (id) => {
    try {
        const announcement = await db.Announcement.findByPk(id);
        if (!announcement) {
            return { errCode: 1, errMessage: 'Thông báo không tồn tại' };
        }

        await announcement.destroy();
        return { errCode: 0, errMessage: 'Xóa thông báo thành công' };
    } catch (err) {
        throw new Error('Lỗi khi xóa thông báo');
    }
};

// ==============================================
// 📢 TOGGLE ANNOUNCEMENT STATUS
// ==============================================
let toggleAnnouncementStatus = async (id) => {
    try {
        const announcement = await db.Announcement.findByPk(id);
        if (!announcement) {
            return { errCode: 1, errMessage: 'Thông báo không tồn tại' };
        }

        await announcement.update({ isActive: !announcement.isActive });

        return {
            errCode: 0,
            errMessage: `Thông báo đã được ${announcement.isActive ? 'ẩn' : 'hiển thị'}`,
            announcement
        };
    } catch (err) {
        throw new Error('Lỗi khi thay đổi trạng thái thông báo');
    }
};

// ==============================================
// 📢 GET ACTIVE ANNOUNCEMENTS (FOR PUBLIC API)
// ==============================================
let getActiveAnnouncements = async () => {
    try {
        const now = new Date();
        const announcements = await db.Announcement.findAll({
            where: {
                isActive: true,
                [db.Sequelize.Op.or]: [
                    { startDate: null },
                    { startDate: { [db.Sequelize.Op.lte]: now } }
                ],
                [db.Sequelize.Op.or]: [
                    { endDate: null },
                    { endDate: { [db.Sequelize.Op.gte]: now } }
                ]
            },
            order: [['priority', 'DESC'], ['createdAt', 'DESC']]
        });

        // Filter announcements that are currently active based on custom logic
        const activeAnnouncements = announcements.filter(announcement => {
            return announcement.isCurrentlyActive();
        });

        return activeAnnouncements;
    } catch (err) {
        throw new Error('Lỗi khi lấy thông báo đang hoạt động');
    }
};

// ==============================================
// 📢 GET ANNOUNCEMENTS BY TYPE
// ==============================================
let getAnnouncementsByType = async (type) => {
    try {
        const announcements = await db.Announcement.findAll({
            where: { type: type },
            order: [['priority', 'DESC'], ['createdAt', 'DESC']]
        });
        return announcements;
    } catch (err) {
        throw new Error('Lỗi khi lấy thông báo theo loại');
    }
};

// ==============================================
// 📢 GET ANNOUNCEMENTS BY POSITION
// ==============================================
let getAnnouncementsByPosition = async (position) => {
    try {
        const announcements = await db.Announcement.findAll({
            where: { position: position },
            order: [['priority', 'DESC'], ['createdAt', 'DESC']]
        });
        return announcements;
    } catch (err) {
        throw new Error('Lỗi khi lấy thông báo theo vị trí');
    }
};

// ==============================================
// 📢 SEARCH ANNOUNCEMENTS
// ==============================================
let searchAnnouncements = async (searchTerm) => {
    try {
        const announcements = await db.Announcement.findAll({
            where: {
                [db.Sequelize.Op.or]: [
                    { title: { [db.Sequelize.Op.like]: `%${searchTerm}%` } },
                    { content: { [db.Sequelize.Op.like]: `%${searchTerm}%` } }
                ]
            },
            order: [['priority', 'DESC'], ['createdAt', 'DESC']]
        });
        return announcements;
    } catch (err) {
        throw new Error('Lỗi khi tìm kiếm thông báo');
    }
};

// ==============================================
// 📢 GET ANNOUNCEMENT COUNT
// ==============================================
let getAnnouncementCount = async () => {
    try {
        const count = await db.Announcement.count();
        return count;
    } catch (err) {
        throw new Error('Lỗi khi đếm tổng số thông báo');
    }
};

// ==============================================
// 📢 CHECK AND UPDATE EXPIRED ANNOUNCEMENTS
// ==============================================
let checkAndUpdateExpiredAnnouncements = async () => {
    try {
        const now = new Date();

        // Tìm tất cả announcements đã hết hạn nhưng vẫn đang active
        const expiredAnnouncements = await db.Announcement.findAll({
            where: {
                endDate: {
                    [db.Sequelize.Op.lt]: now // endDate < now
                },
                isActive: true
            }
        });

        if (expiredAnnouncements.length > 0) {
            // Tự động vô hiệu hóa các announcements hết hạn
            await db.Announcement.update(
                { isActive: false },
                {
                    where: {
                        endDate: {
                            [db.Sequelize.Op.lt]: now
                        },
                        isActive: true
                    }
                }
            );

            console.log(`✅ Đã vô hiệu hóa ${expiredAnnouncements.length} thông báo hết hạn`);
        }

        return {
            errCode: 0,
            message: 'Kiểm tra thông báo hết hạn thành công',
            expiredCount: expiredAnnouncements.length
        };
    } catch (err) {
        console.error('Error checking expired announcements:', err);
        throw new Error('Lỗi khi kiểm tra thông báo hết hạn');
    }
};

export default {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementStatus,
    getActiveAnnouncements,
    getAnnouncementsByType,
    getAnnouncementsByPosition,
    searchAnnouncements,
    getAnnouncementCount,
    checkAndUpdateExpiredAnnouncements
};
