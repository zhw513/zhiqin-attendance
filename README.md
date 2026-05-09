# 🎯 智勤考勤系统 - 完整版本

**轻量级企业考勤管理系统，支持 Web、iOS、Android 和 PWA**

> 本项目已完全准备好，可立即部署到你的团队。所有功能、文档、脚本都已准备完毕。

---

## ⚡ 快速开始（5 步，20 分钟）

### 1️⃣ 推送到 GitHub（3 分钟）
```bash
git init && git add . && git commit -m "Initial: ZhiQin"
git branch -M main
git remote add origin https://github.com/YOUR/REPO.git
git push -u origin main
```

### 2️⃣ Vercel 自动部署（2 分钟）
1. 访问 https://vercel.com
2. "New Project" → 选择仓库 → "Deploy"
3. ✅ 获得链接：`https://your-app.vercel.app`

### 3️⃣ 生成 Android APK（10 分钟）
```bash
chmod +x build-release-apk.sh
./build-release-apk.sh
```

### 4️⃣ 上传 APK 到 Vercel（2 分钟）
```bash
cp android/app/release/app-release.apk public/app.apk
git add public/app.apk && git commit -m "build: Add APK" && git push
```

### 5️⃣ 分享给团队（0 分钟）
```
🌐 Web: https://your-app.vercel.app
📱 下载中心: https://your-app.vercel.app/download.html
🤖 APK: https://your-app.vercel.app/app.apk
```

---

## ✨ 功能完整清单

### ✅ 核心功能
- [x] 员工上班打卡 / 下班签退
- [x] 地理位置验证（GPS 范围检测）
- [x] 实时工作计时器
- [x] 工作汇报填写
- [x] 考勤历史查看
- [x] **时间篡改检测**（网络时间校验）
- [x] **加班审批**（管理员审核）
- [x] **Excel 报表导出**

### 🎛️ 管理员功能
- [x] 员工管理（激活/锁定）
- [x] **🆕 动态修改打卡地址**（纬度、经度）
- [x] **🆕 动态修改允许范围**（米）
- [x] 邀请码管理
- [x] 加班阈值设置
- [x] 全员考勤统计
- [x] 加班审批管理

### 📱 多平台支持
- [x] **Web 应用**（浏览器）
- [x] **PWA**（离线支持、快捷方式、自动更新）
- [x] **Android APP**（APK 打包、可直接下载）
- [x] **iOS APP**（IPA 打包、TestFlight 分发）
- [x] **响应式设计**（手机、平板、电脑）

### 🔒 安全特性
- [x] Firebase 身份认证
- [x] 时间同步验证
- [x] 地理位置验证
- [x] 数据实时加密
- [x] Firestore 安全规则

---

## 🆕 本次更新内容

### 🎯 管理员地址配置
在"合规设定"标签页中，管理员可以：
- 🔧 实时修改打卡地址（纬度、经度）
- 🔧 调整允许范围（米）
- 🔧 修改邀请码
- 🔧 调整加班阈值
- 💾 一键保存到 Firestore
- ⚡ 实时生效，所有员工立即使用新配置

### 📱 完整的 APP 支持
- 🤖 **Android APK**：自动生成脚本，可直接分享下载
- 🍎 **iOS IPA**：完整的 Capacitor 集成，可通过 TestFlight 分发
- 📲 **APP 下载中心**：漂亮的下载页面（`public/download.html`）
- 🌐 **浏览器链接下载**：用户点击即下载，无需上架

### 📚 完整的文档
- 📖 `FINAL_DEPLOYMENT.md` ⭐ 最终部署指南（**从这开始！**）
- 📖 `BUILD_APPS.md` - APP 构建详细指南
- 📖 `COMMANDS_REFERENCE.md` - 命令速查表
- 📖 `QUICK_START.md` - 快速开始
- 📖 `README_ZH.md` - 项目说明

---

## 📂 项目结构

```
zhiqin-attendance/
├── 🎯 核心应用
│   ├── src/App.jsx                # React 主应用（已更新管理员设置页面）
│   ├── dist/                      # Web 应用构建产物
│   └── public/
│       ├── download.html          # APP 下载中心页面 ⭐
│       ├── manifest.json          # PWA 配置
│       └── sw.js                  # Service Worker（离线支持）
│
├── 📱 平台集成
│   ├── android/                   # Android 原生项目（Capacitor）
│   ├── ios/                       # iOS 原生项目（Capacitor）
│   └── capacitor.config.json      # Capacitor 配置
│
├── 🔨 构建脚本
│   ├── build-app.sh               # 通用构建脚本
│   ├── build-android.sh           # 开发版本 APK
│   └── build-release-apk.sh       # 发布版本 APK ⭐
│
├── 📖 文档（全中文）
│   ├── FINAL_DEPLOYMENT.md        # ⭐ 从这开始
│   ├── BUILD_APPS.md              # APP 构建指南
│   ├── COMMANDS_REFERENCE.md      # 命令参考
│   ├── START_HERE.md              # 快速开始
│   └── README_ZH.md               # 项目说明
│
└── 🔧 配置文件
    ├── vercel.json                # Vercel 部署配置
    ├── .github/workflows/deploy.yml  # GitHub Actions 自动化
    └── .gitignore                 # Git 忽略配置
```

---

## 🚀 部署选项

