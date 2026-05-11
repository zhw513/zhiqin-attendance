# ✅ 代码兼容性检查 - Firebase 规则部署前

## 📋 概述

新的 Firebase 规则要求应用代码正确传递某些字段。本文档帮助您检查代码是否兼容。

---

## 🔍 检查项目 1: 用户注册时的 role 字段

### 位置
`src/App.jsx` 第 539-548 行

### 当前代码
```javascript
await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', newWorkId), {
  uid: user.uid,
  name: nameInput,
  workId: newWorkId,
  role: 'staff',           // ✅ 必须有这行！
  isActive: true,          // ✅ 必须有这行！
  isRemoteEnabled: false,
  createdAt: serverTimestamp(),
  registrationMethod: 'invite_code'
});
```

### 检查清单
- [ ] 代码中有 `role: 'staff'`？
- [ ] 代码中有 `isActive: true`？
- [ ] 新用户的 role 总是 'staff'？
- [ ] 新用户的 isActive 总是 true？

### ✅ 这部分代码正确，无需改动

---

## 🔍 检查项目 2: 打卡记录创建时的 uid 字段

### 位置
`src/App.jsx` 第 404-425 行

### 当前代码
```javascript
const handleClockIn = async () => {
  // ...
  try {
    const now = new Date();
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'attendance'), {
      uid: user.uid,                    // ✅ 必须有！
      userName: profile?.name || '未知',
      workId: profile?.workId || 'N/A',
      date: now.toISOString().split('T')[0],
      clockIn: now.toTimeString().slice(0, 5),
      startMillis: Date.now(),
      clockOut: null,
      isApproved: true,                 // ✅ 必须是 true！
      platform: platformInfo.type,
      workMode: locationStatus === 'success' ? 'office' : 'remote',
      auditStatus: integrityStatus,
      createdAt: serverTimestamp(),
    });
```

### 检查清单
- [ ] 创建打卡时有 `uid: user.uid`？
- [ ] 创建打卡时有 `isApproved: true`？
- [ ] 没有 `approvedBy` 字段？
- [ ] 没有 `approvedAt` 字段？
- [ ] 没有 `rejectionReason` 字段？

### ✅ 这部分代码正确，无需改动

---

## 🔍 检查项目 3: 打卡记录更新时的字段

### 位置
`src/App.jsx` 第 433-466 行

### 当前代码
```javascript
const handleClockOut = async (recordId) => {
  // ...
  try {
    const now = new Date();
    const duration = parseFloat(((Date.now() - target.startMillis) / 3600000).toFixed(2));
    const isOT = duration > config.otThreshold;
    
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', recordId), {
      clockOut: now.toTimeString().slice(0, 5),        // ✅ 可以改
      totalHours: duration,                             // ✅ 可以改
      isOvertime: isOT,                                 // ✅ 可以改
      isApproved: !isOT,                                // ⚠️ 需要检查
      workSummary: workSummary.trim(),                  // ✅ 可以改（≤500字）
      updatedAt: serverTimestamp(),                     // ✅ 可以改
    });
```

### ⚠️ 需要注意的问题

**问题**: `isApproved: !isOT`
- 如果 `isOT` (超时) = true，则 `isApproved` = false（正确）
- 如果 `isOT` = false，则 `isApproved` = true（正确）

**但是新规则不允许员工修改 isApproved**！

### 修复方案
```javascript
// ❌ 错误 - 员工不能改 isApproved
await updateDoc(doc(...), {
  clockOut: now.toTimeString().slice(0, 5),
  isApproved: !isOT,  // ← 删除这行！
  workSummary: workSummary.trim(),
  updatedAt: serverTimestamp(),
});

// ✅ 正确 - 只改员工能改的字段
await updateDoc(doc(...), {
  clockOut: now.toTimeString().slice(0, 5),
  totalHours: duration,
  isOvertime: isOT,
  workSummary: workSummary.trim(),
  updatedAt: serverTimestamp(),
  // 不修改 isApproved，让管理员来批准
});
```

### 检查清单
- [ ] 员工修改打卡时会改 isApproved？ **如果是，需要修改代码！**
- [ ] 修改代码后移除了 `isApproved` 这一行？
- [ ] workSummary 字段长度限制 ≤ 500 字符？

### 👉 **建议修改**
```javascript
// src/App.jsx 第 452-459 行，修改为：
await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', recordId), {
  clockOut: now.toTimeString().slice(0, 5),
  totalHours: duration,
  isOvertime: isOT,
  workSummary: workSummary.trim(),
  updatedAt: serverTimestamp()
  // ✅ 不再设置 isApproved，让管理员审批
});
```

---

## 🔍 检查项目 4: 管理员批准加班的代码

### 位置
`src/App.jsx` 第 862-865 行

### 当前代码
```javascript
// 批准按钮
<button onClick={() => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', r.id), { 
  isApproved: true 
})}>
  <CheckCircle2/>
</button>

// 拒绝按钮
<button onClick={() => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', r.id), { 
  isApproved: false, 
  totalHours: 9.0 
})}>
  <XCircle/>
</button>
```

### ⚠️ 需要改进

新规则要求：
- 批准时应该记录 `approvedBy` 和 `approvedAt`
- 拒绝时应该记录 `rejectionReason`

