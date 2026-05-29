import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, Plus, MoreHorizontal, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isDoctor = user?.role === 'doctor';
  
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }); 

  return (
    <header className="h-[90px] flex items-center justify-between px-4 md:px-8 bg-[var(--color-page)] sticky top-0 z-40 gap-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl bg-[#1e2336] text-[var(--color-text-secondary)] hover:text-white md:hidden transition-colors border border-white/5 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>
        <div className="flex flex-col justify-center">
          <h2 className="text-base md:text-2xl font-bold text-white tracking-wide leading-tight flex items-center gap-1.5">
            <span className="truncate max-w-[140px] md:max-w-none">Good morning, {user?.name?.split(' ')[0] || 'Dr.'}</span>
            <span className="text-sm md:text-xl shrink-0"></span>
          </h2>
          <p className="text-[10px] md:text-sm text-[var(--color-text-secondary)] font-medium mt-0.5">
            {today}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 md:gap-4">
        <div className="relative group flex items-center">
          <Search size={16} className="absolute left-3 md:left-4 text-[var(--color-text-secondary)] group-focus-within:text-white pointer-events-none transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-[#1e2336] text-white text-sm rounded-xl pl-9 md:pl-11 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-300 w-10 focus:w-40 md:w-64 md:focus:w-64 cursor-pointer focus:cursor-text placeholder-transparent focus:placeholder-[var(--color-text-secondary)] md:placeholder-[var(--color-text-secondary)] md:cursor-text border border-white/5"
          />
        </div>

        <button className="w-10 h-10 rounded-xl bg-[#1e2336] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white transition-colors border border-white/5 relative shrink-0 cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>

        {isDoctor && (
          <div className="flex items-center bg-[#1e2336] rounded-xl overflow-hidden p-1 border border-white/5 shrink-0">
            <Link
              to="/doctor/prescriptions/new"
              className="flex items-center justify-center gap-2 hover:bg-white/5 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus size={16} className="shrink-0" />
              <span className="hidden sm:inline">New Rx</span>
            </Link>
            <div className="w-px h-6 bg-[var(--color-border)] mx-1 hidden sm:block"></div>
            <button className="px-2 py-2 text-[var(--color-text-secondary)] hover:text-white transition-colors rounded-lg hover:bg-white/5 hidden sm:block">
              <MoreHorizontal size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;