# 智勤考勤系统

轻量级企业考勤管理系统，支持 Web、iOS、Android 和桌面 PWA 应用。基于 React + Vite + Firebase + Capacitor。

## ✨ 特性

- 🎯 **跨平台**：Web、iOS、Android、桌面应用
- 🔒 **安全认证**：Firebase 身份验证、时间校验、地理位置验证
- 📱 **响应式设计**：完美适配手机、平板、电脑
- ⚡ **实时同步**：Firestore 实时数据库
- 📊 **数据分析**：考勤档案、工时统计、Excel 导出
- 🌐 **离线支持**：PWA 离线缓存
- 🚀 **快速部署**：一键部署到 Vercel

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
# 访问 http://localhost:5173
```

### 构建生产版本
```bash
npm run build
npm run preview
```

## 📦 部署

### 方式 1：Web + PWA（推荐）
```bash
# Vercel 自动部署
git push origin main
# 访问 https://your-app.vercel.app
```

### 方式 2：Android APP
```bash
chmod +x build-android.sh
./build-android.sh
# APK 输出：android/app/release/app-release.apk
```

### 方式 3：iOS APP
```bash
npx cap open ios
# 在 Xcode 中 Archive 并导出 IPA
```

详见 [DEPLOYMENT.md](./DEPLOYMENT.md) 和 [QUICK_START.md](./QUICK_START.md)

## 🏗️ 项目结构

```
src/
├── App.jsx              # 主应用组件（所有功能）
├── main.jsx             # 入口点
└── index.css            # 样式

public/
├── manifest.json        # PWA 配置
└── sw.js               # Service Worker

android/                # Android 原生项目
ios/                    # iOS 原生项目
capacitor.config.json   # Capacitor 配置
```

## 🔧 核心功能

### 员工功能
- ✅ 签到/签退考勤
- ✅ 地理位置验证
- ✅ 工作汇报
- ✅ 考勤历史查看
- ✅ 加班声明

### 管理员功能
- ✅ 全员考勤管理
- ✅ 加班审批
- ✅ 员工激活/锁定
- ✅ Excel 报表导出
- ✅ 系统配置管理

### 安全特性
- ✅ 时间篡改检测
- ✅ 地理围栏验证
- ✅ 身份认证审计
- ✅ 数据实时加密
- ✅ Firebase 安全规则

## 🔐 Firebase 配置

当前 Firebase 项目已配置，无需额外设置：
- 项目 ID: `intelligent-attendance-s-9289d`
- 认证方式: 匿名 + 自定义令牌
- 数据库: Firestore
- 存储桶: 云存储

修改配置在 `src/App.jsx` 的 `firebaseConfig` 对象。

## 🌍 环境变量

可选配置（如使用环境变量）：
```env
# .env.local
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 📱 PWA 使用

### 安装方式

**iPhone/iPad（Safari）：**
1. 打开 Web 链接
2. 分享 → 添加到主屏幕
3. 完成安装

**Android（Chrome）：**
1. 打开 Web 链接
2. 菜单 → 安装应用
3. 完成安装

**Windows/Mac（Chrome/Edge）：**
1. 打开 Web 链接
2. 地址栏右侧点击安装图标
3. 完成安装

### 离线功能
- PWA 可离线使用（部分功能）
- Service Worker 自动缓存静态资源
- 在线时自动同步数据

## 🛠️ 开发

### 添加新页面
1. 在 `src/` 创建组件
2. 在 `App.jsx` 中导入和添加路由
3. 运行 `npm run dev` 测试

### 修改 Firebase 规则
1. Firebase 控制台 → Firestore
2. 修改安全规则
3. 部署规则

### 自定义样式
- 使用 Tailwind CSS
- 修改 `tailwind.config.js`
- 编辑 `src/index.css`

## 🚀 持续集成/部署

GitHub Actions 配置文件：`.github/workflows/deploy.yml`

自动部署流程：
1. 推送代码到 `main` 分支
2. GitHub Actions 运行构建
3. Vercel 自动部署
4. 获得新部署链接

## 📊 性能优化

- ✅ 代码分割
- ✅ 资源压缩
- ✅ CDN 加速（Vercel）
- ✅ 懒加载
- ✅ 缓存策略

## 🐛 常见问题

### Q: 如何修改打卡位置？
A: 修改 `App.jsx` 中的 `config` 对象的 `officeLat` 和 `officeLng`

### Q: 如何添加管理员？
A: Firebase 控制台修改用户的 `role` 字段为 `admin`

### Q: 离线时能打卡吗？
A: 不能，需要网络连接以同步到 Firestore

### Q: 如何修改邀请码？
A: 修改 `App.jsx` 中 `config.inviteCode` 的值

### Q: 支持批量导入员工吗？
A: 可以通过 Firebase 控制台或编写管理脚本批量插入

## 📄 许可证

MIT

## 📞 技术支持

- Capacitor: https://capacitorjs.com/docs
- Firebase: https://firebase.google.com/docs
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs
- Vite: https://vitejs.dev/

---

**祝部署顺利！🎉**
