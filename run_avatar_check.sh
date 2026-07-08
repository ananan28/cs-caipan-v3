#!/bin/bash

# CheckNumber API Key
API_KEY="x1HKsVAfzYU7esiTNpVaiEjifBHhQNOMynMG2R9qCDbrF5c9mqPLnskXQDbe"

# 创建测试号码文件
cat > /tmp/phones.txt << 'EOF2'
13053450262
13053450263
13053450265
13053450267
12019812905
12024412213
12025050608
12027655754
12036546073
12063103658
12066604445
12082212587
12082416712
12082419620
12082504041
12082506666
12083133017
12083135887
12083206506
12083530735
12083533159
EOF2

echo "📤 提交头像检测任务..."

# 提交任务
RESPONSE=$(curl -s -X POST "https://api.checknumber.ai/v1/tasks" \
  -H "X-API-Key: $API_KEY" \
  -F "file=@/tmp/phones.txt" \
  -F "task_type=ws_avatar")

echo "提交响应: $RESPONSE"

# 提取 task_id
TASK_ID=$(echo $RESPONSE | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TASK_ID" ]; then
  echo "❌ 获取 task_id 失败"
  exit 1
fi

echo "✅ task_id: $TASK_ID"

# 轮询结果
echo "⏳ 等待检测完成..."
while true; do
  sleep 3
  STATUS_RESPONSE=$(curl -s -X POST "https://api.checknumber.ai/v1/gettasks" \
    -H "X-API-Key: $API_KEY" \
    -d "task_id=$TASK_ID")
  
  STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  echo "📊 当前状态: $STATUS"
  
  if [ "$STATUS" = "exported" ]; then
    echo "✅ 检测完成！"
    RESULT_URL=$(echo $STATUS_RESPONSE | grep -o '"result_url":"[^"]*"' | cut -d'"' -f4)
    echo "📄 结果下载: $RESULT_URL"
    
    # 下载并显示结果
    curl -s -L "$RESULT_URL" -o /tmp/result.zip
    unzip -q -o /tmp/result.zip -d /tmp/avatar_result
    echo "📊 检测结果:"
    cat /tmp/avatar_result/*/all.csv | head -20
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ 检测失败"
    break
  fi
done
