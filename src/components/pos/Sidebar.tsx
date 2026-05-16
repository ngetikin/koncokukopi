import { motion, AnimatePresence } from "motion/react";
import { Coffee, LayoutDashboard, Utensils, History, BarChart3, LogOut, Home, Users, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Logo } from "../Logo";
import { useEffect } from "react";

export default function StaffSidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const location = useLocation();
  const { logout, isAdmin } = useAuth();

  const links = [
    { name: 'POS', path: '/pos', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Utensils, adminOnly: true },
    { name: 'Users', path: '/admin/users', icon: Users, adminOnly: true },
    { name: 'Transactions', path: '/admin/transactions', icon: History },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3, adminOnly: true },
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div 
        className={`w-64 bg-neutral-900 border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="w-8 h-8 rounded-full" />
            <span className="font-semibold tracking-[0.1em] text-xs font-sans">KONCOKU PANEL</span>
          </Link>
          <button className="lg:hidden text-brand-secondary hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => (
            (!link.adminOnly || isAdmin) && (
              <Link
                key={link.path}
                to={link.path}
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
    </>
  );
}
