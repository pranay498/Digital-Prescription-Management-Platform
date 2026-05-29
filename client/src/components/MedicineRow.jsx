const FREQUENCIES = ['Once daily', 'Twice daily', 'Thrice daily', 'Every 8 hrs', 'Every 6 hrs', 'As needed'];

const MedicineRow = ({ index, medicine, onChange, onRemove, canRemove }) => {
  const handle = (field) => (e) => onChange(index, field, e.target.value);

  const inputCls = "w-full border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-[#0f172a] text-white placeholder-slate-500";

  return (
    <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] gap-2.5 items-center py-3 border-b border-white/5 last:border-0">
      <input className={inputCls} placeholder="Medicine name" value={medicine.name} onChange={handle('name')} required />
      <input className={inputCls} placeholder="Dosage (e.g. 500mg)" value={medicine.dosage} onChange={handle('dosage')} required />
      <select className={inputCls} value={medicine.frequency} onChange={handle('frequency')}>
        {FREQUENCIES.map((f) => <option key={f} className="bg-[#0f172a] text-white">{f}</option>)}
      </select>
      <input className={inputCls} placeholder="Duration (e.g. 7 days)" value={medicine.duration} onChange={handle('duration')} required />
      {canRemove ? (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="w-8 h-8 border border-white/10 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center text-sm cursor-pointer"
          title="Remove Medicine"
        >✕</button>
      ) : (
        <div className="w-8" />
      )}
    </div>
  );
};

export default MedicineRow;