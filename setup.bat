@echo off
echo Installing Family Grove Connect Dependencies...
echo.

echo Installing frontend dependencies...
call npm install

echo.
echo Installing backend dependencies...
cd server
call npm install
cd ..

echo.
echo Installation complete!
echo.
echo To start the application:
echo 1. Backend: npm run server:dev
echo 2. Frontend: npm run dev
echo 3. Both: npm start
echo.
pause
