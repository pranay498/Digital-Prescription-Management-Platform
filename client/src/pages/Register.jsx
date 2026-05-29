import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'patient', phoneNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      const { name, email, password, role, phoneNumber } = form;
      const user = await register({ name, email, password, role, phoneNumber });
      navigate(user.role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white text-gray-800 placeholder-gray-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-9">
          <div className="w-13 h-13 bg-blue-600 rounded-2xl inline-flex items-center justify-center text-2xl text-white mb-3">✚</div>
          <h1 className="text-2xl text-[#0B2447] font-light" style={{ fontFamily: 'DM Serif Display, serif' }}>RxManager</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-lg font-semibold text-[#0B2447] mb-6">Create your account</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Full name</label>
              <input className={inputCls} placeholder="Dr. Ramesh Gupta" value={form.name} onChange={handle('name')} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
              <input type="email" className={inputCls} placeholder="you@example.com" value={form.email} onChange={handle('email')} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input type="tel" className={inputCls} placeholder="9876543210" value={form.phoneNumber} onChange={handle('phoneNumber')} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Role</label>
              <select className={inputCls} value={form.role} onChange={handle('role')}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
                <input type="password" className={inputCls} placeholder="••••••••" value={form.password} onChange={handle('password')} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm</label>
                <input type="password" className={inputCls} placeholder="••••••••" value={form.confirmPassword} onChange={handle('confirmPassword')} required />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-1 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;