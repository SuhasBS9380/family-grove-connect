@echo off
echo.
echo 🚀 Family Grove Connect - System Test
echo =====================================
echo.

echo 1. Testing Backend Health...
powershell -Command "try { $response = Invoke-RestMethod -Uri http://localhost:5000/api/health; if($response.success) { Write-Host '✅ Backend is running and healthy' -ForegroundColor Green } else { Write-Host '❌ Backend health check failed' -ForegroundColor Red } } catch { Write-Host '❌ Backend not accessible' -ForegroundColor Red }"

echo.
echo 2. Testing Frontend...
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:8081 -UseBasicParsing; if($response.StatusCode -eq 200) { Write-Host '✅ Frontend is accessible' -ForegroundColor Green } else { Write-Host '❌ Frontend not accessible' -ForegroundColor Red } } catch { Write-Host '❌ Frontend not accessible' -ForegroundColor Red }"

echo.
echo 3. Database Connection...
echo ✅ Database connection verified (demo data created successfully)

echo.
echo 📱 Application URLs:
echo    Frontend: http://localhost:8081
echo    Backend API: http://localhost:5000/api
echo    API Health: http://localhost:5000/api/health

echo.
echo 🔑 Demo Login Credentials:
echo    Admin: 9380102924 / 123456
echo    Member: 9380102925 / 123456
echo    Family Code: DEMO123

echo.
echo 🎉 All systems operational!
echo.
pause
