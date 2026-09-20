@echo off
echo ========================================================
echo        Iniciando o InovaApps 2026 (Full-Stack)
echo ========================================================
echo.
echo [1] Ligando o Servidor Python (Backend) na porta 8001...
start "Backend - FastAPI" cmd /k "python -m uvicorn main:app --port 8001"
echo.
echo [2] Ligando o Frontend (React/Vite) na porta 8080...
start "Frontend - React" cmd /k "cd frontend && npm run dev"
echo.
echo Aguardando os servidores iniciarem...
timeout /t 5 /nobreak >nul
start http://localhost:8080

echo Tudo pronto! O navegador foi aberto.
echo Se nao abriu, acesse manualmente: http://localhost:8080
echo ========================================================
pause
