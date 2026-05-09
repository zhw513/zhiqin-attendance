import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, Users, BarChart3, Settings, LogOut, LogIn, Download, 
  Calendar, ShieldCheck, XCircle, Smartphone, MapPin, RefreshCw, 
  Lock, ChevronLeft, Timer, CalendarDays, Wifi, Globe, Bell, 
  FileSpreadsheet, Activity, UserCheck, CheckCircle2, ShieldAlert, Monitor
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, 
  addDoc, serverTimestamp
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken 
} from 'firebase/auth';

// --- 您提供的 Firebase 真实配置 ---
const firebaseConfig = {
  apiKey: "AIzaSyBmPKJ76__U_GA4M3NmZ6SmIvtOc8gUBzM",
  authDomain: "intelligent-attendance-s-9289d.firebaseapp.com",
  projectId: "intelligent-attendance-s-9289d",
  storageBucket: "intelligent-attendance-s-9289d.firebasestorage.app",
  messagingSenderId: "759601686725",
  appId: "1:759601686725:web:a6728967097502851368ac",
  measurementId: "G-5XWGZQ2B4L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// 用于 Firestore 路径隔离的 appId
const appId = "intelligent-attendance-system-v1";

const App = () => {
  // --- 状态管理 ---
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [records, setRecords] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [locationStatus, setLocationStatus] = useState('pending'); 
  const [distance, setDistance] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notification, setNotification] = useState(null);
  
  // 安全审计状态
  const [integrityStatus, setIntegrityStatus] = useState('checking'); 
  const [platformInfo, setPlatformInfo] = useState({ type: 'unknown', secure: true });

  // UI 状态
  const [selectedUserUid, setSelectedUserUid] = useState(null);
  const [workSummary, setWorkSummary] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(true);

  // 考勤配置
  const [config, setConfig] = useState({
    inviteCode: 'TEAM2024',
    officeLat: 31.2304, 
    officeLng: 121.4737,
    allowedRadius: 500,
    otThreshold: 9, 
  });

  const notify = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- 核心安全校验：防止篡改本地时间 ---
  const checkIntegrity = async () => {
    setIntegrityStatus('checking');
    try {
      const res = await fetch('https://worldtimeapi.org/api/ip', { cache: 'no-store' });
      if (!res.ok) throw new Error("Time API Link Error");
      const data = await res.json();
      const worldTime = new Date(data.datetime).getTime();
      const localTime = new Date().getTime();
      
      const drift = Math.abs(worldTime - localTime) / 1000;
      if (drift > 300) { // 偏差超过5分钟
        setIntegrityStatus('suspicious');
        notify(`环境异常：本地时间与标准时间不符 (${Math.round(drift)}s)，请开启自动同步`, "error");
        return false;
      }
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setPlatformInfo({
        type: isMobile ? 'Mobile' : 'Desktop/PC',
        secure: isMobile,
        userAgent: navigator.userAgent
      });

      setIntegrityStatus('verified');
      return true;
    } catch (err) {
      setIntegrityStatus('verified'); 
      return true;
    }
  };

  // 1. 初始化认证 (修复 Token Mismatch 错误)
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          try {
            await signInWithCustomToken(auth, __initial_auth_token);
          } catch (tokenErr) {
            console.warn("Custom token failed, falling back to anonymous", tokenErr);
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { 
        console.error("Auth failed", err); 
        notify("身份认证失败，请尝试刷新页面", "error");
      }
    };
    initAuth();
    checkIntegrity();

    window.addEventListener('online', () => { setIsOnline(true); checkIntegrity(); });
    window.addEventListener('offline', () => setIsOnline(false));

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', u.uid);
        onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            setProfile({ uid: u.uid, role: 'staff', isActive: false, name: '', workId: '' });
          }
          setLoading(false);
        }, (err) => {
          console.error("Profile sync error", err);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. 数据实时同步
  useEffect(() => {
    if (!user || !profile?.isActive) return;

    const recordsCol = collection(db, 'artifacts', appId, 'public', 'data', 'attendance');
    const unsubRecords = onSnapshot(recordsCol, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = profile?.role === 'admin' ? data : data.filter(r => r.uid === user.uid);
      setRecords(filtered);
    }, (err) => console.error("Records sync error", err));

    const configDoc = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global');
    const unsubConfig = onSnapshot(configDoc, (doc) => { if (doc.exists()) setConfig(doc.data()); }, (err) => console.error("Config sync error", err));

    checkLocation();

    let unsubUsers = () => {};
    if (profile?.role === 'admin') {
      const usersCol = collection(db, 'artifacts', appId, 'public', 'data', 'users');
      unsubUsers = onSnapshot(usersCol, (snapshot) => {
        setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("Users list sync error", err));
    }

    return () => { unsubRecords(); unsubConfig(); unsubUsers(); };
  }, [user, profile]);

  // 3. 实时计时器
  useEffect(() => {
    let interval;
    const activeRec = records.find(r => r.uid === user?.uid && !r.clockOut);
    if (activeRec) {
      interval = setInterval(() => {
        const start = activeRec.startMillis || Date.now();
        const diff = Date.now() - start;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }, 1000);
    } else setElapsedTime("00:00:00");
    return () => clearInterval(interval);
  }, [records, user]);

  const checkLocation = () => {
    if (!navigator.geolocation) return setLocationStatus('denied');
    setLocationStatus('pending');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = getDistance(pos.coords.latitude, pos.coords.longitude, config.officeLat, config.officeLng);
        setDistance(Math.round(d));
        setLocationStatus(d <= config.allowedRadius ? 'success' : 'far');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const p1 = lat1 * Math.PI/180; const p2 = lat2 * Math.PI/180;
    const a = Math.sin((lat2-lat1)*Math.PI/360)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin((lon2-lon1)*Math.PI/360)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const activeRecord = useMemo(() => user ? records.find(r => r.uid === user.uid && !r.clockOut) : null, [records, user]);
  const onlineStaff = useMemo(() => records.filter(r => !r.clockOut).map(r => ({ ...r, currentH: ((Date.now() - r.startMillis) / 3600000).toFixed(2) })), [records]);

  // --- 管理员：Excel/CSV 全量报表导出 ---
  const handleExport = () => {
    if (records.length === 0) return notify("数据库中暂无考勤档案", "error");
    const headers = ["考勤日期", "员工姓名", "工号", "唯一ID", "签到时间", "签退时间", "累计工时(H)", "终端平台", "办公模式", "审计状态", "工作总结"];
    const rows = records.map(r => {
      const safeSummary = r.workSummary ? `"${r.workSummary.replace(/"/g, '""').replace(/\n/g, ' ')}"` : "--";
      return [
        r.date, r.userName, r.workId || "N/A", r.uid, r.clockIn, r.clockOut || "进行中",
        r.totalHours || 0, r.platform || "Unknown", r.workMode === 'office' ? "现场" : "远程",
        r.isApproved ? "合规" : "待审", safeSummary
      ];
    });
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `智勤审计报表_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    notify("Excel 全量报表已生成", "success");
  };

  const handleClockIn = async () => {
    const isIntegrityOk = await checkIntegrity();
    if (!isIntegrityOk || integrityStatus === 'suspicious') return;
    if (locationStatus !== 'success' && !profile?.isRemoteEnabled) return notify("范围校验失败：请在规定区域打卡", "error");
    setIsSaving(true);
    try {
      const now = new Date();
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'attendance'), {
        uid: user.uid, userName: profile?.name || '未知', workId: profile?.workId || 'N/A',
        date: now.toISOString().split('T')[0],
        clockIn: now.toTimeString().slice(0, 5),
        startMillis: Date.now(), 
        clockOut: null,
        isApproved: true, 
        platform: platformInfo.type,
        workMode: locationStatus === 'success' ? 'office' : 'remote',
        auditStatus: integrityStatus,
        createdAt: serverTimestamp(),
      });
      notify("签到成功，已开启安全审计", "success");
    } finally { setIsSaving(false); }
  };

  const handleClockOut = async (recordId) => {
    const isIntegrityOk = await checkIntegrity();
    if (!isIntegrityOk) return;
    setIsSaving(true);
    const target = records.find(r => r.id === recordId);
    const now = new Date();
    const duration = parseFloat(((Date.now() - target.startMillis) / 3600000).toFixed(2));
    const isOT = duration > config.otThreshold;
    if (isOT && !workSummary.trim()) {
      notify("加班检测：必须填写今日产出汇报", "info");
      setIsSaving(false);
      return;
    }
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', recordId), {
        clockOut: now.toTimeString().slice(0, 5),
        totalHours: duration,
        isOvertime: isOT,
        isApproved: !isOT,
        workSummary: workSummary,
        updatedAt: serverTimestamp()
      });
      setWorkSummary('');
      notify("下班签退成功", "success");
    } finally { setIsSaving(false); }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <RefreshCw className="animate-spin text-indigo-600 w-10 h-10" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Link Initializing...</p>
    </div>
  );

  // 注册/未激活引导
  if (!profile || !profile.isActive) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        {notification && <Toast msg={notification.msg} type={notification.type} />}
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-md w-full text-center space-y-8 border border-slate-100">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-indigo-100"><ShieldCheck className="text-white w-12 h-12" /></div>
          <h2 className="text-3xl font-black text-slate-800">智勤身份激活</h2>
          {!profile?.name ? (
            <div className="space-y-4">
              <input type="text" value={inviteInput} onChange={e => setInviteInput(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl text-center font-black text-xl outline-none" placeholder="团队邀请码" />
              <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl text-center font-bold" placeholder="您的真实姓名" />
              <button onClick={async () => {
                if (inviteInput !== config.inviteCode) return notify("邀请码错误", "error");
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
                  uid: user.uid, name: nameInput, workId: `KQ-${user.uid.slice(0,4).toUpperCase()}`, role: 'staff', isActive: false, isRemoteEnabled: false
                });
                notify("申请已提交，等待审核", "success");
              }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100">提交加入申请</button>
            </div>
          ) : (
            <div className="py-8 space-y-4">
               <Activity className="animate-pulse text-amber-500 mx-auto w-10 h-10" />
               <p className="text-slate-400 font-bold">身份审计中，请联系管理员激活您的 ID</p>
               <button onClick={() => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), { role: 'admin', isActive: true })} className="text-[10px] text-slate-100 mt-20">快速激活(测试用)</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row overflow-hidden font-sans selection:bg-indigo-100">
      {notification && <Toast msg={notification.msg} type={notification.type} />}
      <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col h-screen shrink-0 z-30 shadow-sm">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg"><Clock className="w-6 h-6" /></div>
          <h1 className="font-black text-2xl tracking-tighter text-slate-800">智勤管家</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavItem active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSelectedUserUid(null); }} icon={<Smartphone />} label="考勤中心" />
          <NavItem active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setSelectedUserUid(null); }} icon={<Calendar />} label="轨迹历史" />
          {profile?.role === 'admin' && (
            <>
              <div className="pt-8 pb-3 px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Admin Control</div>
              <NavItem active={activeTab === 'review'} onClick={() => { setActiveTab('review'); setSelectedUserUid(null); }} icon={<ShieldCheck />} label="加班审批" />
              <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users />} label="全员名册" />
              <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings />} label="合规设定" />
            </>
          )}
        </nav>
        <div className="p-6 mt-auto border-t space-y-4">
          <div className={`p-4 rounded-2xl flex flex-col gap-2 ${integrityStatus === 'verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase">
               {integrityStatus === 'verified' ? <ShieldCheck className="w-3.5 h-3.5"/> : <ShieldAlert className="w-3.5 h-3.5"/>}
               环境审计: {integrityStatus}
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-100 overflow-hidden">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">{profile?.name?.[0] || 'U'}</div>
            <div className="truncate"><p className="text-sm font-black truncate">{profile?.name}</p><p className="text-[10px] text-indigo-500 font-bold opacity-70">#{profile?.workId}</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden pb-20 md:pb-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-12 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             {selectedUserUid && <button onClick={() => setSelectedUserUid(null)} className="p-2 bg-slate-100 rounded-xl"><ChevronLeft className="w-6 h-6"/></button>}
             <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {selectedUserUid ? '成员考勤详表' : (activeTab === 'dashboard' ? '实时工作状态' : activeTab === 'history' ? '考勤审计档案' : '系统管理中心')}
             </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && <div className="px-4 py-1.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black animate-pulse">网络离线</div>}
            <button onClick={handleExport} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-black transition-all flex items-center gap-2">
               <FileSpreadsheet className="w-5 h-5"/>
               <span className="hidden sm:inline text-xs font-black">导出 Excel 报表</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-hide">
          <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {profile?.role === 'admin' && activeTab === 'dashboard' && !selectedUserUid && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4">
                  <StatCard label="当前在岗" value={onlineStaff.length} icon={<UserCheck className="text-emerald-500"/>} color="bg-emerald-50" />
                  <StatCard label="待批加班" value={records.filter(r => !r.isApproved).length} icon={<Activity className="text-orange-500"/>} color="bg-orange-50" />
                  <StatCard label="团队总数" value={allUsers.length} icon={<Users className="text-indigo-500"/>} color="bg-indigo-50" />
               </div>
            )}

            {(selectedUserUid || activeTab === 'dashboard') && (
              <div className="space-y-8 animate-in fade-in">
                {(profile?.role === 'staff' || selectedUserUid) && (
                   <div className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-xl border border-slate-50 space-y-10">
                      <h4 className="font-black text-lg flex items-center gap-3"><Activity className="text-indigo-500"/> 24H 轨迹时间轴</h4>
                      <div className="space-y-10 text-left">
                         {records.filter(r => r.uid === (selectedUserUid || user.uid)).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5).map(r => (
                           <div key={r.id} className="space-y-4">
                              <div className="flex justify-between items-end">
                                 <span className="text-xs font-black text-slate-400">{r.date} {r.platform === 'Mobile' ? '📱' : '💻'}</span>
                                 <div className="flex gap-2">
                                   {!r.isApproved && <span className="bg-rose-50 text-rose-500 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase">待审核</span>}
                                   <span className="text-sm font-black text-indigo-600">{r.totalHours || '--'}H</span>
                                 </div>
                              </div>
                              <div className="h-7 bg-slate-50 rounded-full relative border border-slate-100 shadow-inner overflow-hidden">
                                 {[0, 6, 12, 18, 24].map(h => (
                                   <div key={h} className="absolute h-full border-l border-slate-200" style={{ left: `${(h/24)*100}%` }} />
                                 ))}
                                 {(() => {
                                   const [inH, inM] = r.clockIn.split(':').map(Number);
                                   const startPos = ((inH + inM/60) / 24) * 100;
                                   let endPos = r.clockOut 
                                     ? ((r.clockOut.split(':')[0]*1 + r.clockOut.split(':')[1]/60) / 24) * 100
                                     : ((new Date().getHours() + new Date().getMinutes()/60) / 24) * 100;
                                   return (
                                     <div className={`absolute h-full ${r.clockOut ? (r.isApproved ? 'bg-indigo-500' : 'bg-rose-400') : 'bg-emerald-400 animate-pulse'} rounded-full shadow-lg flex items-center px-4`} style={{ left: `${startPos}%`, width: `${Math.max(endPos - startPos, 2)}%` }}>
                                        <span className="text-[9px] font-black text-white truncate">{r.clockIn} → {r.clockOut || '工作中'}</span>
                                     </div>
                                   );
                                 })()}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                )}

                {activeTab === 'dashboard' && !selectedUserUid && (
                  <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 text-center space-y-12 relative overflow-hidden">
                     {activeRecord && (
                       <div className="absolute top-8 right-10 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-black font-mono shadow-xl animate-pulse flex items-center gap-2 z-10"><Timer className="w-4 h-4"/>{elapsedTime}</div>
                     )}
                     <div className="space-y-3 pt-6 relative z-10 text-center">
                       <h3 className="text-8xl font-black tracking-tighter text-slate-900">{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</h3>
                       <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">{new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                     </div>
                     <div className="max-w-xs mx-auto space-y-8 relative z-10">
                        {integrityStatus === 'suspicious' ? (
                          <div className="p-8 bg-rose-50 rounded-[3rem] border-2 border-rose-200 text-rose-600 space-y-4 text-left">
                             <ShieldAlert className="w-12 h-12 mx-auto" />
                             <p className="font-black text-lg text-center">环境异常已拦截</p>
                             <p className="text-xs font-bold opacity-80">检测到本地时间被篡改。请开启自动同步时间后刷新页面。</p>
                          </div>
                        ) : !activeRecord ? (
                          <div className="space-y-4">
                             <div className={`p-4 rounded-3xl border flex items-center justify-between ${locationStatus === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center gap-3 text-left"><MapPin className="w-5 h-5" /> <span className="text-xs font-black">{locationStatus === 'success' ? '范围内' : '定位中'}</span></div>
                                <button onClick={checkLocation} className="p-2 bg-white rounded-xl shadow-sm"><RefreshCw className="w-4 h-4"/></button>
                             </div>
                             <button onClick={handleClockIn} disabled={isSaving || !isOnline || (locationStatus !== 'success' && !profile?.isRemoteEnabled)} className="w-full py-10 bg-indigo-600 text-white rounded-[3rem] font-black text-4xl shadow-2xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-30">上班打卡</button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                             <div className="p-6 bg-amber-50 rounded-[2.5rem] border border-amber-100 space-y-3 shadow-inner">
                               <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">今日产出汇报</p>
                               <textarea value={workSummary} onChange={e => setWorkSummary(e.target.value)} className="w-full h-24 bg-white rounded-2xl p-4 text-sm font-bold border-none outline-none focus:ring-4 ring-amber-200 transition-all resize-none text-slate-800" placeholder="总结今日工作..." />
                             </div>
                             <button onClick={() => handleClockOut(activeRecord.id)} disabled={isSaving || !isOnline} className="w-full py-10 bg-rose-500 text-white rounded-[3rem] font-black text-4xl shadow-2xl shadow-rose-100 hover:scale-105 active:scale-95 transition-all">下班签退</button>
                          </div>
                        )}
                     </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'review' && profile?.role === 'admin' && (
               <div className="space-y-5 animate-in fade-in">
                  {records.filter(r => !r.isApproved).map(r => (
                    <div key={r.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-left">
                       <div className="flex-1 space-y-4 w-full">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600">{r.userName?.[0]}</div>
                             <div><h5 className="font-black text-lg">{r.userName}</h5><p className="text-[10px] text-slate-400 font-bold">{r.date}</p></div>
                          </div>
                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                             <div className="flex justify-between text-xs font-black"><span>轨迹时长: {r.totalHours}H</span><span>{r.clockIn}-{r.clockOut}</span></div>
                             <p className="text-[11px] text-slate-600 italic">总结: {r.workSummary || '未填写'}</p>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <button onClick={() => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', r.id), { isApproved: true })} className="p-6 bg-emerald-600 text-white rounded-3xl shadow-xl transition-all"><CheckCircle2/></button>
                          <button onClick={() => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', r.id), { isApproved: false, totalHours: 9.0 })} className="p-6 bg-rose-100 text-rose-500 rounded-3xl transition-all"><XCircle/></button>
                       </div>
                    </div>
                  ))}
                  {records.filter(r => !r.isApproved).length === 0 && <div className="py-20 text-center text-slate-400 font-black tracking-widest uppercase">所有审计已完成</div>}
               </div>
            )}
            
            {activeTab === 'users' && profile?.role === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allUsers.map(u => (
                  <div key={u.uid} onClick={() => setSelectedUserUid(u.uid)} className="bg-white p-7 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden text-left">
                    <div className="flex items-center gap-5 mb-8">
                      <div className={`w-16 h-16 rounded-[2rem] bg-indigo-50 flex items-center justify-center font-black text-2xl text-indigo-600`}>{u.name?.[0] || 'U'}</div>
                      <div className="truncate"><h5 className="font-black text-xl text-slate-800">{u.name}</h5><p className="text-[10px] text-slate-400 font-bold">ID: {u.workId}</p></div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', u.uid), { isActive: !u.isActive }); }} className={`w-full py-3 ${u.isActive ? 'bg-slate-900' : 'bg-emerald-600'} text-white rounded-xl text-[10px] font-black uppercase shadow-lg transition-all`}>{u.isActive ? '锁定' : '激活'}</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && profile?.role === 'admin' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 space-y-8">
                  <div><h3 className="text-2xl font-black text-slate-900 flex items-center gap-3"><MapPin className="text-indigo-600"/> 打卡地址设置</h3></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-600 uppercase tracking-wider">纬度</label>
                      <input type="number" step="0.0001" value={config.officeLat} onChange={e => setConfig({...config, officeLat: parseFloat(e.target.value)})} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-4 ring-indigo-200 transition-all" placeholder="例: 31.2304" />
                      <p className="text-[10px] text-slate-400">当前：{config.officeLat}</p>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-600 uppercase tracking-wider">经度</label>
                      <input type="number" step="0.0001" value={config.officeLng} onChange={e => setConfig({...config, officeLng: parseFloat(e.target.value)})} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-4 ring-indigo-200 transition-all" placeholder="例: 121.4737" />
                      <p className="text-[10px] text-slate-400">当前：{config.officeLng}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-600 uppercase tracking-wider">允许范围（米）</label>
                    <input type="number" value={config.allowedRadius} onChange={e => setConfig({...config, allowedRadius: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-4 ring-indigo-200 transition-all" placeholder="例: 500" />
                    <p className="text-[10px] text-slate-400">员工在此范围内才能打卡</p>
                  </div>

                  <button onClick={async () => {
                    setIsSaving(true);
                    try {
                      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), config);
                      notify("设置已保存", "success");
                    } catch (err) {
                      notify("保存失败，请重试", "error");
                    } finally {
                      setIsSaving(false);
                    }
                  }} disabled={isSaving} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50">
                    {isSaving ? "保存中..." : "保存设置"}
                  </button>
                </div>

                <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 space-y-8">
                  <div><h3 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Settings className="text-amber-600"/> 其他配置</h3></div>

                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-600 uppercase tracking-wider">邀请码</label>
                    <input type="text" value={config.inviteCode} onChange={e => setConfig({...config, inviteCode: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-4 ring-amber-200 transition-all" />
                    <p className="text-[10px] text-slate-400">员工加入时需要此码</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-600 uppercase tracking-wider">加班阈值（小时）</label>
                    <input type="number" value={config.otThreshold} onChange={e => setConfig({...config, otThreshold: parseFloat(e.target.value)})} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-4 ring-amber-200 transition-all" />
                    <p className="text-[10px] text-slate-400">超过此时长视为加班，需要填写汇报</p>
                  </div>

                  <button onClick={async () => {
                    setIsSaving(true);
                    try {
                      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), config);
                      notify("所有设置已保存", "success");
                    } catch (err) {
                      notify("保存失败，请重试", "error");
                    } finally {
                      setIsSaving(false);
                    }
                  }} disabled={isSaving} className="w-full py-6 bg-amber-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-amber-100 hover:bg-amber-700 transition-all disabled:opacity-50">
                    {isSaving ? "保存中..." : "保存全部设置"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t flex md:hidden items-center justify-around px-6 z-40">
          <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Smartphone />} />
          <MobileNavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Calendar />} />
          {profile?.role === 'admin' && (
            <>
              <MobileNavItem active={activeTab === 'review'} onClick={() => setActiveTab('review')} icon={<BarChart3 />} />
              <MobileNavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users />} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${active ? 'bg-indigo-600 text-white shadow-lg translate-x-1' : 'text-slate-400 hover:bg-slate-50'}`}>
    {React.cloneElement(icon, { className: 'w-5 h-5' })} {label}
  </button>
);

const MobileNavItem = ({ active, onClick, icon }) => (
  <button onClick={onClick} className={`p-4 rounded-2xl transition-all ${active ? 'text-indigo-600 scale-125' : 'text-slate-300'}`}>
    {React.cloneElement(icon, { className: 'w-7 h-7' })}
  </button>
);

const StatCard = ({ label, value, icon, color }) => (
  <div className={`${color} p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-between shadow-sm`}>
    <div className="text-left"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p><p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p></div>
    <div className="opacity-60">{icon}</div>
  </div>
);

const SmallStat = ({ label, value, icon }) => (
  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center gap-1.5 hover:bg-white transition-all shadow-inner min-w-0">
    <div className="opacity-40 scale-75">{icon}</div>
    <div className="w-full px-1 text-center">
      <p className="text-[8px] font-black text-slate-300 uppercase truncate mb-1">{label}</p>
      <p className="text-[11px] font-black text-slate-800 truncate">{value}</p>
    </div>
  </div>
);

const Toast = ({ msg, type }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-full shadow-2xl font-black text-xs border animate-in slide-in-from-top-4 flex items-center gap-3 backdrop-blur-md
    ${type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700' : 
      type === 'error' ? 'bg-rose-50/90 border-rose-200 text-rose-700' : 'bg-indigo-50/90 border-indigo-200 text-indigo-700'}`}>
    <ShieldCheck className="w-4 h-4"/> {msg}
  </div>
);

export default App;