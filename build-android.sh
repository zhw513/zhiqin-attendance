#!/bin/bash

# 智勤考勤系统 - Android APK 生成脚本
# 需要先安装 Android SDK 和 Java JDK

set -e

echo "========================================"
echo "   智勤考勤系统 - Android APK 打包"
echo "========================================"
echo ""

# 检查环境
if ! command -v java &> /dev/null; then
    echo "❌ 错误: 未找到 Java"
    echo "   请安装 Java JDK 11 或更高版本"
    exit 1
fi

if ! command -v gradle &> /dev/null && [ ! -d "$ANDROID_HOME" ]; then
    echo "❌ 错误: 未找到 Android SDK"
    echo "   请设置 ANDROID_HOME 环境变量或安装 Android Studio"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 1. 构建 Web 应用
echo "📦 步骤1: 构建 Web 应用..."
npm run build
npx cap copy android
echo "✅ Web 应用准备完成"
echo ""

# 2. 进入 Android 目录
cd android

# 3. 清理
echo "🧹 步骤2: 清理构建缓存..."
./gradlew clean
echo "✅ 清理完成"
echo ""

# 4. 构建 Release APK
echo "📱 步骤3: 构建 Release APK..."
./gradlew assembleRelease
echo "✅ APK 构建完成"
echo ""

# 5. 显示输出位置
APK_PATH="app/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "========================================"
    echo "   ✅ APK 生成成功！"
    echo "========================================"
    echo ""
    echo "📁 APK 位置:"
    echo "   $(pwd)/$APK_PATH"
    echo ""
    echo "📊 APK 信息:"
    ls -lh "$APK_PATH"
    echo ""
    echo "📤 后续步骤:"
    echo "   1. 将 APK 复制到 web 服务器"
    echo "   2. 生成下载链接分享给用户"
    echo "   3. 用户可直接点击下载安装"
    echo ""
    echo "========================================"
else
    echo "❌ APK 生成失败，请检查构建日志"
    exit 1
fi
