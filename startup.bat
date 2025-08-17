@echo off
echo.
echo ================================
echo  Family Grove Connect - Startup
echo ================================
echo.

echo 🔄 Starting Backend Server...
cd server
start "Backend Server" cmd /c "npm start"
timeout /t 3 /nobreak >nul

echo 🔄 Starting Frontend Server...
cd ..
start "Frontend Server" cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ✅ Both servers are starting up!
echo.
echo 📱 Frontend: http://localhost:8081
echo 🔧 Backend:  http://localhost:5000
echo 💾 Health:   http://localhost:5000/api/health
echo.
echo Demo Login Credentials:
echo Admin: 9380102924 / 123456
echo Member: 9380102925 / 123456
echo Family Code: DEMO123
echo.
pause
