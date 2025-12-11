@echo off
echo ============================================================
echo 🎙️  Audio Recognition System - Quick Start
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Python and Node.js are installed
echo.

REM Install Python dependencies if needed
echo 📦 Checking Python dependencies...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)
echo ✅ Python dependencies ready
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install Node.js dependencies
        pause
        exit /b 1
    )
)
echo ✅ Node.js dependencies ready
echo.

echo ============================================================
echo 🚀 Starting servers...
echo ============================================================
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:5173
echo.
echo To stop servers: Press Ctrl+C in each window
echo ============================================================
echo.

REM Start backend server in a new window
start "FastAPI Backend Server" cmd /k "python server.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server in a new window
start "Vite Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Servers starting in new windows...
echo.
echo 📚 Useful URLs:
echo    - Frontend: http://localhost:5173
echo    - Backend: http://localhost:5000
echo    - API Docs: http://localhost:5000/docs
echo    - Health Check: http://localhost:5000/health
echo.
echo 📖 See README.md for usage instructions
echo.
pause
