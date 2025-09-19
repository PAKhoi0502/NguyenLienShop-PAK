@echo off
echo ================================
echo MySQL Auto-Increment Repair Tool
echo ================================
echo.

echo This script will help you fix the auto-increment issue in MySQL
echo.

echo Step 1: Open MySQL Command Line or MySQL Workbench
echo Step 2: Connect to your database
echo Step 3: Run the commands below:
echo.

echo *** COPY AND PASTE THESE COMMANDS INTO MYSQL ***
echo.

echo -- Connect to your database
echo USE your_database_name;
echo.

echo -- Check table status
echo SHOW TABLE STATUS LIKE 'refresh_tokens';
echo.

echo -- Reset auto-increment
echo ALTER TABLE refresh_tokens AUTO_INCREMENT = 1;
echo.

echo -- Test if it works
echo SELECT 'Auto-increment fixed!' as result;
echo.

echo *** END OF MYSQL COMMANDS ***
echo.

echo After running these commands:
echo 1. Restart your Node.js backend
echo 2. Try logging in again
echo 3. Check if the error is gone
echo.

echo If you still get errors:
echo - Check MySQL error logs
echo - Try: REPAIR TABLE refresh_tokens;
echo - Contact database administrator
echo.

pause