import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import {
  User, Lock, PenLine, AlertTriangle,
  CheckCircle, XCircle, Eye, EyeOff, LogOut, Trash2
} from 'lucide-react';

const inputCls =
  'w-full border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none ' +
  'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all ' +
  'bg-[#0f172a] text-white placeholder-slate-500';

const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5';

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-[#1e293b] rounded-2xl border border-white/10 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const Toast = ({ type, message, onClose }) => {
  if (!message) return null;
  const isOk = type === 'success';
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium
        ${isOk
          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          : 'bg-red-500/15 border-red-500/30 text-red-300'
        } animate-fade-in-down`}
    >
      {isOk ? <CheckCircle size={16} /> : <XCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">✕</button>
    </div>
  );
};

const TABS = [
  { id: 'profile',   label: 'Profile',   icon: User },
  { id: 'password',  label: 'Password',  icon: Lock },
  { id: 'signature', label: 'Signature', icon: PenLine, doctorOnly: true },
  { id: 'danger',    label: 'Danger Zone', icon: AlertTriangle },
];

const Settings = () => {
  const { user, refreshUser, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState({ type: '', message: '' });

  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [signature, setSignature] = useState(user?.signature || '');
  const [sigLoading, setSigLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const updatedUser = await authAPI.updateProfile(profile);
      setUser((u) => ({ ...u, ...updatedUser }));
      showToast('success', 'Profile updated successfully!');
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showToast('error', 'New passwords do not match.');
    }
    setPasswordLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', 'Password changed successfully!');
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignatureSave = async (e) => {
    e.preventDefault();
    setSigLoading(true);
    try {
      const updatedUser = await authAPI.updateProfile({ signature });
      setUser((u) => ({ ...u, ...updatedUser }));
      showToast('success', 'Signature updated!');
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to update signature.');
    } finally {
      setSigLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return showToast('error', 'Please type DELETE to confirm.');
    setDeleting(true);
    try {
      await authAPI.deleteAccount();
      await logout();
      navigate('/login');
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleTabs = TABS.filter((t) => !t.doctorOnly || user?.role === 'doctor');

  return (
    <div className="max-w-3xl mx-auto w-full pb-12">
      {}
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: '', message: '' })} />

      {}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-wide">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account preferences and security</p>
      </div>

      {}
      <SectionCard className="mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white shrink-0 border border-indigo-500/30 shadow-lg shadow-indigo-900/30">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-white truncate">{user?.name}</div>
            <div className="text-sm text-slate-400 truncate">{user?.email}</div>
            <div className={`mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border
              ${user?.role === 'doctor'
                ? 'bg-indigo-500/15 border-indigo-500/25 text-indigo-400'
                : 'bg-sky-500/15 border-sky-500/25 text-sky-400'}`}>
              {user?.role}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 cursor-pointer"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </SectionCard>

      {}
      <div className="flex gap-1 mb-6 bg-[#1e293b] border border-white/10 rounded-xl p-1">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer
                ${isActive
                  ? tab.id === 'danger'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {}
      {activeTab === 'profile' && (
        <SectionCard>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <User size={16} className="text-indigo-400" /> Profile Information
          </h2>
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input
                className={inputCls}
                placeholder="Your full name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input
                type="email"
                className={inputCls}
                placeholder="you@example.com"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input
                type="tel"
                className={inputCls}
                placeholder="10-digit phone number"
                value={profile.phoneNumber}
                onChange={(e) => setProfile((p) => ({ ...p, phoneNumber: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {profileLoading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <CheckCircle size={14} />}
                Save Changes
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {}
      {activeTab === 'password' && (
        <SectionCard>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <Lock size={16} className="text-indigo-400" /> Change Password
          </h2>
          <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
            {}
            <div>
              <label className={labelCls}>Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className={inputCls + ' pr-10'}
                  placeholder="Enter current password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {}
            <div>
              <label className={labelCls}>New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  className={inputCls + ' pr-10'}
                  placeholder="Min. 6 characters"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {}
              {passwords.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((lvl) => {
                      const len = passwords.newPassword.length;
                      const strength = len < 6 ? 1 : len < 9 ? 2 : len < 12 ? 3 : 4;
                      return (
                        <div
                          key={lvl}
                          className={`flex-1 rounded-full transition-colors ${
                            lvl <= strength
                              ? strength === 1 ? 'bg-red-500'
                              : strength === 2 ? 'bg-amber-500'
                              : strength === 3 ? 'bg-sky-500'
                              : 'bg-emerald-500'
                              : 'bg-white/10'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {passwords.newPassword.length < 6 ? 'Too short'
                      : passwords.newPassword.length < 9 ? 'Weak'
                      : passwords.newPassword.length < 12 ? 'Good'
                      : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            {}
            <div>
              <label className={labelCls}>Confirm New Password</label>
              <input
                type="password"
                className={`${inputCls} ${
                  passwords.confirmPassword && passwords.confirmPassword !== passwords.newPassword
                    ? 'border-red-500/50 focus:border-red-500'
                    : ''
                }`}
                placeholder="Repeat new password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
              />
              {passwords.confirmPassword && passwords.confirmPassword !== passwords.newPassword && (
                <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {passwordLoading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Lock size={14} />}
                Update Password
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {}
      {activeTab === 'signature' && user?.role === 'doctor' && (
        <SectionCard>
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <PenLine size={16} className="text-indigo-400" /> Digital Signature
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            This signature appears on all prescriptions you issue. It should match your official credentials.
          </p>
          <form onSubmit={handleSignatureSave} className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Signature Text</label>
              <input
                className={inputCls}
                placeholder={`Dr. ${user?.name || ''}, M.D.`}
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 mt-1.5">e.g. "Dr. Rajesh Kumar, MBBS, MD – Reg. No. 12345"</p>
            </div>

            {}
            <div className="bg-[#0f172a] border border-white/5 rounded-xl p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Preview on Prescription</p>
              <div className="border-t border-indigo-500/30 pt-3 flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-slate-400 mb-1">Authorized Signature</p>
                  <p className="text-white font-medium text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    {signature || `Dr. ${user?.name || ''}, M.D.`}
                  </p>
                </div>
                <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg font-bold border border-indigo-500/30">
                  ✚
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={sigLoading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {sigLoading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <PenLine size={14} />}
                Save Signature
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {}
      {activeTab === 'danger' && (
        <div className="flex flex-col gap-4">
          {}
          <SectionCard>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <LogOut size={15} className="text-amber-400" /> Sign Out
                </h3>
                <p className="text-xs text-slate-400">Logs you out of your current session. Your data is not affected.</p>
              </div>
              <button
                onClick={handleLogout}
                className="shrink-0 px-4 py-2 text-xs font-semibold text-amber-400 border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </SectionCard>

          {}
          <SectionCard className="border-red-500/20 bg-[#1e1a2b]">
            <h3 className="text-sm font-bold text-red-400 mb-1 flex items-center gap-2">
              <Trash2 size={15} /> Delete Account
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              This will permanently delete your account and all associated data. <span className="text-red-400 font-medium">This action cannot be undone.</span>
            </p>
            <div className="bg-[#0f172a] border border-red-500/10 rounded-xl p-4">
              <label className="block text-xs font-medium text-slate-400 mb-2">
                To confirm, type <span className="text-red-400 font-bold">DELETE</span> below:
              </label>
              <input
                className={`${inputCls} border-red-500/20 focus:border-red-500`}
                placeholder="Type DELETE here"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deleting}
                className="mt-3 w-full py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {deleting
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Trash2 size={14} />}
                Delete My Account Permanently
              </button>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default Settings;
