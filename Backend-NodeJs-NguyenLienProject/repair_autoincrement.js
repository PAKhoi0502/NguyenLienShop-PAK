/**
 * 🔧 MySQL Auto-Increment Repair Script
 * This script fixes the "Failed to read auto-increment value from storage engine" error
 */

const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config/config.json');

// Use development config
const sequelize = new Sequelize(config.development);

async function repairAutoIncrement() {
    try {
        console.log('🔧 Starting MySQL auto-increment repair...');

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Get current table status
        console.log('\n📊 Checking table status...');
        const [tableStatus] = await sequelize.query(`SHOW TABLE STATUS LIKE 'refresh_tokens'`);
        console.log('Table status:', tableStatus[0]);

        // Get current max ID
        console.log('\n🔍 Getting current max ID...');
        const [maxIdResult] = await sequelize.query(`SELECT COALESCE(MAX(id), 0) as max_id FROM refresh_tokens`);
        const maxId = maxIdResult[0].max_id;
        console.log('Current max ID:', maxId);

        // Calculate safe auto-increment value
        const safeAutoIncrement = maxId + 1;
        console.log('Safe auto-increment value:', safeAutoIncrement);

        // Reset auto-increment
        console.log('\n🔄 Resetting auto-increment...');
        await sequelize.query(`ALTER TABLE refresh_tokens AUTO_INCREMENT = ${safeAutoIncrement}`);
        console.log('✅ Auto-increment reset successfully');

        // Verify the fix
        console.log('\n🧪 Testing insert...');
        const testToken = 'test_token_' + Date.now();
        const testResult = await sequelize.query(`
            INSERT INTO refresh_tokens (
                token, 
                userId, 
                deviceInfo, 
                ipAddress, 
                isActive, 
                expiresAt,
                createdAt,
                updatedAt
            ) VALUES (
                ?, 999, 'Test Device', '127.0.0.1', false, 
                DATE_ADD(NOW(), INTERVAL 1 DAY), NOW(), NOW()
            )
        `, {
            replacements: [testToken]
        });

        console.log('✅ Test insert successful');

        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await sequelize.query(`DELETE FROM refresh_tokens WHERE token = ?`, {
            replacements: [testToken]
        });
        console.log('✅ Test data cleaned up');

        // Final status check
        console.log('\n📊 Final table status check...');
        const [finalStatus] = await sequelize.query(`SHOW TABLE STATUS LIKE 'refresh_tokens'`);
        console.log('Final table status:', finalStatus[0]);

        console.log('\n🎉 Auto-increment repair completed successfully!');
        console.log('✅ You can now restart your server and try logging in again.');

    } catch (error) {
        console.error('❌ Error during repair:', error);

        if (error.name === 'SequelizeDatabaseError' && error.parent.code === 'ER_AUTOINC_READ_FAILED') {
            console.log('\n💡 Advanced repair needed. Trying alternative method...');

            try {
                // Try more aggressive repair
                console.log('🔧 Running table repair...');
                await sequelize.query(`REPAIR TABLE refresh_tokens`);

                console.log('🔧 Trying to recreate auto-increment...');
                await sequelize.query(`ALTER TABLE refresh_tokens AUTO_INCREMENT = 1`);

                console.log('✅ Advanced repair completed. Try the operation again.');

            } catch (advancedError) {
                console.error('❌ Advanced repair also failed:', advancedError);
                console.log('\n🆘 Manual intervention required:');
                console.log('1. Open MySQL Workbench or phpMyAdmin');
                console.log('2. Run: USE nguyenlien;');
                console.log('3. Run: REPAIR TABLE refresh_tokens;');
                console.log('4. Run: ALTER TABLE refresh_tokens AUTO_INCREMENT = 1;');
                console.log('5. Restart your Node.js server');
            }
        }
    } finally {
        await sequelize.close();
        console.log('\n👋 Database connection closed');
    }
}

// Run the repair
repairAutoIncrement();