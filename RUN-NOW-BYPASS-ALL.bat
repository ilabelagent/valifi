@echo off
cls
echo ==============================================================================
echo                        VALIFI KINGDOM ULTIMATE LAUNCHER
echo                         BYPASSING ALL RESTRICTIONS
echo ==============================================================================
echo.
echo Starting Complete A-Z Automation with Full Bypass...
echo.

REM Run PowerShell with complete bypass
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& {Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; .\MASTER-VALIFI-LAUNCHER.ps1}"

if errorlevel 1 (
    echo.
    echo ==============================================================================
    echo Fallback: Running with alternate method...
    echo ==============================================================================
    powershell.exe -Command "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; & '.\MASTER-VALIFI-LAUNCHER.ps1'"
)

pause
