import { motion, AnimatePresence } from "motion/react";
import { Coffee, LayoutDashboard, Utensils, History, BarChart3, LogOut, Home, Users, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffSidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { logout, isAdmin } = useAuth();

  const links = [
    { name: 'POS', path: '/pos', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Utensils, adminOnly: true },
    { name: 'Users', path: '/admin/users', icon: Users, adminOnly: true },
    { name: 'Transactions', path: '/admin/transactions', icon: History },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3, adminOnly: true },
  ];

  const sidebarContent = (
    <div className="w-64 bg-neutral-900 border-r border-white/5 flex flex-col h-screen fixed lg:sticky left-0 top-0 z-30">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center p-1.5 border border-white/10 group-hover:border-brand-accent/50 transition-all">
            <img src="/icon.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-[0.2em] text-[10px] font-sans text-white">KONCOKU</span>
            <span className="text-[8px] tracking-[0.1em] text-brand-secondary uppercase">Panel Control</span>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden p-2 text-brand-secondary hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => (
          (!link.adminOnly || isAdmin) && (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium tracking-widest uppercase transition-all ${
                location.pathname === link.path 
                  ? "bg-brand-accent text-white" 
                  : "text-brand-secondary hover:bg-white/5 hover:text-brand-text"
              }`}
            >
              <link.icon size={16} />
              {link.name}
            </Link>
          )
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link 
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium tracking-widest uppercase text-brand-secondary hover:bg-white/5 hover:text-brand-text transition-all"
        >
          <Home size={16} /> Website
        </Link>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium tracking-widest uppercase text-red-400 hover:bg-red-400/10 transition-all w-full text-left"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-[100]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-64 h-full"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
