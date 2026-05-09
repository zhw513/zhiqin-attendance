# 🚀 智勤考勤系统 - 快速开始

## 三种部署方式

### 1️⃣ **Web 版本** (最简单，5分钟)

```bash
# 已完成！应用已在 dist/ 中
# 现在推送到 Vercel

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/zhiqin-attendance.git
git push -u origin main
```

**然后在 Vercel 部署：**
1. 访问 [vercel.com](https://vercel.com)
2. 导入 GitHub 仓库
3. 自动部署（选择 Vite 框架）
4. 获得 HTTPS 链接

**分享链接:** `https://zhiqin-attendance.vercel.app`

---

### 2️⃣ **手机 APP**（20人内部，无需上架）

#### Android APK（最简单）

**要求：** Android Studio 或 Android SDK

```bash
# 一键生成 APK
chmod +x build-android.sh
./build-android.sh

# 输出：android/app/release/app-release.apk
```

**分享方式：**
```
1. 将 APK 上传到云存储（阿里云 OSS、腾讯云 COS）
2. 获得下载链接
3. 分享给用户：https://your-cloud.com/zhiqin-app.apk
4. 用户点击直接下载安装
```

#### iOS IPA（需要 macOS）

```bash
# 打开 Xcode 项目
npx cap open ios

# 在 Xcode 中：
# 1. Product → Archive
# 2. Distribute App → Ad Hoc（内部测试）
# 3. 导出 IPA 文件

# 或使用 TestFlight（Apple 推荐）
# - 邀请用户
# - 自动推送更新
```

---

### 3️⃣ **PWA**（网页版即可安装到主屏）

#### 安装方式（无需下载）

**iPhone/iPad：**
```
1. Safari 打开 Web 链接
2. 分享 → 添加到主屏幕
3. 完成！
```

**Android：**
```
1. Chrome 打开 Web 链接
2. 菜单 → 安装应用
3. 完成！
```

**Windows/Mac：**
```
1. Chrome/Edge 打开 Web 链接
2. 地址栏右侧 → 安装
3. 完成！
```

---

## 📊 对比表

| 方式 | 难度 | 下载方式 | 自动更新 | 推荐指数 |
|------|------|---------|---------|---------|
| Web | ⭐ | 网页打开 | ✅ 自动 | ⭐⭐⭐⭐⭐ |
| PWA | ⭐ | 安装快捷方式 | ✅ 自动 | ⭐⭐⭐⭐⭐ |
| Android APK | ⭐⭐ | 下载安装 | ❌ 手动 | ⭐⭐⭐⭐ |
| iOS IPA | ⭐⭐⭐ | TestFlight | ✅ 自动 | ⭐⭐⭐ |

---

## 🎯 我的建议（20人团队）

✅ **推荐：Web + PWA** (最简单)
- 所有设备都能用
- 自动更新
- 无需管理 APP 版本
- 用户直接分享链接即可

```bash
# 完整流程
npm run build                    # 1. 构建
git push                         # 2. 推送到 GitHub
# 3. Vercel 自动部署
# 4. 获得 https://app.example.com
# 5. 用户点击链接或"安装应用"
```

---

## 📱 完整部署清单

### 第 1 步：部署 Web 版本（现在）
- [ ] 推送代码到 GitHub
- [ ] 在 Vercel 连接仓库
- [ ] 获得部署链接
- [ ] 测试 Web 应用
- [ ] 分享链接给团队

### 第 2 步：生成 Android APK（如需要）
- [ ] 安装 Android Studio
- [ ] 运行 `./build-android.sh`
- [ ] 上传 APK 到云存储
- [ ] 获得下载链接
- [ ] 分享下载链接

### 第 3 步：生成 iOS IPA（如需要）
- [ ] 在 macOS 运行 `npx cap open ios`
- [ ] 在 Xcode 中 Archive
- [ ] 导出 IPA（Ad Hoc）
- [ ] 上传到 TestFlight
- [ ] 邀请用户

---

## 🔧 项目文件说明

```
zhiqin-attendance/
├── dist/                    # Web 应用产物
├── android/                 # Android 项目
├── ios/                     # iOS 项目
├── src/                     # React 源代码
├── capacitor.config.json    # Capacitor 配置
├── DEPLOYMENT.md            # 详细部署指南
├── QUICK_START.md          # 本文件
├── build-app.sh            # 通用构建脚本
└── build-android.sh        # Android 打包脚本
```

---

## ❓ 常见问题

**Q: 用户下载 APK 安全吗？**
A: 安全。APK 是签名的官方文件，用户可以放心安装。

**Q: 如何实现 APP 自动更新？**
A: 
- Web/PWA：自动更新（用户刷新即可）
- Android：发布新 APK，提示用户下载
- iOS：使用 TestFlight，自动推送更新

**Q: Firebase 能在所有平台用吗？**
A: 能！配置已在 App.jsx 中，Web/PWA/APP 都能使用。

**Q: 如何修改应用名称？**
A: 修改 `capacitor.config.json` 的 `appName`

**Q: 多久更新一次？**
A: 随时可以。推送代码 → Vercel 自动部署 → 获得更新链接

---

## 🚀 立即开始

```bash
# 1. 推送到 GitHub
git init
git add .
git commit -m "Initial: ZhiQin Attendance System"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main

# 2. Vercel 部署（Web 自动部署）
# 访问 vercel.com，导入仓库，完成！

# 3. 分享链接
# https://your-vercel-domain.com
```

**完成！🎉 用户可以立即使用。**

---

## 📞 需要帮助？

- 详细部署指南：查看 `DEPLOYMENT.md`
- Capacitor 文档：https://capacitorjs.com/docs
- Firebase 文档：https://firebase.google.com/docs
- Vercel 文档：https://vercel.com/docs
