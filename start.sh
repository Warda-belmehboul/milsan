#!/bin/bash
echo "=== تشغيل منصة التفصيح ==="
echo ""
echo "تثبيت المكتبات..."
pnpm install
echo ""
echo "تشغيل الخادم..."
pnpm --filter @workspace/api-server run dev &
API_PID=$!
echo ""
echo "تشغيل الواجهة..."
pnpm --filter @workspace/tafseeh run dev &
FRONT_PID=$!
echo ""
echo "✓ المنصة تعمل على: http://localhost:5173"
echo "  اضغط Ctrl+C للإيقاف"
wait $API_PID $FRONT_PID
