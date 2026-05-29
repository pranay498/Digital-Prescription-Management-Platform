import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MedicineRow from '../components/MedicineRow';
import { prescriptionAPI } from '../api';

const emptyMedicine = () => ({ name: '', dosage: '', frequency: 'Once daily', duration: '' });

const STATUS_OPTIONS = ['active', 'draft', 'expired'];

const EditPrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    prescriptionAPI.getById(id)
      .then(({ prescription }) => {
        setForm({
          patientName: prescription.patientName || '',
          patientAge:  prescription.patientAge  || '',
          diagnosis:   prescription.diagnosis   || '',
          notes:       prescription.notes       || '',
          status:      prescription.status      || 'active',
          medicines:   prescription.medicines?.length
            ? prescription.medicines.map(({ name, dosage, frequency, duration }) => ({ name, dosage, frequency, duration }))
            : [emptyMedicine()],
        });
      })
      .catch(() => setError('Failed to load prescription.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleMedicine = (index, field, value) => {
    setForm((f) => {
      const medicines = [...f.medicines];
      medicines[index] = { ...medicines[index], [field]: value };
      return { ...f, medicines };
    });
  };

  const addMedicine = () =>
    setForm((f) => ({ ...f, medicines: [...f.medicines, emptyMedicine()] }));

  const removeMedicine = (idx) =>
    setForm((f) => ({ ...f, medicines: f.medicines.filter((_, j) => j !== idx) }));

  const save = async () => {
    setError('');
    setSaving(true);
    try {
      await prescriptionAPI.update(id, form);
      setSuccess(true);
      setTimeout(() => navigate(`/doctor/prescriptions/${id}`), 900);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-[#0f172a] text-white placeholder-slate-500';
  const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5';

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="w-9 h-9 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-24 text-slate-400 text-sm">
        {error || 'Prescription not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full pb-10">
      {}
      <div className="flex items-center gap-3 mb-7">
        <button
          onClick={() => navigate(`/doctor/prescriptions/${id}`)}
          className="text-sm px-3 py-1.5 bg-white/10 text-slate-300 hover:bg-white/15 rounded-lg border border-white/10 transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-white">Edit Prescription</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg px-4 py-3 mb-5 flex items-center gap-2">
          <span>✓</span> Prescription updated successfully! Redirecting…
        </div>
      )}

      <div className="flex flex-col gap-5">

        {}
        <div className="bg-[#1e293b] rounded-xl border border-white/10 shadow-sm p-5">
          <h3 className="text-sm font-medium text-white mb-4">Patient Information</h3>
          <div className="grid grid-cols-[1fr_90px] gap-3.5">
            <div>
              <label className={labelCls}>Patient Name</label>
              <input
                className={inputCls}
                placeholder="Patient full name"
                value={form.patientName}
                onChange={handleField('patientName')}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Age</label>
              <input
                type="number"
                className={inputCls}
                placeholder="35"
                value={form.patientAge}
                onChange={handleField('patientAge')}
                required
              />
            </div>
          </div>
        </div>

        {}
        <div className="bg-[#1e293b] rounded-xl border border-white/10 shadow-sm p-5">
          <h3 className="text-sm font-medium text-white mb-4">Status</h3>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((f) => ({ ...f, status: s }))}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all cursor-pointer ${
                  form.status === s
                    ? s === 'active'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : s === 'expired'
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="bg-[#1e293b] rounded-xl border border-white/10 shadow-sm p-5">
          <h3 className="text-sm font-medium text-white mb-4">Diagnosis</h3>
          <textarea
            rows={3}
            className={inputCls}
            placeholder="Describe the diagnosis..."
            value={form.diagnosis}
            onChange={handleField('diagnosis')}
            required
          />
        </div>

        {}
        <div className="bg-[#1e293b] rounded-xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">Medicines</h3>
            <button
              type="button"
              onClick={addMedicine}
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
              onRemove={removeMedicine}
              canRemove={form.medicines.length > 1}
            />
          ))}
        </div>

        {}
        <div className="bg-[#1e293b] rounded-xl border border-white/10 shadow-sm p-5">
          <h3 className="text-sm font-medium text-white mb-4">
            Additional Notes <span className="font-normal text-slate-400">(optional)</span>
          </h3>
          <textarea
            rows={3}
            className={inputCls}
            placeholder="Any special instructions or notes..."
            value={form.notes}
            onChange={handleField('notes')}
          />
        </div>

        {}
        <div className="flex gap-3 justify-end pb-6">
          <button
            type="button"
            onClick={() => navigate(`/doctor/prescriptions/${id}`)}
            disabled={saving}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || success}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : '✓ Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPrescription;
