import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { prescriptionAPI } from '../api';
import { Search, User, Calendar, Pill, ArrowRight } from 'lucide-react';

const getAvatarColor = (name) => {
  const colors = [
    'bg-[#223055] text-indigo-300 border-indigo-500/20',
    'bg-[#183949] text-sky-300 border-sky-500/20',
    'bg-[#3b2d1c] text-amber-300 border-amber-500/20',
    'bg-[#3b2126] text-rose-300 border-rose-500/20',
    'bg-[#1d3b2e] text-emerald-300 border-emerald-500/20'
  ];
  const charCode = name?.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionAPI.getDoctorPatients()
      .then((data) => {
        setPatients(data.patients || []);
        setFiltered(data.patients || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      patients.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.phoneNumber?.includes(q)
      )
    );
  }, [search, patients]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Patients</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage and view your prescribing history per patient</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Search by name or phone..."
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
            <User size={24} className="opacity-80" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No patients found</h3>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
            {search ? "No patients match your search filter." : "You haven't issued any prescriptions to patients yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((patient) => {
            const initials = patient.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PT';
            return (
              <div 
                key={patient._id} 
                className="bg-[var(--color-cards)] border border-[var(--color-border)] rounded-[24px] p-6 flex flex-col justify-between hover:border-white/10 transition-colors shadow-lg group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-[0.01] rounded-full blur-2xl group-hover:opacity-[0.02] transition-opacity"></div>
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${getAvatarColor(patient.name)}`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-[15px] truncate">{patient.name}</h3>
                      <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate">{patient.email}</p>
                      <p className="text-[11px] text-indigo-400 font-medium mt-1">{patient.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 py-4 border-y border-white/5 mb-5 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5"><Calendar size={13} /> Last Visit</span>
                      <span className="font-medium text-white/90">{new Date(patient.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5"><Pill size={13} /> Last Medicine</span>
                      <span className="font-semibold text-indigo-300 max-w-[150px] truncate" title={patient.lastMedicine}>{patient.lastMedicine}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {patient.prescriptionCount} {patient.prescriptionCount === 1 ? 'Prescription' : 'Prescriptions'}
                  </span>
                  <button
                    onClick={() => navigate(`/doctor?search=${encodeURIComponent(patient.phoneNumber)}`)}
                    className="text-xs font-semibold text-indigo-400 hover:text-white flex items-center gap-1 group-hover:gap-1.5 transition-all cursor-pointer"
                  >
                    View Rx <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Patients;
