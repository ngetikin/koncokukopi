import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StaffSidebar from './Sidebar';

interface StaffLayoutProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function StaffLayout({ children, adminOnly }: StaffLayoutProps) {
  const { user, profile, loading, isAdmin, isStaff } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
      <StaffSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-neutral-900/90 backdrop-blur-xl border-b border-white/5 z-[60] flex items-center justify-between px-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center p-1.5 border border-white/10">
            <img src="/icon.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-[0.2em] text-[10px] font-sans text-brand-accent">KONCOKU</span>
            <span className="text-[8px] tracking-[0.1em] text-brand-secondary uppercase">Management</span>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-3 bg-white/5 rounded-xl text-brand-secondary hover:text-white transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>

      <main className="flex-1 lg:ml-64 p-6 md:p-10 pt-32 lg:pt-12 relative z-10 transition-all min-h-screen">
        <div className="max-w-[1600px] mx-auto">
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
