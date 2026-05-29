import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ChatBot from './ChatBot';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--color-page)] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 md:ml-[260px] flex flex-col h-screen overflow-hidden">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <Outlet />
        </main>
      </div>
      <ChatBot />
    </div>
  );
};

export default DashboardLayout;
