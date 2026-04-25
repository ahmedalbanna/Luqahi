/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Settings, 
  ShieldCheck, 
  Plus, 
  Baby, 
  Bell, 
  Cloud,
  RefreshCw,
  History,
  Camera,
  Mic,
  ChevronRight,
  Database,
  BarChart2,
  MessageSquare
} from 'lucide-react';
import { db, type Child, type VaccinationRecord } from './db';
import { VACCINATION_SCHEDULE } from './constants';
import { generateUuid, cn } from './utils';

// Views
type View = 'dashboard' | 'register' | 'search' | 'profile' | 'settings' | 'analytics' | 'reminders';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedChildUuid, setSelectedChildUuid] = useState<string | null>(null);
  const [childrenCount, setChildrenCount] = useState(0);
  const [syncCount, setSyncCount] = useState(0);

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = async () => {
    const count = await db.children.count();
    setChildrenCount(count);
    const unsynced = await db.children.where('isSynced').equals(0).count();
    setSyncCount(unsynced);
  };

  const navigateToProfile = (uuid: string) => {
    setSelectedChildUuid(uuid);
    setCurrentView('profile');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans mb-20 bg-slate-50 text-slate-900">
      <Onboarding onComplete={() => console.log('onboarding complete')} />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800">لقاحي</h1>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">اليمن - سجل التحصين</p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentView('settings')}
            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors relative"
          >
            <RefreshCw className={cn("w-6 h-6", isSyncing && "animate-spin", syncCount > 0 && "text-amber-500")} />
            {syncCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full p-4 overflow-y-auto">
        {currentView === 'dashboard' && <Dashboard childrenCount={childrenCount} onRegister={() => setCurrentView('register')} onChildClick={navigateToProfile} />}
        {currentView === 'register' && <RegistrationForm onComplete={() => { setCurrentView('dashboard'); refreshStats(); }} />}
        {currentView === 'search' && <SearchPage onChildClick={navigateToProfile} />}
        {currentView === 'profile' && selectedChildUuid && <ChildProfile uuid={selectedChildUuid} onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'settings' && <SettingsPage syncCount={syncCount} onRefresh={refreshStats} />}
        {currentView === 'analytics' && <AnalyticsPage />}
        {currentView === 'reminders' && <RemindersPage />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <NavButton active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={Users} label="الرئيسية" />
          <NavButton active={currentView === 'search'} onClick={() => setCurrentView('search')} icon={Search} label="بحث" />
          <NavButton active={currentView === 'analytics'} onClick={() => setCurrentView('analytics')} icon={BarChart2} label="إحصائيات" />
          <NavButton active={currentView === 'reminders'} onClick={() => setCurrentView('reminders')} icon={MessageSquare} label="تنبيهات" />
          <NavButton active={currentView === 'settings'} onClick={() => setCurrentView('settings')} icon={Database} label="البيانات" />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-2 transition-colors",
        active ? "text-emerald-600" : "text-slate-400"
      )}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
      {active && <span className="w-1 h-1 bg-emerald-600 rounded-full mt-1"></span>}
    </button>
  );
}

// --- Dashboard View ---
function Dashboard({ childrenCount, onRegister, onChildClick }: { childrenCount: number, onRegister: () => void, onChildClick: (uuid: string) => void }) {
  const [recentChildren, setRecentChildren] = useState<Child[]>([]);

  useEffect(() => {
    db.children.orderBy('createdAt').reverse().limit(5).toArray().then(setRecentChildren);
  }, []);

  return (
    <div className="space-y-8 py-4">
      <div className="bg-emerald-600 text-white rounded-[2.5rem] p-8 shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="relative z-10">
          <p className="label-caps !text-white opacity-60">إجمالي الأطفال المسجلين</p>
          <h2 className="text-5xl font-black mt-2 leading-none">{childrenCount}</h2>
          <button 
            onClick={onRegister}
            className="mt-8 bg-white text-emerald-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:bg-emerald-50 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            تسجيل طفل جديد
          </button>
        </div>
        <Baby className="absolute -bottom-6 -left-6 w-40 h-40 text-emerald-500 opacity-20 transform -rotate-12" />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-lg text-slate-800">نصائح صحية اليوم</h3>
          <Bell className="w-5 h-5 text-amber-500" />
        </div>
        <div className="bg-white border border-amber-100 rounded-[2rem] p-6 shadow-sm flex gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800 mb-1">أهمية التحصين الروتيني</p>
            <p className="text-sm text-slate-500 leading-relaxed italic">
              "اللقاح هو الوسيلة الوحيدة والآمنة لحماية الطفل. شجع الأمهات على الالتزام بالمواعيد."
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-lg text-slate-800">المسجلون حديثاً</h3>
          <History className="w-5 h-5 text-slate-400" />
        </div>
        
        {recentChildren.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-200 border-dashed text-center py-12 text-slate-400">
            <Baby className="w-12 h-12 mx-auto opacity-10 mb-2" />
            <p className="font-medium">لا يوجد أطفال مسجلون حالياً</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentChildren.map(child => (
              <div 
                key={child.uuid} 
                onClick={() => onChildClick(child.uuid)}
                className="bg-white rounded-3xl p-4 flex items-center gap-4 border border-slate-100 shadow-sm hover:border-emerald-200 transition-all active:scale-[0.98] cursor-pointer"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-white shadow-inner shrink-0">
                  {child.photoBase64 ? (
                    <img src={child.photoBase64} alt={child.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <Baby className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 truncate">{child.fullName}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">تاريخ الميلاد: {child.birthDate}</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// --- Import other subview components once they are built ---
import { RegistrationForm } from './components/RegistrationForm';
import { SearchPage } from './components/SearchPage';
import { ChildProfile } from './components/ChildProfile';
import { SettingsPage } from './components/SettingsPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { RemindersPage } from './components/RemindersPage';
import { Onboarding } from './components/Onboarding';
