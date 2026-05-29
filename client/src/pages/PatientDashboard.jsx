import { useEffect, useState } from 'react';
import { prescriptionAPI } from '../api';
import PrescriptionTable from '../components/PrescriptionTable';

const PatientDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    prescriptionAPI.getPatientPrescriptions()
      .then((data) => { setPrescriptions(data.prescriptions || []); setFiltered(data.prescriptions || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(prescriptions.filter((p) => {
      const matchSearch = p.diagnosis?.toLowerCase().includes(q) || p.doctorName?.toLowerCase().includes(q) || p.medicines?.some((m) => m.name?.toLowerCase().includes(q));
      const matchStatus = statusFilter === 'all' || (p.status || 'active').toLowerCase() === statusFilter;
      return matchSearch && matchStatus;
    }));
  }, [search, statusFilter, prescriptions]);

  const inputCls = "bg-[var(--color-cards)] text-[var(--color-text-primary)] text-sm rounded-lg px-4 py-2 border border-[rgba(255,255,255,0.06)] focus:outline-none focus:border-[var(--color-accent)] transition-colors";

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">My Prescriptions</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            className={`${inputCls} w-full sm:w-72`}
            placeholder="Search medicine, doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={`${inputCls} w-full sm:w-40 appearance-none`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[rgba(255,255,255,0.1)] border-t-[var(--color-accent)] rounded-full animate-spin"></div>
        </div>
      ) : (
        <PrescriptionTable prescriptions={filtered} role="patient" />
      )}
    </div>
  );
};

export default PatientDashboard;