# 🚨 URGENT: MySQL Auto-Increment Error Fix

## ❌ Critical Error

```
ER_AUTOINC_READ_FAILED: Failed to read auto-increment value from storage engine
```

**Severity**: CRITICAL - Database không thể insert record mới vào bảng `refresh_tokens`

## 🔍 Nguyên nhân

### 1. **MySQL Auto-Increment Corruption**
- Auto-increment counter bị corrupt hoặc không consistent
- Engine không thể đọc next auto-increment value
- Có thể do server crash, disk issues, hoặc data corruption

### 2. **Possible Triggers**
- Server shutdown không clean
- Disk space hết
- MySQL engine issues (InnoDB/MyISAM)
- Table corruption

## 🚨 IMMEDIATE FIX REQUIRED

### Step 1: Check Database Status
```sql
-- Check table status
SHOW TABLE STATUS LIKE 'refresh_tokens';

-- Check auto-increment value
SELECT AUTO_INCREMENT FROM information_schema.tables 
WHERE table_schema = 'your_database_name' 
AND table_name = 'refresh_tokens';

-- Check table integrity
CHECK TABLE refresh_tokens;
```

### Step 2: Repair Auto-Increment
```sql
-- Method 1: Reset auto-increment manually
ALTER TABLE refresh_tokens AUTO_INCREMENT = 1;

-- Method 2: Reset based on max existing ID
SELECT MAX(id) + 1 FROM refresh_tokens;
ALTER TABLE refresh_tokens AUTO_INCREMENT = [MAX_ID + 1];

-- Method 3: Repair table if corrupted  
REPAIR TABLE refresh_tokens;
```

### Step 3: Emergency Workaround
```sql
-- Temporary: Drop and recreate table (LAST RESORT)
-- BACKUP DATA FIRST!
CREATE TABLE refresh_tokens_backup AS SELECT * FROM refresh_tokens;
DROP TABLE refresh_tokens;

-- Run migration again
-- npm run migrate
```

## 🔧 Quick Terminal Fix

Run these commands in MySQL:

```bash
# Connect to MySQL
mysql -u root -p

# Select your database
USE your_database_name;

# Check table status
SHOW TABLE STATUS LIKE 'refresh_tokens';

# Reset auto-increment
ALTER TABLE refresh_tokens AUTO_INCREMENT = 1;

# Test insert
INSERT INTO refresh_tokens (token, userId, deviceInfo, ipAddress, isActive, expiresAt) 
VALUES ('test', 1, 'test', '127.0.0.1', true, NOW() + INTERVAL 30 DAY);

# Check if it worked
SELECT * FROM refresh_tokens ORDER BY id DESC LIMIT 1;

# Clean up test data
DELETE FROM refresh_tokens WHERE token = 'test';
```

## ⚠️ Prevention Measures

1. **Regular Database Backup**
2. **Monitor Disk Space** 
3. **Clean MySQL Shutdown**
4. **Check MySQL Error Logs**

## 🎯 Expected Results

After fix:
- ✅ `ALTER TABLE` command succeeds
- ✅ Auto-increment reset to proper value
- ✅ INSERT operations work normally
- ✅ No more `ER_AUTOINC_READ_FAILED` errors

---

## 🚀 STATUS: NEEDS IMMEDIATE DATABASE REPAIR

This is a **DATABASE ISSUE**, not a code issue. Must be fixed at MySQL level first!