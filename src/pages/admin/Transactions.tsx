import { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, limit, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Transaction } from "../../types";
import StaffLayout from "../../components/pos/Layout";
import { Coffee, FileText, Trash2 } from "lucide-react";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(100));
      const snap = await getDocs(q);
      const allTrans = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(allTrans.filter(t => !t.isDeleted));
    } finally {
      setLoading(false);
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!confirm("Void this transaction? (Soft delete)")) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "transactions", id), { isDeleted: true });
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to void transaction");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-light tracking-tight">Transaction History</h1>
          <p className="text-brand-secondary text-xs uppercase tracking-[0.3em] mt-1">Review past sales and invoices</p>
        </header>

        <div className="bg-neutral-900/50 border border-white/5 rounded-[30px] md:rounded-[40px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Invoice</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Date</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Items</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Total</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Cashier</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center animate-pulse text-brand-secondary uppercase tracking-widest text-xs">Loading history...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-brand-secondary uppercase tracking-widest text-xs">No transactions yet.</td></tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                    <td className="p-8 font-mono text-xs">{t.invoiceCode}</td>
                    <td className="p-8 text-xs text-brand-secondary">
                      {t.createdAt?.toDate?.() ? t.createdAt.toDate().toLocaleDateString('id-ID') : 'Recently'} {t.createdAt?.toDate?.() ? t.createdAt.toDate().toLocaleTimeString('id-ID') : ''}
                    </td>
                    <td className="p-8">
                       <div className="space-y-1">
                         {t.items.map((item, i) => (
                           <p key={i} className="text-[10px] text-brand-secondary truncate max-w-[200px]">
                             {item.qty}x {item.name}
                           </p>
                         ))}
                       </div>
                    </td>
                    <td className="p-8 font-mono text-brand-accent">
                       {t.total.toLocaleString('id-ID')}k
                    </td>
                    <td className="p-8 text-[10px] uppercase tracking-widest text-brand-secondary">
                       ID: {t.cashierId?.slice(-6)}
                    </td>
                    <td className="p-8 text-right">
                       <button 
                        disabled={isProcessing}
                        onClick={() => deleteTransaction(t.id)}
                        className="p-2 bg-white/5 hover:bg-red-500/20 text-brand-secondary/40 hover:text-red-400 rounded-lg transition-all disabled:opacity-30"
                        title="Void Transaction"
                       >
                         <Trash2 size={14} />
                       </button>
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
