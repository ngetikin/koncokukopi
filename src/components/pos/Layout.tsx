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
      <StaffSidebar />
      <main className="flex-1 ml-64 p-8 relative z-10">
        {children}
      </main>
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-brand-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[30vh] h-[30vh] bg-brand-sunset/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
