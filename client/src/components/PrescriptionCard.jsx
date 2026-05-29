import { useNavigate } from 'react-router-dom';
import { prescriptionAPI } from '../api';

const statusCls = {
  active:  'bg-emerald-50 text-emerald-700',
  expired: 'bg-gray-100 text-gray-500',
  draft:   'bg-amber-50 text-amber-700',
};

const PrescriptionCard = ({ prescription }) => {
  const navigate = useNavigate();
  const { _id, doctorName, diagnosis, medicines, status, createdAt } = prescription;

  const date = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const handleDownload = async (e) => {
    e.stopPropagation();
    try { await prescriptionAPI.downloadPDF(_id); }
    catch { alert('PDF download failed'); }
  };

  return (
    <div
      onClick={() => navigate(`/patient/prescriptions/${_id}`)}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Dr. {doctorName}</div>
          <div className="font-semibold text-[#0B2447] text-sm">{diagnosis}</div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusCls[status] || statusCls.expired}`}>
          {status}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {medicines?.slice(0, 3).map((m, i) => (
          <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
            {m.name}
          </span>
        ))}
        {medicines?.length > 3 && (
          <span className="text-xs text-gray-400">+{medicines.length - 3} more</span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-400">{date}</span>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/patient/prescriptions/${_id}`); }}
            className="text-xs px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >View</button>
          <button
            onClick={handleDownload}
            className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >↓ PDF</button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCard;