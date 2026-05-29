import { useEffect, useState } from 'react';
import { prescriptionAPI } from '../api';
import { Search, Pill, Sparkles } from 'lucide-react';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionAPI.getDoctorMedicines()
      .then((data) => {
        setMedicines(data.medicines || []);
        setFiltered(data.medicines || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      medicines.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.dosages?.some(d => d.toLowerCase().includes(q))
      )
    );
  }, [search, medicines]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Medicines Database</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Analytics on your most prescribed medications and dosages</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Search by medicine name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1e2336] text-white text-sm rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder-[var(--color-text-secondary)] border border-white/5"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 min-h-[300px]">
          <div className="w-8 h-8 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--color-cards)] rounded-[24px] border border-[var(--color-border)] shadow-xl p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
            <Pill size={24} className="opacity-80" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No medicines found</h3>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
            {search ? "No medications match your search filter." : "You haven't prescribed any medicines yet."}
          </p>
        </div>
      ) : (
        <div className="bg-[var(--color-cards)] rounded-[24px] overflow-hidden shadow-xl border border-[var(--color-border)]">
          <div className="px-7 py-6 border-b border-[rgba(255,255,255,0.03)] flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <h2 className="text-[17px] font-semibold text-white tracking-wide">Prescribed Medications</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
                  <th className="p-4 pl-7 pb-3">Medicine Name</th>
                  <th className="p-4 pb-3">Times Prescribed</th>
                  <th className="p-4 pb-3">Common Dosages</th>
                  <th className="p-4 pr-7 pb-3">Standard Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y-0 md:divide-y divide-[rgba(255,255,255,0.03)] text-sm flex flex-col md:table-row-group gap-4 md:gap-0 p-4 md:p-0">
                {filtered.map((med, index) => {
                  const isTopThree = index < 3 && !search;
                  return (
                    <tr 
                      key={med.name} 
                      className="flex flex-col md:table-row p-4 md:p-0 bg-[#1e2336]/20 md:bg-transparent rounded-2xl md:rounded-none border border-white/5 md:border-none hover:bg-white/[0.015] transition-colors gap-3 md:gap-0"
                    >
                      <td className="p-0 md:p-4 md:pl-7 flex items-center justify-between md:justify-start gap-4 md:table-cell">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] md:hidden">Medicine</span>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                            isTopThree 
                              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                              : 'bg-white/5 border-white/5 text-[var(--color-text-secondary)]'
                          }`}>
                            <Pill size={16} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-[13px]">{med.name}</span>
                            {isTopThree && (
                              <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
                                Top {index + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-0 md:p-4 flex justify-between items-center md:table-cell border-t border-white/5 md:border-none pt-3 md:pt-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] md:hidden">Times Prescribed</span>
                        <span className="font-bold text-white text-[13px] md:bg-white/5 md:px-2.5 md:py-1 md:rounded-lg">
                          {med.count} {med.count === 1 ? 'time' : 'times'}
                        </span>
                      </td>
                      <td className="p-0 md:p-4 flex justify-between items-center md:table-cell">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] md:hidden">Common Dosages</span>
                        <div className="flex gap-1.5 flex-wrap justify-end md:justify-start">
                          {med.dosages.map((d) => (
                            <span key={d} className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300">
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-0 md:p-4 md:pr-7 flex justify-between items-center md:table-cell border-t border-white/5 md:border-none pt-3 md:pt-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] md:hidden">Standard Frequency</span>
                        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                          {med.frequency}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;
