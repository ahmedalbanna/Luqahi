import { useState } from 'react';
import { 
  RefreshCw, 
  Database, 
  Trash2, 
  Download, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Cloud
} from 'lucide-react';
import { db } from '../db';
import { cn } from '../utils';

export function SettingsPage({ syncCount, onRefresh }: { syncCount: number, onRefresh: () => void }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await db.children.where('isSynced').equals(0).modify({ isSynced: true });
    await db.vaccinations.where('isSynced').equals(0).modify({ isSynced: true });
    
    setIsSyncing(false);
    setMessage('تمت مزامنة جميع البيانات بنجاح مع السيرفر المركزي.');
    onRefresh();
    setTimeout(() => setMessage(''), 3000);
  };

  const clearData = async () => {
    if (confirm('هل أنت متأكد من مسح جميع البيانات المحلية؟ لا يمكن التراجع عن هذا الإجراء.')) {
      await db.children.clear();
      await db.vaccinations.clear();
      onRefresh();
      alert('تم مسح جميع البيانات.');
    }
  };

  const exportData = async () => {
    const children = await db.children.toArray();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(children));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "luqahi_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-8 pb-32 py-4">
      <div className="flex items-center gap-4 mb-2 px-2">
        <div className="w-14 h-14 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Database className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">إدارة النظام</h2>
          <p className="label-caps tracking-widest mt-1">Data & Compliance</p>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-5 rounded-[2rem] flex items-center gap-4 animate-in fade-in zoom-in duration-300 shadow-sm border-white border-4">
          <CheckCircle className="w-6 h-6 shrink-0" />
          <p className="text-sm font-bold">{message}</p>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 space-y-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className={cn(
            "w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border-2 transition-all duration-500",
            syncCount > 0 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
          )}>
            <RefreshCw className={cn("w-6 h-6", isSyncing && "animate-spin")} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">المزامنة المركزية</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium mt-1">
              {syncCount > 0 
                ? `هناك ${syncCount} سجلات جديدة في انتظار الرفع للسيرفر.` 
                : 'البيانات المحلية متطابقة تماماً مع السجل الوطني.'}
            </p>
          </div>
        </div>

        <button 
          onClick={handleSync}
          disabled={isSyncing || syncCount === 0}
          className="w-full btn-primary !h-16 text-lg shadow-emerald-600/20 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 disabled:border disabled:shadow-none"
        >
          {isSyncing ? 'جاري المزامنة...' : 'مزامنة السجلات الآن'}
        </button>
      </div>

      <div className="space-y-4 px-1">
        <h3 className="label-caps px-4">أدوات إضافية</h3>
        
        <div className="grid grid-cols-1 gap-3">
          <button onClick={exportData} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Download className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-700">تصدير نسخة احتياطية</span>
            </div>
            <FileText className="w-5 h-5 text-slate-200" />
          </button>

          <button onClick={clearData} className="bg-white p-5 rounded-[2rem] border border-red-50 shadow-sm flex items-center justify-between hover:bg-red-50 transition-all active:scale-[0.98] group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-300 group-hover:bg-red-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-red-700">مسح قاعدة البيانات</span>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-emerald-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <h4 className="text-sm font-black uppercase tracking-widest opacity-40 mb-3">حالة النظام</h4>
        <div className="space-y-1 relative z-10">
          <p className="text-2xl font-bold">بناء 8221-PX</p>
          <p className="opacity-70 text-sm font-medium">قاعدة بيانات محلية نشطة وتعمل بدون إنترنت</p>
        </div>
        <Cloud className="absolute -bottom-4 -left-4 w-32 h-32 text-white opacity-5 transform rotate-12" />
      </div>
    </div>
  );
}

