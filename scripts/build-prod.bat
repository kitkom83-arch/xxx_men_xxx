@echo off
REM Build Script for Production - V6.1
REM 
REM This script builds the Next.js app for production deployment.
REM Note: This is a web app (Next.js), not a standalone .exe

echo.
echo ========================================
echo X Social Real - Build Production V6.1
echo ========================================
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ first.
    exit /b 1
)

echo [1/5] Checking Node.js version...
node --version

echo [2/5] Installing dependencies...
call npm ci --legacy-peer-deps
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed.
    exit /b 1
)

echo [3/5] Generating Prisma client...
call npm run prisma:generate
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Prisma generate failed.
    exit /b 1
)

echo [4/5] Building Next.js application...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Next.js build failed.
    exit /b 1
)

echo [5/5] Verifying build output...
if exist ".next\BUILDId" (
    echo [OK] Build output verified.
) else (
    echo [WARNING] BuildId not found, but build may have succeeded.
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Output directory: .next\
echo.
echo To run production server:
echo   npm start
echo.
echo Or with custom port:
echo   set PORT=3001 && npm start
echo.

exit /b 0
