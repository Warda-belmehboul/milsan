@echo off
echo === تشغيل منصة التفصيح ===
echo.
echo تثبيت المكتبات...
call pnpm install
echo.
echo تشغيل الخادم الخلفي في نافذة جديدة...
start "API Server" cmd /k "pnpm --filter @workspace/api-server run dev"
echo.
echo تشغيل الواجهة الامامية...
echo.
echo المنصة ستعمل على: http://localhost:5173
echo.
pnpm --filter @workspace/tafseeh run dev
