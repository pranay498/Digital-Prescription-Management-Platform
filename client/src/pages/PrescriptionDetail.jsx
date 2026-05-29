import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { prescriptionAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const statusCls = {
  active:  'border border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  expired: 'border border-red-500/30 text-red-400 bg-red-500/10',
  draft:   'border border-amber-500/30 text-amber-400 bg-amber-500/10',
};

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rx, setRx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    prescriptionAPI.getById(id)
      .then((data) => setRx(data.prescription))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handlePDF = async () => {
    setDownloading(true);
    try { await prescriptionAPI.downloadPDF(id); }
    catch { alert('PDF download failed'); }
    finally { setDownloading(false); }
  };

  const backPath = user?.role === 'doctor' ? '/doctor' : '/patient';

  return (
    <div className="max-w-3xl mx-auto w-full pb-10">
      <div className="flex items-center gap-3 mb-7">
        <button 
          onClick={() => navigate(backPath)} 
          className="text-sm px-3 py-1.5 bg-white/10 text-slate-300 hover:bg-white/15 rounded-lg border border-white/10 transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-white">Prescription Details</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="w-8 h-8 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : !rx ? (
        <div className="text-center py-20 text-slate-400 text-sm">Prescription not found</div>
      ) : (
        <div className="bg-[#1e293b] rounded-2xl border border-white/10 shadow-sm p-9">
          <div className="flex justify-between items-start pb-5 border-b-2 border-indigo-500 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-xl text-white">✚</div>
              <div>
                <div className="text-xl text-white font-bold tracking-wide" style={{ fontFamily: 'DM Serif Display, serif' }}>RxManager</div>
                <div className="text-xs text-slate-400 tracking-wider uppercase">Digital Prescription</div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded inline-block mb-1.5 ${statusCls[rx.status?.toLowerCase()] || statusCls.expired}`}>
                {rx.status}
              </span>
              <div className="text-xs text-slate-400 mt-1">
                {new Date(rx.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#0f172a] border border-white/5 rounded-xl p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Prescribing Doctor</div>
              <div className="font-semibold text-base text-white">Dr. {rx.doctorName}</div>
            </div>
            <div className="bg-[#0f172a] border border-white/5 rounded-xl p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Patient</div>
              <div className="font-semibold text-base text-white">{rx.patientName}</div>
              {rx.patientAge && <div className="text-sm text-slate-400 mt-0.5">Age: {rx.patientAge}</div>}
            </div>
          </div>

          {}
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Diagnosis</div>
            <div className="bg-[#0f172a] border border-white/5 rounded-lg px-4 py-3 text-white font-medium text-sm">{rx.diagnosis}</div>
          </div>

          {}
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Prescribed Medicines</div>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0f172a]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#141b2c] border-b border-white/10">
                    {['#', 'Medicine', 'Dosage', 'Frequency', 'Duration'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rx.medicines?.map((m, i) => (
                    <tr key={i} className="hover:bg-white/[0.015] transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-500 font-medium">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-white">{m.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{m.dosage}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{m.frequency}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{m.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {}
          {rx.notes && (
            <div className="mb-7">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Doctor's Notes</div>
              <div className="bg-[#0f172a] border border-white/5 rounded-lg px-4 py-3 text-sm text-slate-300 leading-relaxed">{rx.notes}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
            {user?.role === 'doctor' && (
              <button
                onClick={() => navigate(`/doctor/prescriptions/${id}/edit`)}
                className="bg-white/10 hover:bg-white/15 border border-white/10 text-slate-300 text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                ✎ Edit
              </button>
            )}
            <button
              onClick={handlePDF}
              disabled={downloading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {downloading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '↓'}
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionDetail;