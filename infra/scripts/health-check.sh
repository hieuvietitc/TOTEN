#!/bin/bash
# TOTEN Services Health Check

BASE_URL="http://localhost"

SERVICES=(
  "3001:user-service"
  "3002:auth-service"
  "3003:membership-service"
  "3004:booking-service"
  "3005:match-service"
  "3006:ranking-service"
  "3007:tournament-service"
  "3008:notification-service"
  "3009:fraud-service"
  "3010:sponsor-service"
  "3011:finance-service"
  "3012:control-tower"
)

echo "=============================="
echo " TOTEN Services Health Check"
echo " $(date)"
echo "=============================="

ALL_OK=true

for SERVICE in "${SERVICES[@]}"; do
  PORT="${SERVICE%%:*}"
  NAME="${SERVICE##*:}"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}:${PORT}/health" --max-time 3)

  if [ "$STATUS" = "200" ]; then
    echo "  ✅ $NAME (port $PORT)"
  else
    echo "  ❌ $NAME (port $PORT) — HTTP $STATUS"
    ALL_OK=false
  fi
done

echo "=============================="
if [ "$ALL_OK" = true ]; then
  echo "  All services healthy ✅"
else
  echo "  ⚠️  Some services unhealthy"
fi
echo "=============================="