| 方式 | 特点 | 推荐指数 |
|------|------|--------|
| **Web 版本** | 无需下载，自动更新，所有设备支持 | ⭐⭐⭐⭐⭐ |
| **PWA** | 可添加到主屏幕，体验接近原生 | ⭐⭐⭐⭐⭐ |
| **Android APK** | 原生应用体验，用户可直接下载 | ⭐⭐⭐⭐ |
| **iOS IPA** | 通过 TestFlight 内部分发 | ⭐⭐⭐ |

---

## 🎯 使用场景

### 小团队（5-50人）
✅ 推荐使用 **Web 版本**
- 无需下载
- 自动更新
- 成本最低
- 所有设备都能用

### 中等团队（50-500人）
✅ 推荐 **Web + Android APP**
- Web 版本作为主要入口
- Android APP 提供原生体验
- 管理员可动态配置
- 数据实时同步

### 大型企业
✅ 推荐 **Web + APP + 自建后端**
- Web 版本作为主应用
- iOS/Android APP 同时支持
- 自建 API 替代 Firebase
- 私有部署

---

## 💡 关键特性

### 🌟 管理员动态配置
```javascript
// 管理员在应用中实时修改
1. 打卡地址（纬度、经度）
2. 允许范围（米）
3. 邀请码
4. 加班阈值

// 自动保存到 Firestore
// 所有员工立即使用新配置
```

### ⚡ 实时数据同步
```javascript
// Firestore 实时数据库
// 所有设备实时同步考勤数据
// 无需刷新页面
```

### 🔒 安全性
```javascript
// 时间篡改检测：与网络时间对比
// 地理位置验证：GPS 范围验证
// 数据加密：Firebase 自动加密
// 身份认证：Firestore 安全规则
```

### 📱 响应式设计
```javascript
// 完美适配
// - 手机（Portrait & Landscape）
// - 平板
// - 电脑（Desktop）
```

---

## 🔧 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| **前端框架** | React | 19.2.5 |
| **构建工具** | Vite | 8.0.10 |
| **样式** | Tailwind CSS | 4.2.4 |
| **图标** | Lucide React | 1.14.0 |
| **后端** | Firebase | Latest |
| **跨平台** | Capacitor | Latest |
| **部署** | Vercel | - |
| **CI/CD** | GitHub Actions | - |

---

## 📊 数据库结构

```javascript
Firestore
├── artifacts/
│   └── intelligent-attendance-s-9289d/
│       └── public/
│           └── data/
│               ├── users/          # 员工信息
│               │   └── {uid}/
│               │       ├── name
│               │       ├── workId
│               │       ├── role (staff/admin)
│               │       └── isActive
│               │
│               ├── attendance/     # 考勤记录
│               │   └── {docId}/
│               │       ├── uid
│               │       ├── date
│               │       ├── clockIn/clockOut
│               │       ├── totalHours
│               │       ├── workSummary
│               │       └── isApproved
│               │
│               └── settings/       # 全局配置（管理员可改）
│                   └── global/
│                       ├── officeLat
│                       ├── officeLng
│                       ├── allowedRadius
│                       ├── inviteCode
│                       └── otThreshold
```

---

## 📋 部署检查清单

- [ ] 代码已提交到 GitHub
- [ ] Vercel 部署完成
- [ ] Web 应用可正常访问
- [ ] 管理员设置页面可用
- [ ] APK 文件已生成（可选）
- [ ] APK 已上传到 Vercel（可选）
- [ ] 下载页面链接正确
- [ ] 所有链接都可访问
- [ ] 团队成员已通知

---

## 🆘 快速问题排查

| 问题 | 解决方案 |
|------|--------|
| Vercel 部署失败 | 查看 `FINAL_DEPLOYMENT.md` 的"常见问题" |
| APK 生成失败 | 确保安装了 Java JDK 11+ 和 Android SDK |
| 应用打开很慢 | 网络问题或首次加载，稍候刷新 |
| 员工无法打卡 | 检查员工是否被激活、是否在范围内 |
| 地址修改不生效 | 清除浏览器缓存，刷新页面 |

详见：`FINAL_DEPLOYMENT.md`

---

## 📞 文档导航

**立即开始？**
👉 阅读 **`FINAL_DEPLOYMENT.md`** ⭐

**需要 APP 构建步骤？**
👉 查看 **`BUILD_APPS.md`**

**需要命令参考？**
👉 查看 **`COMMANDS_REFERENCE.md`**

**需要快速开始？**
👉 查看 **`QUICK_START.md`**

**需要项目说明？**
👉 查看 **`README_ZH.md`**

---

## 🎉 现在就可以部署！

**总耗时：20 分钟**

1. ✅ 推送代码到 GitHub（3 分钟）
2. ✅ Vercel 自动部署（2 分钟）
3. ✅ 生成 Android APK（10 分钟）
4. ✅ 上传 APK 到 Vercel（2 分钟）
5. ✅ 分享链接给团队（0 分钟）

**结果：**
- 🌐 Web 应用链接
- 📱 APP 下载中心
- 🤖 Android APK 直接下载
- ⚡ 团队可立即使用

---

## 🚀 后续计划

- [ ] 集成 push 通知
- [ ] 考勤数据分析
- [ ] 员工成绩评分
- [ ] 考勤规则定制
- [ ] 多分公司支持
- [ ] 对接三方系统（HR/OA）

---

## 📄 许可证

MIT

---

## 🤝 反馈和支持

遇到问题？
1. 查看文档（**`FINAL_DEPLOYMENT.md`**）
2. 检查常见问题部分
3. 查阅命令参考（**`COMMANDS_REFERENCE.md`**）

---

**祝你部署顺利！🎊**

**问题？查看 `FINAL_DEPLOYMENT.md` 的常见问题部分。**
