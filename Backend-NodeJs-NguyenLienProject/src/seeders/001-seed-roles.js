'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Seed roles data
        await queryInterface.bulkInsert('Roles', [
            {
                id: 1,
                name: 'admin',
                description: 'Quản trị viên hệ thống',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 2,
                name: 'user',
                description: 'Người dùng thông thường',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});

        // Hash password for admin user
        const hashedPassword = await bcrypt.hash('khoivk8939', 10);

        // Seed default admin user
        await queryInterface.bulkInsert('Users', [
            {
                userName: 'admin_default',
                password: hashedPassword,
                email: 'admin@nguyenlien.com',
                phoneNumber: '0979502094',
                fullName: 'Administrator',
                gender: 'Nam',
                birthday: '1990-01-01',
                roleId: 1, // Admin role
                slug: 'admin-default',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        // Remove seeded data
        await queryInterface.bulkDelete('Users', {
            phoneNumber: '0979502094'
        }, {});

        await queryInterface.bulkDelete('Roles', {
            name: ['admin', 'user']
        }, {});
    }
};
