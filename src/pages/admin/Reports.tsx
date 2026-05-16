import { useState, useEffect } from "react";
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Transaction } from "../../types";
import StaffLayout from "../../components/pos/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AdminReports() {
  const [data, setData] = useState<{name: string, value: number}[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, totalTrans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const today = new Date();
        today.setHours(0,0,0,0);
        const q = query(collection(db, "transactions"), where("createdAt", ">=", Timestamp.fromDate(today)));
        const snap = await getDocs(q);
        const transactions = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
          .filter(t => !t.isDeleted);

        const sales = transactions.reduce((acc, t) => acc + t.total, 0);
        setStats({ totalSales: sales, totalTrans: transactions.length });

        // Calculate top products
        const productMap: Record<string, number> = {};
        transactions.forEach(t => {
          t.items.forEach(item => {
            productMap[item.name] = (productMap[item.name] || 0) + item.qty;
          });
        });

        const chartData = Object.entries(productMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        
        setData(chartData);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const COLORS = ['#D97706', '#7C2D12', '#94A3B8', '#1E1B4B', '#4B5563'];

  return (
    <StaffLayout adminOnly>
      <div className="space-y-12">
        <header>
          <h1 className="text-3xl font-light tracking-tight">Daily Reports</h1>
          <p className="text-brand-secondary text-xs uppercase tracking-[0.3em] mt-1">Overview of today's performance</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-neutral-900/50 border border-white/5 rounded-[40px] p-10 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-brand-secondary mb-4">Total Revenue Today</span>
              <span className="text-5xl font-light text-brand-accent mb-2">{stats.totalSales.toLocaleString('id-ID')}k</span>
              <p className="text-xs text-brand-secondary/40 tracking-widest uppercase">Indonesian Rupiah (IDR)</p>
           </div>
           <div className="bg-neutral-900/50 border border-white/5 rounded-[40px] p-10 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-brand-secondary mb-4">Successful Transactions</span>
              <span className="text-5xl font-light text-white mb-2">{stats.totalTrans}</span>
              <p className="text-xs text-brand-secondary/40 tracking-widest uppercase">Orders Completed Today</p>
           </div>
        </div>

        <div className="space-y-8">
           <h2 className="text-xl font-light tracking-tight">Top 5 Best Selling Products</h2>
           <div className="bg-neutral-900/50 border border-white/5 rounded-[40px] p-10 h-[400px]">
              {loading ? (
                <div className="h-full flex items-center justify-center animate-pulse text-brand-secondary uppercase tracking-[0.3em] text-xs">Generating data...</div>
              ) : data.length === 0 ? (
                <div className="h-full flex items-center justify-center text-brand-secondary uppercase tracking-[0.3em] text-xs">No data for today.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ left: 40, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#B8B8B8', fontSize: 10, letterSpacing: '0.1em' }} width={100} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
           </div>
        </div>
      </div>
    </StaffLayout>
  );
}
