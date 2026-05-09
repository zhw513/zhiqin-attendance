#!/bin/bash

# 智勤考勤系统 - Android 发布版本 APK 生成脚本
# 用于生成可直接下载安装的 APK 文件

set -e

echo "========================================"
echo "  智勤考勤系统 - Android 发布 APK"
echo "========================================"
echo ""

# 检查 Java
if ! command -v java &> /dev/null; then
    echo "❌ 错误：未找到 Java JDK"
    echo "   请安装 Java JDK 11+"
    exit 1
fi

# 检查 Gradle
cd android
if [ ! -f "gradlew" ]; then
    echo "❌ 错误：gradlew 不存在，请确保在 Android 项目目录中"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 步骤 1：清理
echo "🧹 步骤 1: 清理构建缓存..."
./gradlew clean
echo "✅ 清理完成"
echo ""

# 步骤 2：构建发布版本
echo "🔨 步骤 2: 构建发布版本 APK..."
./gradlew assembleRelease --warning-mode all
echo "✅ 构建完成"
echo ""

# 步骤 3：检查输出
OUTPUT_APK="app/release/app-release.apk"
if [ ! -f "$OUTPUT_APK" ]; then
    echo "❌ 错误：APK 生成失败"
    echo "   预期路径：$OUTPUT_APK"
    exit 1
fi

echo "========================================"
echo "   ✅ APK 生成成功！"
echo "========================================"
echo ""
echo "📁 APK 详细信息:"
ls -lh "$OUTPUT_APK"
echo ""
echo "📊 SHA256 校验码:"
sha256sum "$OUTPUT_APK"
echo ""
echo "💾 复制到项目根目录..."
cp "$OUTPUT_APK" "../public/app-release.apk"
cp "$OUTPUT_APK" "../app-release.apk"
echo "✅ APK 已复制到："
echo "   ./public/app-release.apk"
echo "   ./app-release.apk"
echo ""
echo "========================================"
echo "  📤 接下来："
echo "========================================"
echo "1. 上传 APK 到云存储或 Vercel"
echo "2. 获取下载链接"
echo "3. 分享链接给用户"
echo ""
echo "💡 用户下载安装步骤："
echo "   1. 打开链接下载 APK"
echo "   2. 打开设置 → 安全 → 允许未知来源"
echo "   3. 点击 APK 文件安装"
echo "   4. 完成！"
echo ""
echo "========================================"
