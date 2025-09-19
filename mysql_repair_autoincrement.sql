-- 🔧 MySQL Auto-Increment Repair Script
-- Run this script in MySQL to fix the auto-increment issue

-- Step 1: Connect to database
USE your_database_name;

-- Step 2: Check current table status
SELECT 'Checking table status...' as Message;
SHOW TABLE STATUS LIKE 'refresh_tokens';

-- Step 3: Check current auto-increment value
SELECT 'Checking auto-increment value...' as Message;
SELECT AUTO_INCREMENT FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'refresh_tokens';

-- Step 4: Check table integrity
SELECT 'Checking table integrity...' as Message;
CHECK TABLE refresh_tokens;

-- Step 5: Get current max ID
SELECT 'Getting max ID...' as Message;
SELECT COALESCE(MAX(id), 0) as max_id FROM refresh_tokens;

-- Step 6: Reset auto-increment to safe value
SELECT 'Resetting auto-increment...' as Message;
ALTER TABLE refresh_tokens AUTO_INCREMENT = 1;

-- Alternative: If you have existing data, use this instead:
-- SET @max_id = (SELECT COALESCE(MAX(id), 0) + 1 FROM refresh_tokens);
-- SET @sql = CONCAT('ALTER TABLE refresh_tokens AUTO_INCREMENT = ', @max_id);
-- PREPARE stmt FROM @sql;
-- EXECUTE stmt;
-- DEALLOCATE PREPARE stmt;

-- Step 7: Test insert to verify fix
SELECT 'Testing insert...' as Message;
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
    'test_token_please_delete', 
    999, 
    'Test Device', 
    '127.0.0.1', 
    false, 
    DATE_ADD(NOW(), INTERVAL 1 DAY),
    NOW(),
    NOW()
);

-- Step 8: Check if test insert worked
SELECT 'Verifying test insert...' as Message;
SELECT * FROM refresh_tokens WHERE token = 'test_token_please_delete';

-- Step 9: Clean up test data
SELECT 'Cleaning up test data...' as Message;
DELETE FROM refresh_tokens WHERE token = 'test_token_please_delete';

-- Step 10: Final verification
SELECT 'Final table status check...' as Message;
SHOW TABLE STATUS LIKE 'refresh_tokens';

SELECT 'Auto-increment repair completed!' as Message;