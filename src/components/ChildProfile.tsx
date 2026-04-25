import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Baby, 
  Calendar, 
  ShieldCheck, 
  Check, 
  Clock, 
  AlertTriangle,
  QrCode,
  Download,
  Share2,
  MapPin
} from 'lucide-react';
import { db, type Child, type VaccinationRecord } from '../db';
import { VACCINATION_SCHEDULE } from '../constants';
import { getStatusColor, cn } from '../utils';
import { format, isBefore, parseISO } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

export function ChildProfile({ uuid, onBack }: { uuid: string, onBack: () => void }) {
  const [child, setChild] = useState<Child | null>(null);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadData();
  }, [uuid]);

  const loadData = async () => {
    const childData = await db.children.where('uuid').equals(uuid).first();
    if (childData) {
      setChild(childData);
      const records = await db.vaccinations.where('childUuid').equals(uuid).toArray();
      
      // Update status based on current date
      const today = format(new Date(), 'yyyy-MM-dd');
      const updatedRecords = records.map(r => {
        if (r.status === 'PENDING' && isBefore(parseISO(r.dateScheduled), parseISO(today))) {
          return { ...r, status: 'OVERDUE' as const };
        }
        return r;
      });
      setVaccinations(updatedRecords);
    }
  };

  const toggleVaccine = async (record: VaccinationRecord) => {
    const newStatus = record.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const today = format(new Date(), 'yyyy-MM-dd');
    
    await db.vaccinations.update(record.id!, {
      status: newStatus,
      dateGiven: newStatus === 'COMPLETED' ? today : undefined,
      isSynced: false
    });
    
    loadData();
  };

  if (!child) return <div className="p-10 text-center">جاري التحميل...</div>;

  const completedCount = vaccinations.filter(v => v.status === 'COMPLETED').length;
  const progress = (completedCount / vaccinations.length) * 100;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-10 py-4">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs py-2 hover:text-emerald-600 transition-colors">
        <ArrowRight className="w-5 h-5 text-emerald-600" /> عودة للقائمة
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-32 h-32 rounded-[2rem] bg-slate-50 border-8 border-slate-50 ring-1 ring-slate-100 shadow-inner overflow-hidden mb-4">
            {child.photoBase64 ? (
              <img src={child.photoBase64} alt={child.fullName} className="w-full h-full object-cover" />
            ) : (
              <Baby className="w-full h-full p-8 text-slate-200" />
            )}
          </div>
          <h2 className="text-3xl font-black text-slate-800 leading-tight">{child.fullName}</h2>
          <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">ابن/ابنة: {child.motherName}</p>
          
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowQR(true)} className="btn-secondary !rounded-2xl !p-3">
              <QrCode className="w-6 h-6" />
            </button>
            <button className="btn-secondary !rounded-2xl !p-3">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-3xl border border-white">
            <span className="label-caps block mb-1">تاريخ الميلاد</span>
            <p className="font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" /> {child.birthDate}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-3xl border border-white">
            <span className="label-caps block mb-1">مكان الميلاد</span>
            <p className="font-bold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" /> {child.birthPlace}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 bg-slate-50 p-6 rounded-3xl border border-white">
          <div className="flex justify-between items-end mb-3">
            <p className="label-caps">نسبة التحصين الوطنية</p>
            <p className="text-3xl font-black text-emerald-600 leading-none">{Math.round(progress)}%</p>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-slate-100">
            <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Vaccination List */}
      <div className="px-2 pt-4">
        <h3 className="font-bold text-xl text-slate-800">سجل التطعيمات</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">اضغط على الجرعة لتسجيلها</p>
      </div>
      
      <div className="space-y-6">
        {VACCINATION_SCHEDULE.map(vaccine => {
          const doses = vaccinations.filter(v => v.vaccineKey === vaccine.key);
          if (doses.length === 0) return null;

          return (
            <div key={vaccine.key} className="space-y-3">
              <h4 className="label-caps px-2 !text-slate-400">{vaccine.nameAr}</h4>
              <div className="grid grid-cols-1 gap-3">
                {doses.sort((a,b) => a.doseNumber - b.doseNumber).map(dose => {
                  const scheduleInfo = vaccine.doses.find(d => d.doseNumber === dose.doseNumber);
                  return (
                    <div 
                      key={`${dose.vaccineKey}-${dose.doseNumber}`}
                      onClick={() => toggleVaccine(dose)}
                      className={cn(
                        "bg-white rounded-3xl p-5 flex items-center gap-5 transition-all active:scale-[0.98] cursor-pointer border shadow-sm",
                        dose.status === 'COMPLETED' ? "border-emerald-100 bg-emerald-50/30" : 
                        dose.status === 'OVERDUE' ? "border-red-100 bg-red-50/30 ring-2 ring-red-500 ring-offset-2" : "border-slate-100"
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-4 shadow-inner",
                        dose.status === 'COMPLETED' ? "bg-emerald-500 border-white text-white" : 
                        dose.status === 'OVERDUE' ? "bg-red-500 border-white text-white" : "bg-slate-50 border-white text-slate-300"
                      )}>
                        {dose.status === 'COMPLETED' ? <Check className="w-8 h-8 stroke-[3px]" /> : 
                         dose.status === 'OVERDUE' ? <Clock className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8 text-slate-100" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">الجرعة {dose.doseNumber} - {scheduleInfo?.descriptionAr}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                          {dose.status === 'COMPLETED' 
                            ? `تم الإعطاء: ${dose.dateGiven}` 
                            : `الموعد: ${dose.dateScheduled}`}
                        </p>
                      </div>

                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                        dose.status === 'COMPLETED' ? "bg-emerald-600 text-white" :
                        dose.status === 'OVERDUE' ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
                      )}>
                        {dose.status === 'COMPLETED' ? 'تم' : dose.status === 'OVERDUE' ? 'متأخر' : 'قادم'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-[3rem] p-10 text-center space-y-8 shadow-2xl">
            <div className="space-y-2">
              <h3 className="font-black text-2xl text-slate-800">الهوية الرقمية</h3>
              <p className="label-caps tracking-widest">Digital Healthcare Identity</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2.5rem] shadow-inner inline-block mx-auto border-4 border-white ring-1 ring-slate-100">
              <QRCodeSVG value={JSON.stringify({ uuid: child.uuid, name: child.fullName })} size={180} />
            </div>
            <p className="text-sm text-slate-500 font-medium px-4">يمكن للمُطعّم مسح هذا الرمز لمزامنة السجل فوراً</p>
            <div className="flex flex-col gap-3 pt-2">
              <button className="btn-primary w-full shadow-emerald-500/20"><Download className="w-5 h-5" /> حفظ في الاستوديو</button>
              <button onClick={() => setShowQR(false)} className="btn-secondary w-full">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
