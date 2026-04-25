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
    photo: '',
    voice: ''
  });

  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setFormData(prev => ({ ...prev, photo: imageSrc }));
      setIsCapturing(false);
    }
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
              <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
            ) : isCapturing ? (
              <Webcam
                {...({
                  audio: false,
                  ref: webcamRef,
                  screenshotFormat: "image/jpeg",
                  className: "w-full h-full object-cover",
                  videoConstraints: { facingMode: "user" }
                } as any)}
              />
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
              <button onClick={capture} className="btn-primary w-full">
                إلتقاط الصورة
              </button>
            )}

            {formData.photo && (
              <button onClick={() => setFormData({ ...formData, photo: '' })} className="btn-secondary w-full !text-red-500 !bg-red-50 border-red-100">
                إعادة التصوير
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 space-y-6 text-center shadow-sm">
          <h3 className="font-bold text-2xl text-slate-800">البصمة الصوتية</h3>
          <p className="text-sm text-slate-500">سجل صوت الأم أو الأب ينادي اسم الطفل</p>
          
          <div className="aspect-video bg-emerald-50 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-emerald-100 border-dashed p-6 group transition-all">
            <div className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center text-white mb-4 animate-pulse shadow-xl shadow-emerald-500/20">
              <Mic className="w-12 h-12" />
            </div>
            <p className="font-bold text-emerald-800">جاري المحاكاة...</p>
          </div>

          <button onClick={() => setFormData({ ...formData, voice: 'mock_voice_data' })} className="btn-primary w-full">
            نقر للتسجيل (محاكاة)
          </button>
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
