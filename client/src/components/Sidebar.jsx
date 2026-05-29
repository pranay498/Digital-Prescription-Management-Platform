import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, FileText, Users, Pill, Calendar, BarChart2, Settings, X, MessageSquare } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const mainNav = isDoctor ? [
    { name: 'Dashboard', path: '/doctor', icon: Home },
    { name: 'Patients', path: '/doctor/patients', icon: Users },
    { name: 'Medicines', path: '/doctor/medicines', icon: Pill },
    { name: 'Assistant', path: '/assistant', icon: MessageSquare },
  ] : [
    { name: 'Dashboard', path: '/patient', icon: Home },
    { name: 'Assistant', path: '/assistant', icon: MessageSquare },
  ];

  const accountNav = [
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`w-[260px] bg-[var(--color-sidebar)] flex flex-col h-screen fixed left-0 top-0 text-[var(--color-text-secondary)] z-50 shrink-0 shadow-lg border-r border-[var(--color-border)] transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">RxManager</h1>
              <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">Medical Platform</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg bg-white/5 text-[var(--color-text-secondary)] hover:text-white md:hidden transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-8">
          <div>
            <div className="px-3 text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--color-text-secondary)] mb-3">Main</div>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/doctor' || item.path === '/patient'}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-[#29304e] text-white font-medium'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="opacity-80" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--color-text-secondary)] mb-3">Account</div>
            <nav className="space-y-1">
              {accountNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-[#29304e] text-white font-medium'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} className="opacity-80" />
                    <span className="text-sm">{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 mt-auto">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--color-page)] border border-[var(--color-border)] hover:border-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'DR'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[130px]">{user?.name || 'Dr. Pranay'}</span>
                <span className="text-[11px] text-[var(--color-text-secondary)] capitalize">{user?.role === 'doctor' ? 'Physician' : user?.role || 'Physician'}</span>
              </div>
            </div>
            <Settings size={16} className="text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;