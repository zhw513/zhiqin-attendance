# 🔧 智勤考勤系统 - 命令速查表

## 📋 目录
- [初始化](#初始化)
- [开发](#开发)
- [构建](#构建)
- [部署](#部署)
- [APP 打包](#app-打包)
- [调试](#调试)

---

## 初始化

### 第一次设置

```bash
# 1. 克隆仓库（如果从 GitHub 克隆）
git clone https://github.com/YOUR_USERNAME/zhiqin-attendance.git
cd zhiqin-attendance

# 2. 安装依赖
npm install

# 3. 初始化 Git（如果是本地项目）
git init
git add .
git commit -m "Initial commit"
```

---

## 开发

### 启动开发服务器

```bash
# 热重载开发模式
npm run dev

# 访问：http://localhost:5173
```

### 代码检查

```bash
# ESLint 检查
npm run lint

# 自动修复
npx eslint . --fix
```

---

## 构建

### Web 应用

```bash
# 生产构建
npm run build

# 本地预览构建结果
npm run preview

# 输出：dist/ 文件夹（上传到服务器）
```

### Capacitor 同步

```bash
# 同步所有配置
npx cap sync

# 仅复制 Web 文件到原生项目
npx cap copy

# 全量更新
npx cap sync --force
```

---

## 部署

### GitHub 推送

```bash
# 查看状态
git status

# 添加所有文件
git add .

# 创建提交
git commit -m "message"

# 推送到远程
git push origin main

# 首次推送（新分支）
git push -u origin main
```

### Vercel 部署

```bash
# 自动化：推送到 GitHub 后，Vercel 自动部署
# 手动：访问 https://vercel.com/import，选择仓库

# 查看部署历史
vercel list

# 预览部署
vercel preview

# 生产部署
vercel --prod
```

---

## APP 打包

### Android APK

```bash
# 方式 1: 使用自动构建脚本
chmod +x build-release-apk.sh
./build-release-apk.sh

# 方式 2: 使用开发脚本
chmod +x build-android.sh
./build-android.sh

# 方式 3: 手动使用 Gradle
cd android
./gradlew assembleRelease
cd ..

# 输出位置
ls -lh android/app/release/app-release.apk
```

### iOS IPA

```bash
# 打开 Xcode 项目
npx cap open ios

# 或手动打开
open ios/App/App.xcworkspace

# Xcode 中操作：Product → Archive → Distribute App
```

### 签名和发布

```bash
# 创建签名密钥
keytool -genkey -v -keystore zhiqin.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias zhiqin-key

# 生成带签名的 APK
cd android
./gradlew assembleRelease
cd ..

# 上传 APK 到云存储（示例：阿里云 OSS）
ossutil cp android/app/release/app-release.apk \
  oss://your-bucket/app.apk
```

---

## Capacitor 项目管理

```bash
# 查看 Capacitor 信息
npx cap info

# 打开 Android Studio
npx cap open android

# 打开 Xcode
npx cap open ios

# 更新 Capacitor
npm install --save @capacitor/core
npx cap sync

# 创建原生项目
npx cap add android
npx cap add ios

# 删除平台
npx cap remove android
npx cap remove ios
```

---

## 调试

### 浏览器调试

```bash
# 开启开发模式
npm run dev

# 打开浏览器开发工具
F12 或 右键 → 检查

# 查看 Console 日志
# 检查 Network 网络请求
# 查看 Application Storage
```

### Firebase 调试

```bash
# 查看 Firebase 控制台
# https://console.firebase.google.com

# Firestore 数据库
# → Project → Firestore Database

# Authentication
# → Project → Authentication

# Cloud Storage
# → Project → Storage
```

### Android 调试

```bash
# 连接设备和启用开发者选项
# 在 Xcode 中运行应用
npx cap open android

# 或使用命令行
cd android
./gradlew installDebug
./gradlew runDebug
```

### iOS 调试

```bash
# 在 Xcode 中运行应用
npx cap open ios

# 选择设备 → Run
```

---

## 日志和监控

```bash
# 查看应用日志（本地开发）
npm run dev

# Vercel 部署日志
# https://vercel.com/your-account/projects/your-project/deployments

# Firebase 控制台监控
# https://console.firebase.google.com
```

---

## 清理和维护

```bash
# 清理 npm 缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules
npm install

# 清理 Gradle 缓存（Android）
cd android
./gradlew clean
cd ..

# 清理 Xcode 构建缓存（iOS）
# Xcode → Product → Clean Build Folder
```

---

## 版本管理

```bash
# 查看当前版本
cat capacitor.config.json | grep '"appName"'

# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 查看所有标签
git tag -l

# 创建 GitHub Release
gh release create v1.0.0 -t "Release v1.0.0" -n "Release notes"
```

---

## Firebase 管理

```bash
# 初始化 Firebase（如需要）
firebase init

# 登录 Firebase
firebase login

# 部署 Firebase 函数
firebase deploy --only functions

# 查看 Firestore 规则
firebase firestore:indexes

# 发布 Firestore 规则
firebase deploy --only firestore:rules
```

---

## 环境变量

```bash
# 创建 .env.local 文件
echo "VITE_API_URL=https://api.example.com" > .env.local

# .env.local 内容示例
# VITE_FIREBASE_API_KEY=your_key
# VITE_FIREBASE_PROJECT_ID=your_project_id

# 在应用中使用
# import.meta.env.VITE_API_URL
```

---

## 问题排查命令

```bash
# 检查 Node 版本（需要 18+）
node -v

# 检查 npm 版本
npm -v

# 检查 Java（需要 11+）
java -version

# 检查 Android SDK
echo $ANDROID_HOME

# 检查 Xcode
xcode-select -p

# 检查网络连接
ping firebase.google.com

# 查看 Vercel 部署日志
vercel logs your-project

# 查看应用状态
npm list @capacitor/core
```

---

## 完整工作流命令

### 完整部署流程

```bash
# 1. 开发和测试
npm run dev
# ... 修改代码 ...

# 2. 构建
npm run build

# 3. 提交代码
git add .
git commit -m "feat: Add new feature"
git push origin main

# 4. Vercel 自动部署（无需手动）

# 5. 生成 APK（如需要）
chmod +x build-release-apk.sh
./build-release-apk.sh

# 6. 上传 APK
cp android/app/release/app-release.apk public/app.apk
git add public/app.apk
git commit -m "build: Update APK"
git push origin main

# Vercel 再次自动部署 APK！
```

### 快速修复流程

```bash
# 1. 修复 bug
nano src/App.jsx

# 2. 测试
npm run dev

# 3. 构建
npm run build

# 4. 提交和推送
git add src/App.jsx
git commit -m "fix: Fix specific bug"
git push origin main

# Vercel 自动部署更新！
```

---

## 常用 Git 命令

```bash
# 查看分支
git branch -a

# 创建新分支
git checkout -b feature/new-feature

# 切换分支
git checkout main

# 合并分支
git merge feature/new-feature

# 查看提交历史
git log --oneline

# 撤销最后一次提交（未推送）
git reset --soft HEAD~1

# 查看差异
git diff

# 查看特定文件历史
git log -p -- src/App.jsx
```

---

## Docker 命令（可选）

```bash
# 构建 Docker 镜像
docker build -t zhiqin-attendance:1.0.0 .

# 运行容器
docker run -p 3000:3000 zhiqin-attendance:1.0.0

# 推送到 Docker Hub
docker push username/zhiqin-attendance:1.0.0
```

---

## 性能优化命令

```bash
# 分析包大小
npm install -g webpack-bundle-analyzer
# 在 vite.config.js 中配置后运行

# 检查未使用的依赖
npm install -g depcheck
depcheck

# 更新依赖
npm outdated
npm update

# 审计安全漏洞
npm audit
npm audit fix
```

---

## 备份和恢复

```bash
# 备份项目
tar -czf zhiqin-attendance-backup.tar.gz ./

# 恢复备份
tar -xzf zhiqin-attendance-backup.tar.gz

# 导出 Firestore 数据
# Firebase 控制台 → Firestore → 导出集合

# 导出考勤报表
# 应用中：右上角 → 导出 Excel 报表
```

---

## 快捷命令汇总

```bash
# 快速部署
alias deploy="npm run build && git add . && git commit -m 'deploy' && git push"

# 快速开发
alias dev="npm run dev"

# 快速构建 APK
alias apk="./build-release-apk.sh"

# 快速同步 Capacitor
alias cap-sync="npx cap sync && npx cap copy"

# 快速打开 Android Studio
alias android="npx cap open android"

# 快速打开 Xcode
alias ios="npx cap open ios"
```

---

## 脚本文件执行

```bash
# 使脚本可执行
chmod +x script.sh

# 运行脚本
./script.sh

# 后台运行脚本
./script.sh &

# 查看正在运行的进程
ps aux | grep node
```

---

## 最常用的 10 个命令

```bash
1. npm run dev          # 启动开发
2. npm run build        # 构建应用
3. git push             # 推送代码
4. npx cap sync         # 同步 Capacitor
5. ./build-release-apk.sh  # 生成 APK
6. npx cap open android    # 打开 Android Studio
7. npx cap open ios        # 打开 Xcode
8. npm run lint         # 代码检查
9. npm install          # 安装依赖
10. git commit -m "msg" # 提交代码
```

---

**💡 提示：将常用命令保存到 alias 或脚本中，提高效率！**
