import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, WifiOff, Fingerprint, Database, Check } from 'lucide-react';
import { cn } from '../utils';

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('luqahi_onboarding_completed');
    if (!hasSeen) {
      setIsVisible(true);
    } else {
      onComplete();
    }
  }, [onComplete]);

  if (!isVisible) return null;

  const slides = [
    {
      icon: <WifiOff className="w-12 h-12 text-blue-500" />,
      bg: 'bg-blue-50',
      title: 'يعمل بدون إنترنت تماماً',
      desc: 'تم تصميم لقاحي ليعمل في أقصى الظروف. سجل البيانات وستتم مزامنتها تلقائياً عند توفر الاتصال.'
    },
    {
      icon: <Fingerprint className="w-12 h-12 text-emerald-500" />,
      bg: 'bg-emerald-50',
      title: 'توثيق حيوي متقدم',
      desc: 'وداعاً للأسماء المتشابهة. نستخدم بصمات الوجه والصوت لتوثيق هوية الطفل وضمان الدقة المطلقة.'
    },
    {
      icon: <Database className="w-12 h-12 text-purple-500" />,
      bg: 'bg-purple-50',
      title: 'سجل صحي موحد',
      desc: 'ارتبط بالشبكة الوطنية. احصل على تقارير تفصيلية وأرسل إشعارات تذكير تلقائية لأولياء الأمور.'
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('luqahi_onboarding_completed', 'true');
      setIsVisible(false);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col items-center text-center p-8">
        
        <div className="w-full h-1 bg-slate-100 absolute top-0 left-0">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${((step + 1) / slides.length) * 100}%` }}
          />
        </div>

        <div className={cn("w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-3 transition-colors", slides[step].bg)}>
          {slides[step].icon}
        </div>

        <div className="space-y-3 min-h-[120px]">
          <h2 className="text-2xl font-black text-slate-800">{slides[step].title}</h2>
          <p className="text-slate-500 font-medium leading-relaxed">{slides[step].desc}</p>
        </div>

        <div className="flex gap-2 mb-8 mt-4">
          {slides.map((_, i) => (
            <div key={i} className={cn("h-2 rounded-full transition-all duration-300", i === step ? "w-8 bg-slate-800" : "w-2 bg-slate-200")} />
          ))}
        </div>

        <div className="flex gap-4 w-full">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn-secondary w-16 !p-0 flex items-center justify-center">
               <ArrowRight className="w-6 h-6" />
            </button>
          )}
          <button onClick={handleNext} className="btn-primary flex-1 !h-16 text-lg shadow-emerald-500/20">
             {step < slides.length - 1 ? (
               <>التالي <ChevronLeft className="w-5 h-5 ml-2" /></>
             ) : (
               <>ابدأ الاستخدام <Check className="w-5 h-5 ml-2" /></>
             )}
          </button>
        </div>

      </div>
    </div>
  );
}
