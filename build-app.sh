#!/bin/bash

# 智勤考勤系统 - 应用打包脚本

set -e

echo "========================================"
echo "   智勤考勤系统 - 多平台打包"
echo "========================================"
echo ""

# 1. 构建Web应用
echo "📦 步骤1: 构建 Web 应用..."
npm run build
echo "✅ Web 应用构建完成"
echo ""

# 2. 同步Capacitor
echo "🔄 步骤2: 同步 Capacitor 配置..."
npx cap sync
echo "✅ Capacitor 同步完成"
echo ""

# 3. 复制文件
echo "📋 步骤3: 复制构建文件..."
npx cap copy
echo "✅ 文件复制完成"
echo ""

# 4. 提示后续步骤
echo "========================================"
echo "        🚀 后续步骤"
echo "========================================"
echo ""
echo "【Android APK 生成】"
echo "  npx cap open android"
echo "  # 在 Android Studio 中"
echo "  # 1. Build → Generate Signed Bundle / APK"
echo "  # 2. 选择 APK 格式"
echo "  # 3. 完成签名并生成"
echo ""
echo "【iOS IPA 生成】"
echo "  npx cap open ios"
echo "  # 在 Xcode 中"
echo "  # 1. Product → Archive"
echo "  # 2. Distribute App 选择 Ad Hoc"
echo "  # 3. 完成签名并导出"
echo ""
echo "【Web 应用部署】"
echo "  # 上传 dist/ 文件夹到 Vercel 或 GitHub Pages"
echo ""
echo "========================================"
echo "✅ 打包准备完成！"
echo "========================================"
