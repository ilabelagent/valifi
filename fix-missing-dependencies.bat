@echo off
echo.
echo ========================================
echo FIXING MISSING DEPENDENCIES FOR VALIFI
echo ========================================
echo.

echo Stopping any running Next.js dev servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Installing missing npm packages for 2FA functionality...
echo.

:: Install otpauth for OTP generation and validation
echo Installing otpauth...
npm install otpauth

:: Install qrcode for QR code generation
echo Installing qrcode...
npm install qrcode

:: Install TypeScript types if available
echo Installing TypeScript types...
npm install --save-dev @types/qrcode

echo.
echo ========================================
echo DEPENDENCIES INSTALLED SUCCESSFULLY!
echo ========================================
echo.
echo The following packages have been installed:
echo - otpauth: For generating and validating TOTP tokens
echo - qrcode: For generating QR codes for authenticator apps
echo - @types/qrcode: TypeScript definitions for qrcode
echo.
echo You can now run 'npm run dev' to start the development server.
echo.
pause
