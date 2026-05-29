import { Link, useNavigate } from 'react-router-dom';
import { Eye, Download, ArrowRight, Activity } from 'lucide-react';
import { prescriptionAPI } from '../api';

const StatusBadge = ({ status }) => {
  const s = (status || 'Active').toLowerCase();
  if (s === 'active') return <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Active</span>;
  if (s === 'pending') return <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-amber-500/30 text-amber-400 bg-amber-500/10">Pending</span>;
  if (s === 'expired') return <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-red-500/30 text-red-400 bg-red-500/10">Expired</span>;
  return <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-white/20 text-white/70 bg-white/5">{s}</span>;
};

const getAvatarColor = (name) => {
  const colors = ['bg-[#223055] text-indigo-300', 'bg-[#183949] text-sky-300', 'bg-[#3b2d1c] text-amber-300', 'bg-[#3b2126] text-rose-300', 'bg-[#1d3b2e] text-emerald-300'];
  const charCode = name?.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

const PrescriptionTable = ({ prescriptions, role, loading, onUpdateStatus }) => {
  const navigate = useNavigate();

  const handleDownload = async (e, id) => {
    e.preventDefault();
    try { await prescriptionAPI.downloadPDF(id); }
    catch { alert('PDF download failed'); }
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-cards)] rounded-[24px] p-8 flex justify-center items-center h-64 border border-[var(--color-border)] shadow-xl">
        <div className="w-8 h-8 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="bg-[var(--color-cards)] rounded-[24px] overflow-hidden shadow-xl border border-[var(--color-border)]">
        <div className="px-7 py-6 flex items-center justify-between border-b border-[rgba(255,255,255,0.03)]">
          <h2 className="text-[17px] font-semibold text-white tracking-wide">Recent Prescriptions</h2>
          <Link to={`/${role}/prescriptions`} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
            <Activity size={24} className="opacity-80 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No prescriptions yet</h3>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
            There are no prescriptions available in this view at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-cards)] rounded-[24px] overflow-hidden shadow-xl border border-[var(--color-border)]">
      <div className="px-7 py-6 flex items-center justify-between border-b border-[rgba(255,255,255,0.03)]">
        <h2 className="text-[17px] font-semibold text-white tracking-wide">Recent Prescriptions</h2>
        <Link to={`/${role}/prescriptions`} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors">
          View all <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="hidden md:table-header-group">
            <tr className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
              <th className="p-4 pl-7 pb-3">{role === 'doctor' ? 'Patient' : 'Doctor'}</th>
              <th className="p-4 pb-3">Medicine</th>
              <th className="p-4 pb-3">Date</th>
              <th className="p-4 pb-3">Status</th>
              <th className="p-4 pr-7 pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.03)] text-sm flex flex-col md:table-row-group gap-4 md:gap-0 p-4 md:p-0">
            {prescriptions.map((rx) => {
              const name = role === 'doctor' ? rx.patientName : rx.doctorName;
              const initials = name?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() || 'UN';
              const med = rx.medicines?.[0] || { name: 'N/A', dosage: '' };
              const dateObj = new Date(rx.createdAt);
              const day = dateObj.getDate();
              const monthYear = dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
              
              return (
                <tr 
                  key={rx._id} 
                  onClick={() => navigate(`/${role}/prescriptions/${rx._id}`)}
                  className="flex flex-col md:table-row p-4 md:p-0 bg-[#1e2336]/20 md:bg-transparent rounded-2xl md:rounded-none border border-white/5 md:border-none hover:bg-white/[0.03] transition-colors cursor-pointer group gap-3.5 md:gap-0"
                >
                  <td className="p-0 md:p-4 md:pl-7 flex items-center gap-4 md:table-cell">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColor(name)}`}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-[13px]">{name}</div>
                        <div className="text-[11px] text-[var(--color-text-secondary)] font-medium tracking-wide mt-0.5">#{rx._id.substring(0, 8).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-0 md:p-4 flex justify-between items-center md:table-cell border-t border-white/5 md:border-none pt-3.5 md:pt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] md:hidden">Medicine</span>
                    <div className="text-right md:text-left">
                      <div className="text-[13px] font-medium text-white">{med.name}</div>
                      <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{med.dosage || 'Unknown dosage'}</div>
                    </div>
                  </td>
                  <td className="p-0 md:p-4 flex justify-between items-center md:table-cell">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] md:hidden">Date</span>
                    <div className="text-right md:text-left text-[12px] font-medium text-[var(--color-text-secondary)] leading-tight">
                      <span className="text-white/80">{day} {monthYear.split(' ')[0]}</span>{' '}
                      <span className="text-[11px]">{monthYear.split(' ')[1]}</span>
                    </div>
                  </td>
                  <td className="p-0 md:p-4 flex justify-between items-center md:table-cell" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] md:hidden">Status</span>
                    {role === 'doctor' && onUpdateStatus ? (
                      <select
                        value={rx.status?.toLowerCase() || 'active'}
                        onChange={(e) => onUpdateStatus(rx._id, e.target.value)}
                        style={{ outline: 'none', cursor: 'pointer' }}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium border-0 cursor-pointer transition-colors
                          ${(rx.status?.toLowerCase() || 'active') === 'active'  
                            ? 'bg-emerald-500/15 text-emerald-400' : ''}
                          ${(rx.status?.toLowerCase() || 'active') === 'pending' 
                            ? 'bg-amber-500/15 text-amber-400' : ''}
                          ${(rx.status?.toLowerCase() || 'active') === 'expired' 
                            ? 'bg-red-500/15 text-red-400' : ''}
                        `}
                      >
                        <option value="active" className="bg-[#0f172a] text-white">Active</option>
                        <option value="pending" className="bg-[#0f172a] text-white">Pending</option>
                        <option value="expired" className="bg-[#0f172a] text-white">Expired</option>
                      </select>
                    ) : (
                      <StatusBadge status={rx.status} />
                    )}
                  </td>
                  <td className="p-0 md:p-4 md:pr-7 flex justify-between items-center md:justify-end md:table-cell text-right border-t border-white/5 md:border-none pt-3.5 md:pt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] md:hidden">Actions</span>
                    <div className="flex items-center gap-1.5 opacity-100 md:opacity-50 md:group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/${role}/prescriptions/${rx._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg bg-white/5 md:bg-transparent hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-white transition-colors"
                        title="View Details"
                      >
                        <Eye size={15} strokeWidth={2.5} />
                      </Link>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(e, rx._id); }}
                        className="p-2 rounded-lg bg-white/5 md:bg-transparent hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-white transition-colors"
                        title="Download PDF"
                      >
                        <Download size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrescriptionTable;
