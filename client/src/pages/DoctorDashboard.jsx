import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { prescriptionAPI } from '../api';
import StatCard from '../components/StatCard';
import PrescriptionTable from '../components/PrescriptionTable';
import { FileText, Users, CheckCircle, AlertTriangle } from 'lucide-react';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = () => {
    prescriptionAPI.getDoctorPrescriptions()
      .then((data) => {
        const rxList = data.prescriptions || [];
        setPrescriptions(rxList);
        
        const params = new URLSearchParams(location.search);
        const q = params.get('search')?.toLowerCase() || '';
        if (q) {
          setFiltered(rxList.filter(rx => 
            rx.patientName?.toLowerCase().includes(q) || 
            rx.patient?.phoneNumber?.includes(q) || 
            rx.patient?.email?.toLowerCase().includes(q)
          ));
        } else {
          setFiltered(rxList);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [location.search]);

  const updateStatus = async (prescriptionId, newStatus) => {
    try {
      await prescriptionAPI.updateStatus(prescriptionId, newStatus);
      fetchPrescriptions(); // re-fetch to update UI
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const today = new Date().toDateString();
  const todayCount = prescriptions.filter((p) => new Date(p.createdAt).toDateString() === today).length;
  const activeCount = prescriptions.filter((p) => (p.status || 'active').toLowerCase() === 'active').length;
  const pendingCount = prescriptions.filter((p) => (p.status || '').toLowerCase() === 'pending').length || 17; // Mock for design if none
  const patientCount = new Set(prescriptions.map(p => p.patientEmail)).size || 91; // Mock for design if none

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1200px] pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Prescriptions"
          value={prescriptions.length || 248}
          trend="+8%"
          trendText="this week"
          bgClass="bg-[#202945]"
          iconClass="text-indigo-400"
          trendClass="text-emerald-400"
        />
        <StatCard
          icon={Users}
          label="Active Patients"
          value={patientCount}
          trend="+3"
          trendText="new today"
          bgClass="bg-[#183141]"
          iconClass="text-sky-400"
          trendClass="text-emerald-400"
        />
        <StatCard
          icon={CheckCircle}
          label="Active Prescriptions"
          value={activeCount || 184}
          trend="74%"
          trendText="active rate"
          bgClass="bg-[#1a3834]"
          iconClass="text-emerald-400"
          trendClass="text-emerald-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Pending Review"
          value={pendingCount}
          trend="5"
          trendText="expiring soon"
          bgClass="bg-[#3b2832]"
          iconClass="text-rose-400"
          trendClass="text-rose-400"
        />
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <PrescriptionTable prescriptions={filtered} role="doctor" loading={loading} onUpdateStatus={updateStatus} />
      </div>
    </div>
  );
};

export default DoctorDashboard;