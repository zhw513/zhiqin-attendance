# 智勤考勤系统 - 安全审计与优化报告

## 📋 审计信息
- **审计日期**: 2026年5月11日
- **审计对象**: 智勤考勤系统 (https://zhiqindk.space/)
- **审计方式**: 源代码分析 + 配置检查
- **安全评分**: 7.5/10 (还有改进空间)

---

## 🔴 高优先级安全问题

### 1. **Firebase API Key 暴露风险**
**位置**: `src/App.jsx` 第 18-26 行  
**严重性**: ⚠️ 中等  

Firebase API Key 在编译后的 JavaScript 中可见。这在 Firebase 中是可接受的，但**必须依赖正确的 Firestore 安全规则防护**。

✅ **立即优化方案**:
```javascript
// 使用环境变量，而不是硬编码
// .env.local
VITE_FIREBASE_API_KEY=AIzaSyBmPKJ76__U_GA4M3NmZ6SmIvtOc8gUBzM
VITE_FIREBASE_PROJECT_ID=intelligent-attendance-s-9289d

// src/config/firebase.js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};
```

---

### 2. **邀请码硬编码问题** 
**位置**: `src/App.jsx` 第 65 行  
**严重性**: ⚠️ 高  
**问题**: `inviteCode: 'TEAM2024'` 暴露在源代码中，任何人都可以看到

✅ **立即优化**:
```javascript
// 从 Firestore 动态获取邀请码
const configDoc = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global');
onSnapshot(configDoc, (doc) => {
  if (doc.exists()) {
    const { inviteCode } = doc.data();
    setConfig(prev => ({ ...prev, inviteCode }));
  }
});

// Firestore 中配置定期轮换:
// {
//   inviteCode: 'TEAM2024',
//   inviteCodeRotationDate: '2026-05-11',
//   inviteCodeExpiresAt: '2026-06-11'
// }
```

---

### 3. **localStorage 存储敏感信息不安全**
**位置**: `src/App.jsx` 第 551, 625, 626 行  
**严重性**: ⚠️ 高  
**问题**: 
```javascript
localStorage.setItem('loggedInWorkId', newWorkId);  // ❌ XSS 易窃取
localStorage.setItem('sessionId', sessionId);       // ❌ Session 泄露风险
```

✅ **立即优化**:
```javascript
// 方案1: 使用内存存储（推荐）
// 移除所有 localStorage 相关代码

// 方案2: 使用 Firebase 认证持久化
import { setPersistence, browserSessionPersistence } from "firebase/auth";
await setPersistence(auth, browserSessionPersistence);
// Firebase 会自动管理认证状态，更安全

// 方案3: 如必须存储，使用 sessionStorage （仅限当前标签页）
sessionStorage.setItem('sessionId', sessionId);  // 页面关闭自动清除
```

---

## 🟡 中优先级安全问题

### 4. **缺少完整的输入验证**
**问题**: 只检查了格式，缺少长度限制、特殊字符清理

✅ **优化方案**:
```javascript
function validateInput(input, type) {
  const trimmed = input.trim();
  
  switch(type) {
    case 'name':
      if (trimmed.length < 2 || trimmed.length > 50) 
        throw new Error('姓名长度必须在2-50字符之间');
      if (!/^[一-龥]+$/.test(trimmed)) 
        throw new Error('姓名必须为中文字符');
      return trimmed;
      
    case 'summary':
      if (trimmed.length > 500) 
        throw new Error('工作总结不能超过500字');
      // 移除 HTML 标签
      return trimmed
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
  }
}
```

---

### 5. **缺少速率限制 (Rate Limiting)**
**问题**: 无法防止暴力破解邀请码、刷屏操作

✅ **优化方案**:
```javascript
class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }
  
  isAllowed(key) {
    const now = Date.now();
    const data = this.attempts.get(key) || 
      { count: 0, resetTime: now + this.windowMs };
    
    if (now > data.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (data.count >= this.maxAttempts) return false;
    data.count++;
    return true;
  }
}

// 使用
const loginLimiter = new RateLimiter(5, 60000);
if (!loginLimiter.isAllowed(`login_${workIdInput}`)) {
  notify('尝试过多，请稍后重试', 'error');
}
```

---

### 6. **缺少内容安全策略 (CSP)**
**问题**: 容易受到内联脚本注入

✅ **在 vercel.json 中配置**:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://cdn.firebase.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://firebase.google.com https://firestore.googleapis.com;"
        }
      ]
    }
  ]
}
```

---

### 7. **sessionId 生成不够安全**
**问题**: `Math.random()` 不是密码安全的随机数生成器

✅ **优化**:
```javascript
async function generateSecureSessionId() {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 使用
const sessionId = await generateSecureSessionId();
```

---

### 8. **缺少审计日志**
**问题**: 无法追踪谁做了什么操作

✅ **添加审计日志**:
```javascript
const auditLog = {
  async log(userId, action, details, severity = 'info') {
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs'), {
        userId,
        action,
        details,
        severity,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.error('Audit log failed:', err);
    }
  }
};

