# 智勤考勤系统 - 部署指南

## 📋 目录
- [Web 版本部署](#web-版本部署)
- [Android APP 打包](#android-app-打包)
- [iOS APP 打包](#ios-app-打包)
- [PWA 安装](#pwa-安装)
- [常见问题](#常见问题)

---

## Web 版本部署

### 方案 A: Vercel 部署（推荐，5分钟）

1. **连接 GitHub 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **在 Vercel 部署**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 框架选择 "Vite"
   - 部署完成，自动获得 HTTPS URL

### 方案 B: GitHub Pages 部署

1. **修改 vite.config.js**
   ```javascript
   export default {
     base: '/my-attendance/',  // 改为你的仓库名
     // ... 其他配置
   }
   ```

2. **推送到 GitHub**
   ```bash
   git push origin main
   ```

3. **启用 Pages**
   - 仓库 Settings → Pages
   - 选择 "Deploy from a branch"
   - 分支选择 `main`，文件夹选择 `/dist`

### 📱 Web 版本链接分享
```
https://your-domain.com
# 用户可以直接在浏览器访问
# 支持手机和电脑访问
```

---

## Android APP 打包

### 环境要求
- **Java JDK**: 11+ 
- **Android SDK**: API 26+
- **Gradle**: 自动包含在 Android Studio

### 生成 APK 文件

#### 方式 1: 使用 Android Studio（推荐）

1. **打开项目**
   ```bash
   npx cap open android
   ```

2. **生成签名 APK**
   - 菜单 → `Build` → `Generate Signed Bundle / APK`
   - 选择 `APK`
   - 创建密钥库（Key Store）
     - 密钥库密码：自定义（保管好！）
     - 密钥别名：`zhiqin-key`
     - 密钥密码：自定义
   - 选择 `release` Build Variants
   - 完成生成，APK 在 `android/app/release/app-release.apk`

3. **上传到网络**
   ```bash
   # 复制 APK 到 dist/ 文件夹
   cp android/app/release/app-release.apk dist/zhiqin-app.apk
   
   # 部署到 Vercel（自动推送 dist/）
   git add dist/
   git commit -m "Add APK"
   git push
   ```

#### 方式 2: 命令行生成（高级）

```bash
cd android

# 设置签名密钥
./gradlew assembleRelease \
  -Pkey.store=../app.jks \
  -Pkey.alias=zhiqin-key \
  -Pkey.store.password=YOUR_PASSWORD \
  -Pkey.alias.password=YOUR_PASSWORD

# APK 输出: app/release/app-release.apk
```

### 📥 APK 下载分享
```
https://your-domain.com/zhiqin-app.apk
# 用户可以直接下载安装
# 支持 Android 7.0+
```

---

## iOS APP 打包

### 环境要求
- **macOS** 系统
- **Xcode** 14+
- **Apple 开发者账户**（可选，内部测试不需要）

### 生成 IPA 文件

1. **打开项目**
   ```bash
   npx cap open ios
   ```

2. **配置签名**
   - 选择 ZhiQin 项目
   - Signing & Capabilities
   - Team 选择你的 Apple 账户
   - Bundle Identifier: `com.zhiqin.attendance`

3. **生成 IPA**
   - 菜单 → `Product` → `Archive`
   - 等待编译完成
   - 弹出窗口 → 选择 `Distribute App`
   - 选择 `Ad Hoc`（内部测试）或 `App Store`（上架）
   - 完成导出，获得 `.ipa` 文件

4. **共享内部版本**（无需上架）
   - 使用 **TestFlight**（Apple 推荐）
   - 邀请团队成员安装
   - 自动获得更新

---

## PWA 安装

### 什么是 PWA？
Web 应用可以像原生 APP 一样安装到桌面或手机

### 浏览器安装步骤

#### 📱 iPhone/iPad
1. 用 **Safari** 打开 Web 链接
2. 点击分享按钮 → "添加到主屏幕"
3. 输入名称 → 完成安装

#### 🤖 Android（Chrome）
1. 用 **Chrome** 打开 Web 链接
2. 点击右上角菜单 → "安装应用"
3. 确认 → 自动安装到主屏幕

#### 💻 Windows/Mac
1. 在 **Chrome/Edge** 打开 Web 链接
2. 点击地址栏右侧的"安装"图标
3. 确认 → 创建快捷方式

### PWA 特性
✅ 无需下载 APK，直接网页安装
✅ 离线可用（部分功能）
✅ 更新自动推送
✅ 占用空间小（~2MB）

---

## 部署总结

| 平台 | 方式 | 分享链接 | 安装方式 |
|------|------|---------|---------|
| **Web** | Vercel | `https://app.example.com` | 浏览器打开 |
| **PWA** | Web | 同上 | "安装应用" |
| **Android** | APK | `https://app.example.com/app.apk` | 直接下载 |
| **iOS** | IPA | TestFlight | 邀请链接 |

---

## 常见问题

### Q: 如何更新 APP？

**Web 版本**: 自动更新（部署新版本即可）
**Android APK**: 用户需要下载新 APK 重新安装
**iOS IPA**: 通过 TestFlight 自动推送更新

### Q: APK 能直接分享下载吗？

可以！生成的 APK 是完整的可安装文件：
```
1. 放到 dist/ 文件夹
2. 推送到 GitHub/Vercel
3. 生成直接下载链接
4. 用户点击即可下载安装（无需 Google Play）
```

### Q: 如何实现自动更新？

对于内部应用，推荐：
- **Android**: 定期发布新 APK，提示用户下载
- **iOS**: 使用 TestFlight 自动推送更新
- **Web**: 自动更新，无需用户操作

### Q: Firebase 配置需要更改吗？

不需要！当前配置已经嵌入 App.jsx，所有平台都能使用。

### Q: 如何获得签名密钥？

Android 首次打包时会自动生成，Xcode 也会自动处理 iOS 签名。

### Q: 支持离线使用吗？

部分支持！PWA 和 Web 版本有离线缓存，但签到/签退等功能需要网络。

---

## 🚀 快速开始命令

```bash
# 1. 构建所有版本
npm run build
npx cap sync

# 2. 打开 Android Studio（生成 APK）
npx cap open android

# 3. 打开 Xcode（生成 IPA）
npx cap open ios

# 4. 部署到 Vercel
# 连接 GitHub 仓库，自动部署 dist/

# 5. 获得分享链接
# - Web: https://your-vercel-domain.com
# - APK: https://your-vercel-domain.com/app.apk
# - PWA: 任何 Web 链接都支持
```

---

## 📞 技术支持

遇到问题？查看：
- [Capacitor 文档](https://capacitorjs.com/docs)
- [Firebase 文档](https://firebase.google.com/docs)
- [Vite 文档](https://vitejs.dev/)
