import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StaffSidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface StaffLayoutProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function StaffLayout({ children, adminOnly }: StaffLayoutProps) {
  const { user, profile, loading, isAdmin, isStaff } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
    </div>
  );

  if (!user || !isStaff) {
    return <Navigate to="/auth" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/pos" />;
  }

  return (
    <div className="flex bg-brand-bg text-brand-text min-h-screen font-sans noise-bg">
      <StaffSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 w-full lg:ml-64 relative z-10 flex flex-col min-h-screen max-w-full overflow-x-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-white/5 flex items-center gap-4 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-20">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-brand-secondary hover:text-white"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold tracking-[0.1em] text-xs font-sans">KONCOKU</span>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-brand-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[30vh] h-[30vh] bg-brand-sunset/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
