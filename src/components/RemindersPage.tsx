import { useState, useEffect } from 'react';
import { db, NotificationMessage } from '../db';
import { MessageSquare, Clock, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

export function RemindersPage() {
  const [messages, setMessages] = useState<NotificationMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMsgs() {
      const msgs = await db.notifications.orderBy('scheduledFor').toArray();
      setMessages(msgs);
      setLoading(false);
    }
    fetchMsgs();
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-6 pb-20 py-4 px-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800">قائمة التنبيهات</h2>
        <p className="label-caps tracking-widest mt-1">SMS Reminders Queue</p>
      </div>

      <div className="bg-amber-50 rounded-3xl p-5 border border-amber-100 flex gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
        <p className="text-sm text-amber-800 font-medium leading-relaxed">
          هذه الرسائل مجدولة للارسال كـ SMS. سيتم إرسالها تلقائياً عند مزامنة النظام وتوفر الاتصال بالإنترنت.
        </p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 border-dashed rounded-[3rem]">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="label-caps !text-slate-400">لا توجد رسائل في الطابور</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 dir-ltr text-left">{msg.phone}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">رسالة نصية</p>
                  </div>
                </div>
                <div className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-bold text-slate-600">{msg.scheduledFor}</span>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-3xl border border-white text-sm text-slate-700 font-medium leading-relaxed relative">
                <div className="absolute top-4 right-4 text-slate-200"><MessageSquare className="w-4 h-4 fill-current"/></div>
                <p className="pl-6 pr-6">{msg.message}</p>
              </div>

              <div className="mt-4 flex justify-end">
                 {msg.status === 'QUEUED' ? (
                   <span className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full">
                     <Send className="w-3.5 h-3.5" /> في الطابور
                   </span>
                 ) : (
                   <span className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full">
                     <CheckCircle2 className="w-3.5 h-3.5" /> تم الإرسال
                   </span>
                 )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
