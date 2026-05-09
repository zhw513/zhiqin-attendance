# 🚀 智勤考勤系统 - 完整部署指南

## 📋 已完成的工作

✅ Web 应用已构建（`dist/` 文件夹）
✅ Capacitor 已配置（iOS & Android）
✅ PWA 已启用（manifest.json + Service Worker）
✅ GitHub Actions 已配置（自动部署）
✅ Vercel 配置已准备（vercel.json）

---

## 🎯 三步完成全部部署

### 第 1 步：推送到 GitHub（3分钟）

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit: ZhiQin Attendance System

- React + Vite 前端应用
- Capacitor iOS/Android 支持
- PWA 离线支持
- Firebase 后端集成"

# 创建 GitHub 仓库并推送
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zhiqin-attendance.git
git push -u origin main
```

### 第 2 步：Vercel 部署（2分钟）

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 用 GitHub 账户登录

2. **导入仓库**
   - 点击 "New Project"
   - 选择 `zhiqin-attendance` 仓库
   - 框架: `Vite` ✓（自动检测）
   - 点击 "Deploy" ✓

3. **获得 HTTPS 链接**
   ```
   ✅ 部署完成！
   访问：https://zhiqin-attendance.vercel.app
   ```

4. **（可选）自定义域名**
   - Settings → Domains
   - 添加自己的域名

---

### 第 3 步：生成 Android APP（10分钟）

#### 环境检查
需要安装：
- ✅ Java JDK 11+
- ✅ Android Studio（会自动安装 SDK）

#### 生成 APK

```bash
# 一键构建
chmod +x build-android.sh
./build-android.sh

# 输出位置
# android/app/release/app-release.apk
```

#### 分享下载链接

**选项 A：使用云存储（推荐）**

```bash
# 1. 上传到阿里云 OSS
# OSS 控制台 → 上传文件 app-release.apk

# 2. 获得外链分享链接
# https://your-bucket.oss-cn-hangzhou.aliyuncs.com/app-release.apk

# 3. 分享给用户
# "点击下载考勤APP: https://..."
```

**选项 B：托管在 Vercel**

```bash
# 1. 复制 APK 到项目根目录
cp android/app/release/app-release.apk ./public/app.apk

# 2. 推送代码
git add public/app.apk
git commit -m "Add Android APK"
git push origin main

# 3. 获得下载链接
# https://zhiqin-attendance.vercel.app/app.apk
```

---

## 📱 分享链接给团队

### Web 版本（推荐给所有人）
```
✅ 所有设备都能用
💻 PC: Chrome/Edge/Safari
📱 手机: 浏览器直接打开
⏰ 自动更新，无需操作

链接: https://zhiqin-attendance.vercel.app
```

### PWA 安装（可选，提升体验）
```
📲 可安装到主屏幕
⚡ 比网页更快
📴 部分离线可用

分享给用户步骤:
1. 用户打开上面的链接
2. iOS: 分享 → 添加到主屏幕
3. Android: 菜单 → 安装应用
4. 完成！像原生 APP 一样使用
```

### Android APP（可选）
```
🤖 原生应用体验
📦 完整的 APK 文件
🔔 可推送通知（如需配置）

链接: https://zhiqin-attendance.vercel.app/app.apk
用户下载后直接点击安装
```

---

## 🔧 更新应用

### 更新 Web 版本（所有用户自动获得）

```bash
# 修改代码
# ...

# 推送到 GitHub
git add .
git commit -m "Feature: 新增考勤定位功能"
git push origin main

# Vercel 自动部署！
# ✅ 更新完成，用户刷新页面即可看到新版本
```

### 更新 Android APP（用户需要重新下载）

```bash
# 修改代码后
npm run build
npx cap sync android
npx cap copy android

# 生成新的 APK
./build-android.sh

# 上传新 APK
cp android/app/release/app-release.apk ./public/app-update.apk

# 提示用户下载新版本
```

### 更新 iOS APP（通过 TestFlight）

```bash
# 修改代码后
npx cap sync ios
npx cap copy ios

# 在 Xcode 中 Archive 并上传到 TestFlight
# 用户会自动收到更新提示
```

---

## 🔐 GitHub Actions 自动部署（可选）

已配置自动部署工作流：`.github/workflows/deploy.yml`

如需启用 GitHub Actions 自动部署到 Vercel：

1. **获取 Vercel Token**
   - https://vercel.com/account/tokens
   - 创建新 token（复制）

2. **添加 GitHub Secrets**
   ```
   GitHub 仓库 → Settings → Secrets and variables → Actions
   
   VERCEL_TOKEN = 你的_token
   VERCEL_ORG_ID = 你的_org_id
   VERCEL_PROJECT_ID = 你的_project_id
   ```

3. **自动化完成！**
   ```
   之后每次 git push 都会自动：
   ✅ 构建应用
   ✅ 同步 Capacitor
   ✅ 部署到 Vercel
   ```

---

## 📊 部署清单

- [ ] 推送代码到 GitHub
- [ ] Vercel 部署完成
- [ ] Web 版本链接可访问
- [ ] 测试 Web 版本功能
- [ ] （可选）生成 Android APK
- [ ] （可选）上传 APK 到云存储
- [ ] 分享 Web 链接给团队
- [ ] 团队成员测试验证

---

## 📱 最终产物

部署完成后，用户可以通过以下方式访问：

| 访问方式 | 链接 | 安装方式 |
|---------|------|---------|
| **Web** | https://zhiqin-attendance.vercel.app | 直接打开 |
| **PWA** | 同上 | "安装应用" |
| **Android APP** | https://zhiqin-attendance.vercel.app/app.apk | 下载安装 |
| **iOS APP** | TestFlight 链接 | 邀请链接 |

---

## 🆘 常见问题

### Q: Vercel 部署失败了
A: 检查：
```bash
# 确保构建成功
npm run build

# 检查 dist 文件夹有内容
ls dist/

# 如果有错误，查看 Vercel 的部署日志
# https://vercel.com/your-project/deployments
```

### Q: APK 生成失败
A: 检查：
```bash
# 确保 Java 已安装
java -version

# 确保 Android SDK 已安装
echo $ANDROID_HOME

# 如果没有，安装 Android Studio
```

### Q: Firebase 凭证错误
A: 检查：
```bash
# 打开 src/App.jsx
# 确认 firebaseConfig 与你的 Firebase 项目匹配
# Firebase 控制台 → 项目设置 → 复制 Web 凭证
```

### Q: 用户下载 APK 后无法安装
A: 可能原因：
- Android 版本太低（需要 7.0+）
- 未启用"未知来源"安装
- APK 文件损坏

### Q: 如何给用户发送分享链接
A: 推荐方式：
```
1. 钉钉群发 Web 链接
2. 邮件抄送 Web 链接
3. 员工手册中写入 Web 链接
4. 印刷二维码（QR Code）

例：
"考勤打卡应用已上线！
请访问: https://zhiqin-attendance.vercel.app
或用手机扫描下方二维码"
```

---

## 🎉 完成！

恭喜！你已经：

✅ 部署了 Web 应用（3 分钟）
✅ 配置了 iOS/Android（已准备）
✅ 启用了 PWA 支持（已配置）
✅ 设置了自动更新（已就绪）

现在可以：
1. 分享 Web 链接给团队
2. 开始使用考勤系统
3. 根据需要生成 APP 文件

**祝部署顺利！🚀**
