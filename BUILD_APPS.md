# 🚀 智勤考勤系统 - APP 生成完全指南

## 📋 目录
- [快速开始](#快速开始)
- [Android APK 生成](#android-apk-生成)
- [iOS IPA 生成](#ios-ipa-生成)
- [APP 下载分享](#app-下载分享)
- [常见问题](#常见问题)

---

## 快速开始

### 环境检查清单

| 项目 | 要求 | 检查命令 |
|------|------|---------|
| **Node.js** | 18+ | `node -v` |
| **Java JDK** | 11+ | `java -version` |
| **Android SDK** | 最新 | `echo $ANDROID_HOME` |
| **Gradle** | 自动 | Android Studio 包含 |
| **Xcode** | 14+ (macOS) | `xcode-select -p` |
| **CocoaPods** | 最新 (iOS) | `pod --version` |

---

## Android APK 生成

### 方式 1️⃣: 使用脚本（推荐，全自动）

```bash
# 进入项目目录
cd /path/to/zhiqin-attendance

# 标准构建（开发版本）
chmod +x build-android.sh
./build-android.sh

# 或发布版本（签名）
chmod +x build-release-apk.sh
./build-release-apk.sh

# 输出：android/app/release/app-release.apk
# 或：./app-release.apk
```

**输出说明：**
- ✅ 开发版本：可直接安装，未签名
- ✅ 发布版本：已签名，可正式分发

### 方式 2️⃣: 使用 Android Studio（图形界面）

```bash
# 打开 Android Studio 项目
npx cap open android

# 在 Android Studio 中操作：
```

**步骤：**
1. 等待 Gradle 初始化完成
2. 菜单 → `Build` → `Generate Signed Bundle / APK`
3. 选择 `APK` 格式
4. 创建或选择密钥库（Key Store）
   - 密钥库密码：设置一个强密码（记住！）
   - 密钥别名：`zhiqin-key`
   - 密钥密码：同上或不同都可
5. 选择 Build Variants: `release`
6. 完成生成
7. 找到 APK：`android/app/release/app-release.apk`

### 方式 3️⃣: 命令行生成（高级用户）

```bash
cd android

# 构建 Debug APK（无签名，仅测试）
./gradlew assembleDebug
# 输出: app/debug/app-debug.apk

# 构建 Release APK（需要签名配置）
./gradlew assembleRelease
# 输出: app/release/app-release.apk

# 同时构建 Bundle（用于 Google Play）
./gradlew bundleRelease
# 输出: app/release/app-release.aab
```

### 签名密钥管理

**创建新密钥库：**

```bash
keytool -genkey -v -keystore zhiqin.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias zhiqin-key \
  -storepass yourpassword \
  -keypass yourpassword

# 参数说明：
# -validity 10000: 有效期 10000 天（~27 年）
# -alias: 密钥别名，用于签名时识别
```

**查看密钥信息：**

```bash
keytool -list -v -keystore zhiqin.jks -storepass yourpassword
```

---

## iOS IPA 生成

### 要求
- ⚠️ **必须在 macOS 上运行**
- ⚠️ **需要 Xcode 14+**
- ⚠️ **需要 Apple 开发者账户**（可选，内部版本不需要）

### 方式 1️⃣: 使用 Xcode（推荐）

```bash
# 打开 Xcode 项目
npx cap open ios

# 或手动打开
open ios/App/App.xcworkspace
```

**步骤：**

1. **配置签名**
   - 选择 `App` 项目
   - 点击 `Signing & Capabilities`
   - Team 选择你的 Apple 账户
   - Bundle Identifier: `com.zhiqin.attendance`

2. **生成 Archive**
   - 菜单 → `Product` → `Archive`
   - 等待编译完成（通常 5-10 分钟）
   - Archives 窗口自动打开

3. **选择分发方式**
   - 点击 `Distribute App`
   - 选择分发方式：
     - **Ad Hoc**：内部测试版（推荐）
     - **Enterprise**：企业版本
     - **App Store Connect**：上架到 App Store

4. **完成导出**
   - 按照向导完成
   - 选择导出位置
   - IPA 文件生成完成

### 方式 2️⃣: 使用 TestFlight（内部分发，推荐）

**最简单的内部版本分发方式：**

1. **上传到 App Store Connect**
   ```bash
   # 在 Xcode 中 Archive 后选择 App Store Connect
   ```

2. **邀请测试者**
   - https://appstoreconnect.apple.com
   - 你的应用 → TestFlight
   - 邀请测试员
   - 分享邀请链接

3. **用户安装步骤**
   - 用户点击邀请链接
   - 安装 TestFlight 应用
   - 在 TestFlight 中下载你的应用
   - 自动收到更新通知

### 方式 3️⃣: 通过 Fastlane（自动化，高级）

```bash
# 安装 Fastlane
sudo gem install fastlane -NV

# 初始化
cd ios/App
fastlane init

# 配置 lane
# fastlane/Fastfile

# 生成
cd ../../
fastlane ios release
```

---

## APP 下载分享

### 托管 Android APK

#### 选项 A: 在 Vercel 托管（推荐，免费）

```bash
# 1. 复制 APK 到项目
cp android/app/release/app-release.apk public/app.apk

# 2. 推送到 GitHub
git add public/app.apk
git commit -m "Add Android APK"
git push origin main

# 3. Vercel 自动部署
# 获得下载链接：https://your-app.vercel.app/app.apk
```

#### 选项 B: 使用云存储（阿里云 OSS 示例）

```bash
# 1. 安装 OSS 工具
npm install -g ossutil

# 2. 配置账户
ossutil config

# 3. 上传 APK
ossutil cp android/app/release/app-release.apk \
  oss://your-bucket/apps/zhiqin-app.apk -r

# 4. 生成下载链接
# https://your-bucket.oss-cn-hangzhou.aliyuncs.com/apps/zhiqin-app.apk
```

#### 选项 C: 使用 GitHub Releases（适合版本管理）

```bash
# 1. 创建 Release
gh release create v1.0.0 android/app/release/app-release.apk \
  -t "智勤考勤 v1.0.0" \
  -n "正式版本发布"

# 2. 获得下载链接
# https://github.com/YOUR/REPO/releases/download/v1.0.0/app-release.apk
```

### 下载页面

已为你创建下载页面：`public/download.html`

**访问链接：**
```
https://your-app.vercel.app/download.html
```

**功能：**
- ✅ Web 版本直接打开
- ✅ Android APK 下载
- ✅ iOS TestFlight 邀请
- ✅ 功能说明
- ✅ 安装指南

---

## 完整分享链接

### 最终部署

| 形式 | 链接 | 说明 |
|------|------|------|
| **Web 版** | `https://your-app.vercel.app` | 推荐，无需下载 |
| **下载中心** | `https://your-app.vercel.app/download.html` | 所有 APP 下载中心 |
| **Android APK** | `https://your-app.vercel.app/app.apk` | 直接下载 |
| **iOS IPA** | TestFlight 邀请链接 | 需要邀请 |

### 分享给团队的文案

**示例 1（推荐 Web）：**
```
📱 智勤考勤系统已上线！

👉 点击直接使用：
   https://your-app.vercel.app

✨ 无需下载，支持所有设备
🔄 自动更新，随时使用最新版本

有任何问题，联系我们！
```

**示例 2（多选）：**
```
📱 智勤考勤系统 - 三种使用方式

1️⃣ 网页版（推荐）
   https://your-app.vercel.app
   
2️⃣ 下载 Android APP
   https://your-app.vercel.app/download.html
   点击"Android"下载 APK
   
3️⃣ iOS 用户
   请联系管理员获取 TestFlight 邀请

💡 提示：可将网页版添加到手机主屏幕，像 APP 一样使用！
```

---

## 常见问题

### Q: APK 生成失败，提示找不到 Gradle

```bash
# 解决：检查 Android SDK
echo $ANDROID_HOME

# 如果为空，安装 Android Studio 或设置：
export ANDROID_HOME=/Users/username/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Q: IPA 生成时提示签名错误

```bash
# Xcode → Signing & Capabilities
# 检查：
# 1. Team 已选择（不是"None"）
# 2. Bundle ID 正确
# 3. Provisioning Profile 有效
```

### Q: APK 文件太大（>100MB）

```bash
# 原因：包含了不必要的库
# 解决：在 android/app/build.gradle 中优化：

android {
    bundle {
        enableUncompressed = true  // 压缩无效文件
        dynamicFeatures = []       // 移除动态功能
    }
}
```

### Q: 用户下载 APK 后无法安装

**可能原因和解决：**
1. **Android 版本太低** → 需要 7.0+
2. **未允许未知来源** → 设置 → 安全 → 打开
3. **文件损坏** → 重新下载
4. **已安装同名应用** → 先卸载旧版本

### Q: 如何让用户自动更新 APP？

**方案 1：Web 版本（自动更新）**
```
用户无需操作，刷新即可获得最新版本
```

**方案 2：Android APP（手动更新）**
```
发布新 APK，提示用户下载
```

**方案 3：iOS TestFlight（自动推送）**
```
上传新 IPA 到 TestFlight
用户自动收到更新通知
```

### Q: 如何保护 APK 免被反编译？

```
使用 ProGuard/R8 混淆代码：

android {
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Q: 如何在 APP 中添加推送通知？

```bash
# 安装 Firebase Messaging
npm install @capacitor/push-notifications

# 在 App.jsx 中配置：
import { PushNotifications } from '@capacitor/push-notifications';

PushNotifications.requestPermissions();
```

---

## 📊 APP 发布清单

- [ ] 代码测试完成
- [ ] 版本号更新（capacitor.config.json）
- [ ] 应用图标和启动屏配置
- [ ] Firebase 配置验证
- [ ] Android APK 生成和签名
- [ ] iOS IPA 生成和签名
- [ ] 内部测试通过
- [ ] 上传到分发平台
- [ ] 获取下载链接
- [ ] 编写分享文案
- [ ] 发送给用户

---

## 🎉 现在就开始！

```bash
# 1. 确保代码已推送
git push origin main

# 2. 构建 Web 应用
npm run build

# 3. 生成 Android APK
chmod +x build-release-apk.sh
./build-release-apk.sh

# 4. 生成 iOS IPA
npx cap open ios
# Xcode 中 Product → Archive

# 5. 分享链接给团队
# Web: https://your-app.vercel.app
# APK: https://your-app.vercel.app/app.apk
# 下载中心: https://your-app.vercel.app/download.html
```

---

**祝 APP 上线成功！🚀**