// 使用
await auditLog.log(user.uid, 'LOGIN', { workId: profile.workId });
await auditLog.log(user.uid, 'CLOCK_IN', { location: { lat, lng } });
```

---

## ✅ 已实现的安全措施

| 项目 | 状态 | 说明 |
|------|------|------|
| HTTPS/TLS | ✅ | 已启用 |
| XSS 防护 | ✅ | 部分 (X-XSS-Protection) |
| CSRF 防护 | ✅ | Firebase 内置 |
| 点击劫持防护 | ✅ | X-Frame-Options |
| 时间完整性 | ✅ | 防篡改检查 |
| 单设备登录 | ✅ | 已实现 |
| 地理位置验证 | ✅ | 已实现 |
| 输入验证 | ⚠️ | 部分 |
| 速率限制 | ❌ | 缺失 |
| 审计日志 | ❌ | 缺失 |
| 数据加密 | ❌ | 缺失 |

---

## 📊 安全改进优先级

| 优先级 | 项目 | 时间 | 难度 |
|--------|------|------|------|
| 🔴 高 | 检查 Firebase 安全规则 | 1h | 简单 |
| 🔴 高 | 邀请码从代码移到 Firestore | 1h | 简单 |
| 🔴 高 | 移除不安全的 localStorage 使用 | 2h | 中等 |
| 🟡 中 | 完整的输入验证 | 2h | 中等 |
| 🟡 中 | 添加速率限制 | 3h | 中等 |
| 🟡 中 | CSP 头部配置 | 1h | 简单 |
| 🟡 中 | 安全的 sessionId 生成 | 1h | 简单 |
| 🟡 中 | 审计日志系统 | 3h | 中等 |
| 🟢 低 | 双因素认证 | 8h | 复杂 |
| 🟢 低 | 数据加密 | 6h | 复杂 |

---

## 🎯 立即行动清单 (今天完成)

### ✓ 任务 1: 检查 Firebase 安全规则 (5分钟)
1. 打开 Firebase Console
2. 选择项目 `intelligent-attendance-s-9289d`
3. 进入 Firestore -> 规则
4. **检查是否为 `allow read, write: if true;` (高风险!)**
5. 如果是，立即替换为严格规则

### ✓ 任务 2: 配置环境变量 (10分钟)
```bash
# 创建 .env.local (在 .gitignore 中)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

### ✓ 任务 3: 移除 localStorage 敏感信息 (20分钟)
- 删除所有 `localStorage.setItem/getItem` 调用
- 使用 Firebase 的认证持久化代替

---

## 💡 关键建议总结

1. **立即**: 检查 Firebase 安全规则 - 这是最关键的
2. **本周**: 修复邀请码和 localStorage 问题
3. **本月**: 添加输入验证、速率限制、审计日志
4. **未来**: 考虑 2FA 和数据加密

---

## 📈 安全评分提升路线图

| 阶段 | 当前 | 目标 | 改进 |
|------|------|------|------|
| **现在** | 7.5/10 | - | - |
| **第1周** | 7.5 → 8.0 | 修复高优先级问题 | +0.5 |
| **第2周** | 8.0 → 8.5 | 添加中优先级功能 | +0.5 |
| **第1月** | 8.5 → 9.0 | 完善防御机制 | +0.5 |
| **第2月** | 9.0 → 9.5 | 添加高级功能 | +0.5 |

---

*报告生成: 2026-05-11*  
*下一次审计: 建议3个月后*
