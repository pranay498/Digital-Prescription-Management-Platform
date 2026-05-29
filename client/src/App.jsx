import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDashboard from './pages/DoctorDashboard';
import CreatePrescription from './pages/CreatePrescription';
import EditPrescription from './pages/EditPrescription';
import PatientDashboard from './pages/PatientDashboard';
import PrescriptionDetail from './pages/PrescriptionDetail';
import Patients from './pages/Patients';
import Medicines from './pages/Medicines';
import Settings from './pages/Settings';
import ChatAssistant from './pages/ChatAssistant';
import DashboardLayout from './components/DashboardLayout';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-page)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[rgba(255,255,255,0.1)] border-t-[var(--color-accent)] rounded-full animate-spin"></div>
        <span className="text-[var(--color-text-secondary)] text-sm">Loading RxManager...</span>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} replace />;
};

const PlaceholderPage = ({ title }) => (
  <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
    </div>
    <div className="bg-[var(--color-cards)] rounded-[24px] p-12 border border-[var(--color-border)] shadow-xl flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20 animate-pulse">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title} Section</h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-md leading-relaxed">
        This view is currently under construction. Check back soon for updates to your RxManager dashboard.
      </p>
    </div>
  </div>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          {}
          <Route path="/doctor" element={
            <ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>
          } />
          <Route path="/doctor/prescriptions" element={
            <Navigate to="/doctor" replace />
          } />
          <Route path="/doctor/prescriptions/new" element={
            <ProtectedRoute role="doctor"><CreatePrescription /></ProtectedRoute>
          } />
          <Route path="/doctor/prescriptions/:id" element={
            <ProtectedRoute role="doctor"><PrescriptionDetail /></ProtectedRoute>
          } />
          <Route path="/doctor/prescriptions/:id/edit" element={
            <ProtectedRoute role="doctor"><EditPrescription /></ProtectedRoute>
          } />
          <Route path="/doctor/patients" element={
            <ProtectedRoute role="doctor"><Patients /></ProtectedRoute>
          } />
          <Route path="/doctor/medicines" element={
            <ProtectedRoute role="doctor"><Medicines /></ProtectedRoute>
          } />

          {}
          <Route path="/patient" element={
            <ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>
          } />
          <Route path="/patient/prescriptions" element={
            <Navigate to="/patient" replace />
          } />
          <Route path="/patient/prescriptions/:id" element={
            <ProtectedRoute role="patient"><PrescriptionDetail /></ProtectedRoute>
          } />

          {}
          <Route path="/appointments" element={<PlaceholderPage title="Appointments" />} />
          <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
          <Route path="/assistant" element={<ChatAssistant />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;