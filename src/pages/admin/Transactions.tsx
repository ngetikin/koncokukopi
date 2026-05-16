import { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, limit, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Transaction, UserProfile } from "../../types";
import StaffLayout from "../../components/pos/Layout";
import { Coffee, FileText } from "lucide-react";
import { AlertModal } from "../../components/AlertModal";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(100));
      const [snap, usersSnap] = await Promise.all([
        getDocs(q),
        getDocs(collection(db, "users"))
      ]);
      
      const uMap: Record<string, string> = {};
      usersSnap.docs.forEach(doc => {
        const data = doc.data() as UserProfile;
        uMap[doc.id] = data.displayName || data.email || doc.id;
      });
      setUsersMap(uMap);

      const allTrans = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(allTrans.filter(t => !t.isDeleted));
    } finally {
      setLoading(false);
    }
  }

  return (
    <StaffLayout>
      <div className="space-y-6 sm:space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight">Transaction History</h1>
          <p className="text-brand-secondary text-[10px] sm:text-xs uppercase tracking-[0.3em] mt-1">Review past sales and invoices</p>
        </header>

        <div className="bg-neutral-900/50 border border-white/5 rounded-3xl sm:rounded-[40px] overflow-hidden max-w-full overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="p-4 sm:p-8 text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-brand-secondary whitespace-nowrap">Invoice</th>
                <th className="p-4 sm:p-8 text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-brand-secondary whitespace-nowrap">Date</th>
                <th className="p-4 sm:p-8 text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-brand-secondary">Items</th>
                <th className="p-4 sm:p-8 text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-brand-secondary">Total</th>
                <th className="p-4 sm:p-8 text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-brand-secondary">Payment</th>
                <th className="p-4 sm:p-8 text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-brand-secondary">Cashier</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-10 sm:p-20 text-center animate-pulse text-brand-secondary uppercase tracking-widest text-xs">Loading history...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="p-10 sm:p-20 text-center text-brand-secondary uppercase tracking-widest text-xs">No transactions yet.</td></tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                    <td className="p-4 sm:p-8 font-mono text-xs whitespace-nowrap">{t.invoiceCode}</td>
                    <td className="p-4 sm:p-8 text-[10px] sm:text-xs text-brand-secondary whitespace-nowrap">
                      {t.createdAt?.toDate?.() ? t.createdAt.toDate().toLocaleDateString('id-ID') : 'Recently'} <br className="hidden sm:block" /> {t.createdAt?.toDate?.() ? t.createdAt.toDate().toLocaleTimeString('id-ID') : ''}
                    </td>
                    <td className="p-4 sm:p-8">
                       <div className="space-y-1 sm:max-w-[200px]">
                         {t.items.map((item, i) => (
                           <p key={i} className="text-[10px] text-brand-secondary truncate">
                             {item.qty}x {item.name}
                           </p>
                         ))}
                       </div>
                    </td>
                    <td className="p-4 sm:p-8 font-mono text-brand-accent text-sm sm:text-base">
                       {t.total.toLocaleString('id-ID')}k
                    </td>
                    <td className="p-4 sm:p-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">{t.paymentMethod || 'CASH'}</span>
                        {t.note && <span className="text-[10px] text-brand-secondary mt-1 max-w-[120px] truncate" title={t.note}>{t.note}</span>}
                      </div>
                    </td>
                    <td className="p-4 sm:p-8 text-[9px] sm:text-[10px] uppercase tracking-widest text-brand-secondary whitespace-nowrap">
                       {usersMap[t.cashierId] || `ID: ${t.cashierId?.slice(-6) || 'N/A'}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertModal
        isOpen={!!alertMessage}
        message={alertMessage}
        onClose={() => setAlertMessage("")}
      />
    </StaffLayout>
  );
}
