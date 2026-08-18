@echo off
title Contrax Project Launcher
echo ==============================================================
echo                 Contrax Project Launcher                  
echo ==============================================================
echo.
echo [1/3] Starting Django REST API backend...
start cmd /k "title Django Backend Server && cd backend && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) && python manage.py runserver 0.0.0.0:8000"

echo [2/3] Starting Vite React frontend...
start cmd /k "title React Frontend Server && cd frontend && npm run dev -- --host"

echo [3/3] Launching web browser to http://localhost:5173/ ...
timeout /t 3 >nul
start http://localhost:5173/

echo.
echo ============================================================== 
echo Project launched! 
echo Keep the backend and frontend command windows open.
echo To stop the project, just close the popup console windows.
echo ==============================================================
pause
