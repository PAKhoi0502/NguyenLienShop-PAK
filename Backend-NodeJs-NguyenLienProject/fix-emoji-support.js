// Script để kiểm tra và sửa hỗ trợ emoji trong database
const { Sequelize } = require('sequelize');

// Tạo connection riêng cho script này
const sequelize = new Sequelize(
    process.env.DB_NAME || 'nguyenlien',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || null,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        timezone: '+07:00'
    }
);

async function fixEmojiSupport() {
    try {
        console.log('🔍 Kiểm tra hỗ trợ emoji trong database...\n');

        // Kiểm tra charset hiện tại
        const [charsetResults] = await sequelize.query("SHOW VARIABLES LIKE 'character_set%'");
        console.log('📊 Character Set Variables:');
        charsetResults.forEach(row => {
            console.log(`   ${row.Variable_name}: ${row.Value}`);
        });

        // Kiểm tra collation hiện tại
        const [collationResults] = await sequelize.query("SHOW VARIABLES LIKE 'collation%'");
        console.log('\n📊 Collation Variables:');
        collationResults.forEach(row => {
            console.log(`   ${row.Variable_name}: ${row.Value}`);
        });

        // Kiểm tra database charset
        const [dbResults] = await sequelize.query("SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = 'nguyenlien'");
        console.log('\n📊 Database nguyenlien:');
        if (dbResults.length > 0) {
            console.log(`   Character Set: ${dbResults[0].DEFAULT_CHARACTER_SET_NAME}`);
            console.log(`   Collation: ${dbResults[0].DEFAULT_COLLATION_NAME}`);
        }

        // Kiểm tra bảng Announcements
        const [tableResults] = await sequelize.query("SHOW CREATE TABLE Announcements");
        console.log('\n📊 Table Announcements:');
        console.log(`   ${tableResults[0]['Create Table']}`);

        // Test emoji insert
        console.log('\n🧪 Testing emoji insert...');
        const testEmojis = ['📢', 'ℹ️', '✅', '⚠️', '🎉', '🔧', '🚀', '🎁', '💰', '❌'];
        
        for (const emoji of testEmojis) {
            try {
                const [result] = await sequelize.query(
                    "INSERT INTO Announcements (title, content, icon, type, priority, isActive) VALUES (?, ?, ?, ?, ?, ?)",
                    {
                        replacements: ['Test', 'Test content', emoji, 'info', 1, false]
                    }
                );
                console.log(`   ✅ ${emoji} - Inserted successfully (ID: ${result[0].insertId})`);
                
                // Xóa test record
                await sequelize.query("DELETE FROM Announcements WHERE id = ?", {
                    replacements: [result[0].insertId]
                });
            } catch (error) {
                console.log(`   ❌ ${emoji} - Failed: ${error.message}`);
            }
        }

        console.log('\n✅ Emoji support check completed!');

    } catch (error) {
        console.error('❌ Error checking emoji support:', error.message);
    } finally {
        await sequelize.close();
    }
}

// Chạy script
fixEmojiSupport();
