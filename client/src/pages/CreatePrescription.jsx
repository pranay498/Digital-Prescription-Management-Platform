import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicineRow from '../components/MedicineRow';
import { prescriptionAPI } from '../api';

const emptyMedicine = () => ({ name: '', dosage: '', frequency: 'Once daily', duration: '' });

const CreatePrescription = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ patientPhoneNumber: '', patientName: '', patientAge: '', diagnosis: '', notes: '', medicines: [emptyMedicine()] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleMedicine = (index, field, value) => {
    const medicines = [...form.medicines];
    medicines[index] = { ...medicines[index], [field]: value };
    setForm({ ...form, medicines });
  };

  const submit = async (isDraft) => {
    setError('');
    setLoading(true);
    try {
      await prescriptionAPI.create({ ...form, status: isDraft ? 'draft' : 'active' });
      navigate('/doctor');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-[#0f172a] text-white placeholder-slate-500";
  const labelCls = "block text-xs font-medium text-slate-400 mb-1.5";

  return (
    <div className="max-w-3xl mx-auto w-full pb-10">
      <div className="flex items-center gap-3 mb-7">
        <button 
          onClick={() => navigate('/doctor')} 
          className="text-sm px-3 py-1.5 bg-white/10 text-slate-300 hover:bg-white/15 rounded-lg border border-white/10 transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-white">New Prescription</h1>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">{error}</div>}

      <div className="flex flex-col gap-5">}
        <div className="bg-[#1e293b] rounded-xl border border-white/10 shadow-sm p-5">
          <h3 className="text-sm font-medium text-white mb-4">Patient Information</h3>
          <div className="grid grid-cols-[1.2fr_1fr_90px] gap-3.5">
            <div>
              <label className={labelCls}>Patient Phone Number</label>
              <input className={inputCls} placeholder="e.g. 9876543210" value={form.patientPhoneNumber} onChange={handleField('patientPhoneNumber')} required />
            </div>
            <div>
              <label className={labelCls}>Patient Name</label>
              <input className={inputCls} placeholder="Patient full name" value={form.patientName} onChange={handleField('patientName')} required />
            </div>
            <div>
              <label className={labelCls}>Age</label>
              <input type="number" className={inputCls} placeholder="35" value={form.patientAge} onChange={handleField('patientAge')} required />
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-white/10 shadow-sm p-5">
          <h3 className="text-sm font-medium text-white mb-4">Diagnosis</h3>
          <textarea rows={3} className={inputCls} placeholder="Describe the diagnosis..." value={form.diagnosis} onChange={handleField('diagnosis')} required />
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">Medicines</h3>
            <button
              type="button"
              onClick={() => setForm({ ...form, medicines: [...form.medicines, emptyMedicine()] })}
              className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              ✚ Add Medicine
            </button>
          </div>
          <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] gap-2.5 py-2 border-b border-white/10 mb-1">
            {['Medicine', 'Dosage', 'Frequency', 'Duration', ''].map((h, i) => (
              <span key={i} className="text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</span>
            ))}
          </div>
          {form.medicines.map((m, i) => (
            <MedicineRow
              key={i}
              index={i}
              medicine={m}
              onChange={handleMedicine}
              onRemove={(idx) => setForm({ ...form, medicines: form.medicines.filter((_, j) => j !== idx) })}
              canRemove={form.medicines.length > 1}
            />
          ))}
        </div>


        <div className="bg-[#1e293b] rounded-xl border border-white/10 shadow-sm p-5">
          <h3 className="text-sm font-medium text-white mb-4">
            Additional Notes <span className="font-normal text-slate-400">(optional)</span>
          </h3>
          <textarea rows={3} className={inputCls} placeholder="Any special instructions or notes..." value={form.notes} onChange={handleField('notes')} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-6">
          <button
            onClick={() => submit(true)}
            disabled={loading}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            onClick={() => submit(false)}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Issue Prescription'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePrescription;