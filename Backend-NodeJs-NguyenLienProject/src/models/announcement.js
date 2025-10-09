'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Announcement extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // Định nghĩa các association nếu có (Ví dụ: liên kết với bảng khác)
            // Announcement.belongsTo(models.User, { foreignKey: 'createdBy', targetKey: 'id' });
        }

        /**
         * Check if announcement is currently active based on dates
         */
        isCurrentlyActive() {
            const now = new Date();

            if (!this.isActive) return false;

            if (this.startDate && now < this.startDate) return false;
            if (this.endDate && now > this.endDate) return false;

            return true;
        }
    }

    Announcement.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Tiêu đề không được để trống'
                },
                len: {
                    args: [1, 255],
                    msg: 'Tiêu đề phải có từ 1 đến 255 ký tự'
                }
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Nội dung không được để trống'
                },
                len: {
                    args: [1, 2000],
                    msg: 'Nội dung phải có từ 1 đến 2000 ký tự'
                }
            }
        },
        icon: {
            type: DataTypes.ENUM('📢', 'ℹ️', '✅', '⚠️', '🎉', '🔧', '🚀', '🎁', '💰', '❌'),
            allowNull: false,
            defaultValue: '📢',
            validate: {
                isIn: {
                    args: [['📢', 'ℹ️', '✅', '⚠️', '🎉', '🔧', '🚀', '🎁', '💰', '❌']],
                    msg: 'Icon không hợp lệ'
                }
            }
        },
        type: {
            type: DataTypes.ENUM('info', 'warning', 'success', 'error'),
            allowNull: false,
            defaultValue: 'info',
            validate: {
                isIn: {
                    args: [['info', 'warning', 'success', 'error']],
                    msg: 'Loại thông báo không hợp lệ'
                }
            }
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: {
                    args: [1],
                    msg: 'Độ ưu tiên phải lớn hơn hoặc bằng 1'
                },
                max: {
                    args: [5],
                    msg: 'Độ ưu tiên phải nhỏ hơn hoặc bằng 5'
                }
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                isDate: {
                    msg: 'Ngày bắt đầu không hợp lệ'
                }
            }
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                isDate: {
                    msg: 'Ngày kết thúc không hợp lệ'
                }
            }
        },
        isDismissible: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        backgroundColor: {
            type: DataTypes.STRING(7),
            allowNull: false,
            defaultValue: '#3b82f6',
            validate: {
                is: {
                    args: /^#[0-9A-F]{6}$/i,
                    msg: 'Màu nền phải là mã hex hợp lệ (VD: #3b82f6)'
                }
            }
        },
        textColor: {
            type: DataTypes.STRING(7),
            allowNull: false,
            defaultValue: '#ffffff',
            validate: {
                is: {
                    args: /^#[0-9A-F]{6}$/i,
                    msg: 'Màu chữ phải là mã hex hợp lệ (VD: #ffffff)'
                }
            }
        },
        position: {
            type: DataTypes.ENUM('top', 'bottom'),
            allowNull: false,
            defaultValue: 'top',
            validate: {
                isIn: {
                    args: [['top', 'bottom']],
                    msg: 'Vị trí hiển thị phải là top hoặc bottom'
                }
            }
        }
    }, {
        sequelize,
        modelName: 'Announcement',
        tableName: 'Announcements',
        hooks: {
            beforeValidate: (announcement) => {
                // Validate date range
                if (announcement.startDate && announcement.endDate) {
                    if (announcement.startDate >= announcement.endDate) {
                        throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
                    }
                }
            }
        }
    });

    return Announcement;
};
