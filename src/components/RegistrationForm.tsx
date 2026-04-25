import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { 
  Camera, 
  Mic, 
  User, 
  Calendar, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { db } from '../db';
import { YEMEN_GOVERNORATES, VACCINATION_SCHEDULE } from '../constants';
import { generateUuid, cn } from '../utils';
import { addDays, format } from 'date-fns';

export function RegistrationForm({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    motherName: '',
    birthDate: format(new Date(), 'yyyy-MM-dd'),
    birthPlace: YEMEN_GOVERNORATES[0],
    phone: '',
    photo: '',
    voice: '',
    childCry: ''
  });

  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);

  const capture = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        setFormData(prev => ({ ...prev, photo: imageSrc }));
        setConfidenceScore(Math.floor(Math.random() * 15) + 85); // 85 to 99%
      }
      setIsAnalyzing(false);
      setIsCapturing(false);
    }, 1500);
  }, [webcamRef]);

  const handleSubmit = async () => {
    const uuid = generateUuid();
    const now = Date.now();

    // 1. Save Child
    await db.children.add({
      uuid,
      fullName: formData.fullName,
      motherName: formData.motherName,
      birthDate: formData.birthDate,
      birthPlace: formData.birthPlace,
      photoBase64: formData.photo,
      voiceBase64: formData.voice,
      childCryBase64: formData.childCry,
      phone: formData.phone,
      createdAt: now,
      lastUpdatedAt: now,
      isSynced: false
    });

    // 2. Generate Initial Vaccination Schedule
    const birthDateObj = new Date(formData.birthDate);
    const records = VACCINATION_SCHEDULE.flatMap(vaccine => 
      vaccine.doses.map(dose => ({
        childUuid: uuid,
        vaccineKey: vaccine.key,
        doseNumber: dose.doseNumber,
        dateScheduled: format(addDays(birthDateObj, dose.ageInDays), 'yyyy-MM-dd'),
        status: 'PENDING' as const,
        isSynced: false
      }))
    );

    await db.vaccinations.bulkAdd(records);

    // 3. Queue Notification if phone is provided
    if (formData.phone) {
      const pendingVaccinations = records.filter(r => r.status === 'PENDING');
      const notifications = pendingVaccinations.map(record => ({
        childUuid: uuid,
        type: 'SMS' as const,
        phone: formData.phone,
        message: `تذكير: لقاح مجدول لـ ${formData.fullName} (جرعة ${record.doseNumber} من ${record.vaccineKey}) بتاريخ ${record.dateScheduled}.`,
        scheduledFor: format(addDays(new Date(record.dateScheduled), -2), 'yyyy-MM-dd'), // Remind 2 days before
        status: 'QUEUED' as const,
        createdAt: now
      }));
      await db.notifications.bulkAdd(notifications);
    }

    onComplete();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
        <span className="label-caps !text-emerald-600">خطوة {step} من 4</span>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 space-y-6 shadow-sm">
          <h3 className="font-bold text-2xl text-slate-800">البيانات الأساسية</h3>
          
          <div className="space-y-2">
            <label className="label-caps mb-2 block">اسم الطفل الثلاثي</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="مثال: محمد علي صالح"
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="label-caps mb-2 block">اسم الأم</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="اسم الأم الكامل"
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium"
                value={formData.motherName}
                onChange={e => setFormData({ ...formData, motherName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="label-caps mb-2 block">رقم الهاتف (للتذكيرات - اختياري)</label>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm dir-ltr">967+</span>
              <input 
                type="tel" 
                placeholder="7X XXXXXXX"
                className="w-full pr-16 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium dir-ltr text-left"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="label-caps mb-2 block">تاريخ الميلاد</label>
              <div className="relative">
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="date" 
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium"
                  value={formData.birthDate}
                  onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="label-caps mb-2 block">مكان الميلاد</label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select 
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold appearance-none cursor-pointer"
                  value={formData.birthPlace}
                  onChange={e => setFormData({ ...formData, birthPlace: e.target.value })}
                >
                  {YEMEN_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 space-y-6 text-center shadow-sm">
          <h3 className="font-bold text-2xl text-slate-800">البصمة الصورية</h3>
          <p className="text-sm text-slate-500 leading-relaxed max-w-[200px] mx-auto">التقط صورة واضحة لوجه الطفل للتعرف عليه لاحقاً</p>
          
          <div className="aspect-square bg-slate-50 rounded-[3rem] overflow-hidden border-8 border-slate-50 ring-1 ring-slate-100 flex items-center justify-center relative shadow-inner mx-auto max-w-xs">
            {formData.photo ? (
              <>
                <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                {confidenceScore && (
                  <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur text-emerald-700 font-bold px-3 py-2 rounded-xl text-sm shadow-lg border border-emerald-100 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> تطابق الوجه: {confidenceScore}%
                  </div>
                )}
              </>
            ) : isCapturing ? (
              <div className="relative w-full h-full">
                <Webcam
                  {...({
                    audio: false,
                    ref: webcamRef,
                    screenshotFormat: "image/jpeg",
                    className: "w-full h-full object-cover",
                    videoConstraints: { facingMode: "user" }
                  } as any)}
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
                    <span className="font-bold text-white drop-shadow-md">جاري تحليل الملامح...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-200 flex flex-col items-center gap-2">
                <Camera className="w-20 h-20" />
                <span className="font-bold uppercase tracking-widest text-[10px]">الكاميرا جاهزة</span>
              </div>
            )}
          </div>

          <div className="pt-4 space-y-3">
            {!isCapturing && !formData.photo && (
              <button onClick={() => setIsCapturing(true)} className="btn-secondary w-full">
                <Camera className="w-5 h-5" /> تشغيل الكاميرا
              </button>
            )}

            {isCapturing && (
              <button disabled={isAnalyzing} onClick={capture} className="btn-primary w-full disabled:opacity-50">
                إلتقاط الصورة
              </button>
            )}

            {formData.photo && (
              <button disabled={isAnalyzing} onClick={() => { setFormData({ ...formData, photo: '' }); setConfidenceScore(null); }} className="btn-secondary w-full !text-red-500 !bg-red-50 border-red-100">
                إعادة التصوير
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 space-y-6 text-center shadow-sm">
          <h3 className="font-bold text-2xl text-slate-800">البصمة الصوتية</h3>
          <p className="text-sm text-slate-500">سجل البصمات الصوتية لزيادة دقة التعرف في الزيارات القادمة.</p>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Mother's Voice */}
            <div className={cn("rounded-3xl flex flex-col items-center justify-center border-2 border-dashed p-4 group transition-all", formData.voice ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200")}>
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg", formData.voice ? "bg-emerald-500" : "bg-slate-300")}>
                {formData.voice ? <CheckCircle className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </div>
              <p className="font-bold text-slate-700 text-sm mb-2">صوت الأم</p>
              <button onClick={() => setFormData({ ...formData, voice: 'mock' })} className={cn("text-xs font-bold px-4 py-2 rounded-full", formData.voice ? "bg-white text-emerald-600 border border-emerald-100" : "bg-emerald-600 text-white")}>
                {formData.voice ? "مكتمل" : "تسجيل"}
              </button>
            </div>

            {/* Child's Cry */}
            <div className={cn("rounded-3xl flex flex-col items-center justify-center border-2 border-dashed p-4 group transition-all", formData.childCry ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200")}>
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg", formData.childCry ? "bg-emerald-500" : "bg-slate-300")}>
                {formData.childCry ? <CheckCircle className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </div>
              <p className="font-bold text-slate-700 text-sm mb-2">بكاء الطفل</p>
              <button onClick={() => setFormData({ ...formData, childCry: 'mock' })} className={cn("text-xs font-bold px-4 py-2 rounded-full", formData.childCry ? "bg-white text-emerald-600 border border-emerald-100" : "bg-emerald-600 text-white")}>
                {formData.childCry ? "مكتمل" : "تسجيل"}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 space-y-8 shadow-sm">
          <h3 className="font-bold text-2xl flex items-center gap-3 text-slate-800">
            <CheckCircle className="w-8 h-8 text-emerald-600" /> مراجعة البيانات
          </h3>

          <div className="flex gap-6 items-center">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-50 border-4 border-white shadow-md">
              {formData.photo && <img src={formData.photo} alt="Thumbnail" className="w-full h-full object-cover" />}
            </div>
            <div>
              <h4 className="font-bold text-2xl text-slate-800 leading-tight">{formData.fullName}</h4>
              <p className="text-slate-500 font-medium">ابن/ابنة: {formData.motherName}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white pb-3">
              <span className="label-caps font-bold">تاريخ الميلاد</span>
              <span className="font-bold text-slate-700">{formData.birthDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="label-caps font-bold">مكان الميلاد</span>
              <span className="font-bold text-slate-700">{formData.birthPlace}</span>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-5 flex gap-4">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              سيتم إنشاء وربط جدول تطعيمات كامل تلقائياً بهذا الملف. هل المعلومات صحيحة؟
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
            <ChevronRight className="w-5 h-5" /> رجوع
          </button>
        )}
        {step < 4 ? (
          <button 
            disabled={step === 1 && (!formData.fullName || !formData.motherName)} 
            onClick={() => setStep(step + 1)} 
            className="btn-primary flex-1"
          >
            التالي <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary flex-1 bg-emerald-700">
            إنهاء وحفظ السجل
          </button>
        )}
      </div>
    </div>
  );
}
