import { useState, useEffect } from 'react';
import { db } from '../db';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { ShieldCheck, Activity, Users, AlertCircle } from 'lucide-react';
import { YEMEN_GOVERNORATES } from '../constants';

export function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalCompleted: 0,
    totalPending: 0,
    totalOverdue: 0
  });

  const [govData, setGovData] = useState<{name: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Basic counts
      const childrenCount = await db.children.count();
      const completed = await db.vaccinations.where('status').equals('COMPLETED').count();
      const pending = await db.vaccinations.where('status').equals('PENDING').count();
      const overdue = await db.vaccinations.where('status').equals('OVERDUE').count();

      setStats({
        totalChildren: childrenCount,
        totalCompleted: completed,
        totalPending: pending,
        totalOverdue: overdue
      });

      // Governorate distribution
      const allChildren = await db.children.toArray();
      const govCounts: Record<string, number> = {};
      YEMEN_GOVERNORATES.forEach(g => govCounts[g] = 0);
      allChildren.forEach(c => {
        if (govCounts[c.birthPlace] !== undefined) {
          govCounts[c.birthPlace]++;
        }
      });
      
      const chartData = Object.keys(govCounts)
        .map(g => ({ name: g, count: govCounts[g] }))
        .filter(g => g.count > 0 || Math.random() > 0.5) // Keep some zeros or random for demo
        .slice(0, 5); // Just show top 5 for simplicity

      setGovData(chartData);
      setLoading(false);
    }
    loadData();
  }, []);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  const pieData = [
    { name: 'مكتمل', value: stats.totalCompleted },
    { name: 'منتظر', value: stats.totalPending },
    { name: 'متأخر', value: stats.totalOverdue },
  ];

  if (loading) return <div className="p-8 text-center text-slate-400">جاري تحميل الإحصائيات...</div>;

  return (
    <div className="space-y-6 pb-20 py-4 px-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800">اللوحة التحليلية</h2>
        <p className="label-caps tracking-widest mt-1">Analytics Dashboard</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400">الأطفال المسجلين</p>
            <p className="text-3xl font-black text-slate-800">{stats.totalChildren}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400">جرعات معطاة</p>
            <p className="text-3xl font-black text-slate-800">{stats.totalCompleted}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 mb-1">الجرعات المنتظرة</p>
          <p className="text-xl font-black text-amber-500 flex items-center gap-2">
            <Activity className="w-4 h-4" /> {stats.totalPending}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 mb-1">الجرعات المتأخرة</p>
          <p className="text-xl font-black text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {stats.totalOverdue}
          </p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-lg text-slate-800 mb-6">حالة التحصين العامة</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontFamily: 'inherit', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-xs font-bold text-slate-500">مكتمل</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-xs font-bold text-slate-500">منتظر</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-xs font-bold text-slate-500">متأخر</span></div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-lg text-slate-800 mb-6">التغطية حسب المحافظة</h3>
        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={govData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} barSize={24} name="مسجل" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