### 建议改进
```javascript
// 批准按钮 - 改进版
<button onClick={() => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', r.id), {
  isApproved: true,
  approvedBy: adminUid,           // ✅ 谁批准的
  approvedAt: serverTimestamp(),  // ✅ 何时批准的
})}>
  <CheckCircle2/>
</button>

// 拒绝按钮 - 改进版
<button onClick={() => {
  const reason = prompt('请输入拒绝原因:');
  if (!reason) return;
  updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', r.id), {
    isApproved: false,
    rejectionReason: reason,      // ✅ 拒绝原因
    approvedBy: adminUid,          // ✅ 谁拒绝的
    approvedAt: serverTimestamp(), // ✅ 何时拒绝的
  });
}>
  <XCircle/>
</button>
```

### 检查清单
- [ ] 批准加班时记录了 `approvedBy`？
- [ ] 批准加班时记录了 `approvedAt`？
- [ ] 拒绝加班时记录了 `rejectionReason`？
- [ ] 拒绝加班时记录了 `approvedBy` 和 `approvedAt`？

---

## 🔍 检查项目 5: 长字段值检查

### 工作总结字段限制

新规则限制: `workSummary.size() <= 500`

### 检查
```javascript
// 在 src/App.jsx 搜索 workSummary
// 确保没有允许超过 500 字符的输入
```

### 修复方案
```javascript
// 在 textarea 元素添加限制
<textarea 
  value={workSummary} 
  onChange={e => {
    const text = e.target.value;
    if (text.length <= 500) {
      setWorkSummary(text);
    } else {
      notify('工作总结最多500字', 'error');
    }
  }} 
  maxLength={500}  // ← 添加这行
  placeholder="总结今日工作..."
/>
```

### 检查清单
- [ ] textarea 添加了 `maxLength={500}`？
- [ ] onChange 检查了字符长度？

---

## 🔍 检查项目 6: 员工删除权限

### 当前代码
```javascript
// src/App.jsx 第 919-920 行
<button onClick={() => {
  if(window.confirm(`确认删除 ${u.name} ？`)) {
    updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', u.id), {
      isActive: false,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: profile?.name || '未知管理员',
      deletedByWorkId: profile?.workId || 'N/A'
    })
  }
}>
  删除
</button>
```

### ✅ 这部分代码正确
- 管理员可以删除用户（规则允许）
- 记录了删除人和删除时间
- 员工无法执行此操作（规则防止）

### 检查清单
- [ ] 删除用户功能只在管理员面板中？
- [ ] 普通员工无法删除用户？

---

## 📊 兼容性检查清单

### 必须修改
- [ ] **第 3 项**: 移除员工修改 `isApproved` 的代码
- [ ] **第 5 项**: 添加 workSummary 长度限制

### 应该改进
- [ ] **第 4 项**: 管理员批准时记录 `approvedBy` 和 `approvedAt`
- [ ] **第 4 项**: 管理员拒绝时记录 `rejectionReason`

### 无需改动
- [ ] **第 1 项**: 用户注册代码 ✅
- [ ] **第 2 项**: 打卡创建代码 ✅
- [ ] **第 6 项**: 员工删除权限 ✅

---

## 🛠️ 修改步骤

### 第1步: 修改 handleClockOut 函数

**位置**: `src/App.jsx` 第 451-459 行

**修改前**:
```javascript
await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', recordId), {
  clockOut: now.toTimeString().slice(0, 5),
  totalHours: duration,
  isOvertime: isOT,
  isApproved: !isOT,                    // ❌ 删除这行
  workSummary: workSummary.trim(),
  updatedAt: serverTimestamp()
});
```

**修改后**:
```javascript
await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', recordId), {
  clockOut: now.toTimeString().slice(0, 5),
  totalHours: duration,
  isOvertime: isOT,
  workSummary: workSummary.trim(),
  updatedAt: serverTimestamp()
});
```

### 第2步: 添加 workSummary 长度限制

**位置**: `src/App.jsx` 第 837 行左右的 textarea 元素

**修改前**:
```javascript
<textarea 
  value={workSummary} 
  onChange={e => setWorkSummary(e.target.value)}
  placeholder="总结今日工作..."
/>
```

**修改后**:
```javascript
<textarea 
  value={workSummary} 
  onChange={e => setWorkSummary(e.target.value.slice(0, 500))}
  maxLength={500}
  placeholder="总结今日工作... (最多500字)"
/>
```

### 第3步（可选）: 改进管理员审批

**位置**: `src/App.jsx` 第 862-865 行

参考上面的"建议改进"部分，添加 `approvedBy` 和 `approvedAt` 等字段。

---

## ✅ 最终验证

在部署 Firebase 规则前，检查：

```
代码修改:
  [ ] 已删除员工修改 isApproved 的代码
  [ ] 已添加 workSummary 长度限制
  [ ] 已修改和保存文件

代码测试:
  [ ] npm run lint - 没有 ESLint 错误
  [ ] 本地开发服务器正常运行 (npm run dev)
  [ ] 测试打卡流程（签到、签退）
  [ ] 没有控制台错误

准备部署:
  [ ] 所有代码修改已完成
  [ ] Firebase 规则已准备好
  [ ] 备份已完成
```

---

## 🚀 后续步骤

1. ✅ **现在**: 完成上面的代码修改
2. ✅ **然后**: 在本地测试 (npm run dev)
3. ✅ **接着**: 按照 DEPLOYMENT_EXECUTION_PLAN.md 部署规则
4. ✅ **最后**: 验证一切正常运行

---

## 📞 需要帮助？

如果不确定如何修改代码，您可以：
1. 告诉我具体错误信息
2. 我可以为您生成修改后的代码片段
3. 您直接复制粘贴替换

随时提问！ 🚀

---

**版本**: 1.0  
**更新**: 2026-05-11  
**状态**: 准备就绪 ✅
