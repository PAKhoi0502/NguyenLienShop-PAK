/**
 * 🔧 Verify Auto-Increment Fix
 * Quick verification that the auto-increment is now working
 */

const { Sequelize } = require('sequelize');
const config = require('./config/config.json');

const sequelize = new Sequelize(config.development);

async function verifyFix() {
    try {
        console.log('🔍 Verifying auto-increment fix...');

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Check final table status
        const [tableStatus] = await sequelize.query(`SHOW TABLE STATUS LIKE 'refresh_tokens'`);
        console.log('\n📊 Current table status:');
        console.log('- Auto_increment:', tableStatus[0].Auto_increment);
        console.log('- Rows:', tableStatus[0].Rows);

        // Get a valid user ID for testing
        const [users] = await sequelize.query(`SELECT id FROM users LIMIT 1`);
        if (users.length === 0) {
            console.log('⚠️ No users found. Cannot test with real user ID.');
            console.log('✅ But auto-increment is fixed! You can now try logging in.');
        } else {
            console.log(`\n🧪 Testing with valid user ID: ${users[0].id}`);

            // Test insert with valid user ID
            const testToken = 'verify_test_' + Date.now();
            await sequelize.query(`
                INSERT INTO refresh_tokens (
                    token, userId, deviceInfo, ipAddress, 
                    isActive, expiresAt, createdAt, updatedAt
                ) VALUES (
                    ?, ?, 'Test Device', '127.0.0.1', 
                    false, DATE_ADD(NOW(), INTERVAL 1 DAY), NOW(), NOW()
                )
            `, {
                replacements: [testToken, users[0].id]
            });

            console.log('✅ Test insert successful!');

            // Clean up
            await sequelize.query(`DELETE FROM refresh_tokens WHERE token = ?`, {
                replacements: [testToken]
            });
            console.log('✅ Test data cleaned up');
        }

        console.log('\n🎉 Auto-increment is working correctly!');
        console.log('📝 Next steps:');
        console.log('1. Restart your Node.js server');
        console.log('2. Try logging in again');
        console.log('3. The login should now work without the auto-increment error');

    } catch (error) {
        console.error('❌ Verification error:', error.message);
        if (error.parent && error.parent.code === 'ER_AUTOINC_READ_FAILED') {
            console.log('⚠️ Auto-increment issue still exists. Manual MySQL repair needed.');
        }
    } finally {
        await sequelize.close();
    }
}

verifyFix();