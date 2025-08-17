@echo off
echo.
echo ================================================
echo   MongoDB Atlas IP Whitelist Fix Instructions
echo ================================================
echo.
echo ❌ ERROR: Your IP address is not whitelisted in MongoDB Atlas
echo.
echo 🌐 Your Current IP Address: 157.50.191.107
echo.
echo 📋 To Fix This Issue:
echo.
echo 1️⃣  Open your web browser
echo 2️⃣  Go to: https://cloud.mongodb.com/
echo 3️⃣  Log in with your MongoDB Atlas account
echo 4️⃣  Click "Network Access" in the left sidebar
echo 5️⃣  Click "ADD IP ADDRESS" button
echo 6️⃣  Enter your IP: 157.50.191.107
echo     OR click "ADD CURRENT IP ADDRESS"
echo 7️⃣  Add a comment: "Development Machine"
echo 8️⃣  Click "Confirm"
echo.
echo ⚡ Quick Fix (Less Secure):
echo    - Add IP: 0.0.0.0/0 to allow all IPs
echo    - Only use this for development!
echo.
echo 🔄 After whitelisting your IP:
echo    - Restart your backend server
echo    - The MongoDB connection should work
echo.
echo 💡 Alternative: Use Local MongoDB
echo    - Install MongoDB locally
echo    - Uncomment the local connection in .env file
echo.
pause
