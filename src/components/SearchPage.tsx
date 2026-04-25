import { useState, useEffect } from 'react';
import { Search, MapPin, Baby, ChevronLeft, Filter } from 'lucide-react';
import { db, type Child } from '../db';
import { YEMEN_GOVERNORATES } from '../constants';

export function SearchPage({ onChildClick }: { onChildClick: (uuid: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [results, setResults] = useState<Child[]>([]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedGovernorate]);

  const handleSearch = async () => {
    let collection = db.children.toCollection();

    if (searchTerm) {
      // Basic fuzzy name search
      const lowerSearch = searchTerm.toLowerCase();
      const all = await db.children.toArray();
      const filtered = all.filter(c => 
        c.fullName.toLowerCase().includes(lowerSearch) || 
        c.motherName.toLowerCase().includes(lowerSearch)
      );
      setResults(selectedGovernorate ? filtered.filter(c => c.birthPlace === selectedGovernorate) : filtered);
      return;
    }

    if (selectedGovernorate) {
      const filtered = await db.children.where('birthPlace').equals(selectedGovernorate).toArray();
      setResults(filtered);
    } else {
      const all = await db.children.orderBy('createdAt').reverse().limit(10).toArray();
      setResults(all);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="sticky top-20 z-10 bg-slate-50/90 backdrop-blur-md pb-4 pt-2">
        <div className="relative mb-4">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <input 
            type="text" 
            placeholder="ابحث باسم الطفل أو الأم..."
            className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-[2rem] shadow-sm shadow-slate-200/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
          <button 
            onClick={() => setSelectedGovernorate('')}
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${!selectedGovernorate ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-400 border border-slate-200'}`}
          >
            الكل
          </button>
          {YEMEN_GOVERNORATES.slice(0, 8).map(g => (
            <button 
              key={g} 
              onClick={() => setSelectedGovernorate(g)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${selectedGovernorate === g ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-400 border border-slate-200'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="text-center py-24 text-slate-300 bg-white rounded-[3rem] border border-slate-100 border-dashed">
            <Search className="w-16 h-16 mx-auto opacity-10 mb-2" />
            <p className="font-bold uppercase tracking-widest text-[10px]">لم يتم العثور على نتائج</p>
          </div>
        ) : (
          results.map(child => (
            <div 
              key={child.uuid} 
              onClick={() => onChildClick(child.uuid)}
              className="bg-white rounded-[2.5rem] p-4 flex items-center gap-5 active:scale-[0.98] transition-all cursor-pointer border border-slate-50 shadow-sm hover:border-emerald-100"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border-2 border-white shadow-inner flex items-center justify-center shrink-0">
                {child.photoBase64 ? (
                  <img src={child.photoBase64} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Baby className="w-8 h-8 text-slate-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg text-slate-800 truncate">{child.fullName}</h4>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-tighter">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {child.birthPlace}
                  </span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                  <span className="text-xs text-slate-400 font-bold">{child.birthDate}</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                <ChevronLeft className="w-5 h-5" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
