import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users as UsersIcon, Shield, ShieldAlert, User as UserIcon, Search, MoreVertical, Trash2 } from "lucide-react";
import { collection, query, getDocs, updateDoc, doc, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { UserProfile, UserRole } from "../../types";
import StaffLayout from "../../components/pos/Layout";

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const allUsers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setUsers(allUsers.filter((u: any) => !u.isDeleted));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const updateRole = async (userId: string, newRole: UserRole) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user? This is a soft delete.")) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "users", userId), { isDeleted: true });
      setUsers(prev => prev.filter(u => u.uid !== userId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StaffLayout adminOnly>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">User Management</h1>
            <p className="text-brand-secondary text-[10px] uppercase tracking-[0.3em] mt-1">Manage staff roles and access</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={16} />
            <input 
              type="text" 
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs focus:border-brand-accent transition-all"
            />
          </div>
        </header>

        <div className="bg-neutral-900/50 border border-white/5 rounded-[30px] md:rounded-[40px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">User</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Role</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Joined</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center animate-pulse text-brand-secondary uppercase tracking-widest text-xs">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-brand-secondary uppercase tracking-widest text-xs">No users found.</td></tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.uid} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-black overflow-hidden flex items-center justify-center border border-white/10">
                          {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" /> : <UserIcon className="text-white/20" size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{u.displayName}</p>
                          <p className="text-[10px] text-brand-secondary lowercase">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                       <span className={`text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-md ${
                         u.role === 'admin' ? "bg-red-500/10 text-red-400" : 
                         u.role === 'cashier' ? "bg-brand-accent/10 text-brand-accent" : 
                         "bg-white/5 text-brand-secondary"
                       }`}>
                         {u.role}
                       </span>
                    </td>
                    <td className="p-6 text-xs text-brand-secondary">
                       {u.createdAt?.toDate?.() ? u.createdAt.toDate().toLocaleDateString('id-ID') : 'Recently'}
                    </td>
                    <td className="p-6 text-right">
                       <div className="flex justify-end gap-2">
                         <button 
                           disabled={isProcessing}
                           onClick={() => updateRole(u.uid, 'admin')}
                           className={`p-2 rounded-lg transition-all disabled:opacity-30 ${u.role === 'admin' ? "bg-red-500 text-white" : "hover:bg-red-500/10 text-red-400/50 hover:text-red-400"}`}
                           title="Set as Admin"
                         >
                           <ShieldAlert size={16} />
                         </button>
                         <button 
                           disabled={isProcessing}
                           onClick={() => updateRole(u.uid, 'cashier')}
                           className={`p-2 rounded-lg transition-all disabled:opacity-30 ${u.role === 'cashier' ? "bg-brand-accent text-white" : "hover:bg-brand-accent/10 text-brand-accent/50 hover:text-brand-accent"}`}
                           title="Set as Cashier"
                         >
                           <Shield size={16} />
                         </button>
                         <button 
                           disabled={isProcessing}
                           onClick={() => updateRole(u.uid, 'customer')}
                           className={`p-2 rounded-lg transition-all disabled:opacity-30 ${u.role === 'customer' ? "bg-white/20 text-white" : "hover:bg-white/5 text-brand-secondary"}`}
                           title="Set as Customer"
                         >
                           <UserIcon size={16} />
                         </button>
                         <button 
                           disabled={isProcessing}
                           onClick={() => deleteUser(u.uid)}
                           className="p-2 rounded-lg transition-all text-brand-secondary/30 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-30"
                           title="Delete User"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
