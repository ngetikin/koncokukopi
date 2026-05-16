import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, ChevronRight, Coffee } from "lucide-react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Product, Category, TransactionItem } from "../types";
import { useAuth } from "../contexts/AuthContext";
import StaffLayout from "../components/pos/Layout";

export default function POS() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const prodSnap = await getDocs(query(collection(db, "products"), where("isAvailable", "==", true)));
        const catSnap = await getDocs(collection(db, "categories"));
        
        const allProds = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const allCats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));

        setProducts(allProds.filter(p => !p.isDeleted));
        setCategories(allCats.filter(c => !c.isDeleted));
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.price } : item
        );
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        price: product.price, 
        qty: 1, 
        subtotal: product.price 
      }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty, subtotal: newQty * item.price };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.productId !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const change = paymentAmount ? Math.max(0, parseInt(paymentAmount) - total) : 0;

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCheckout = async () => {
    if (cart.length === 0 || !paymentAmount || parseInt(paymentAmount) < total) return;
    
    setIsProcessing(true);
    try {
      const invoiceCode = `INV-${Date.now()}`;
      await addDoc(collection(db, "transactions"), {
        invoiceCode,
        cashierId: profile?.uid,
        total,
        paymentAmount: parseInt(paymentAmount),
        changeAmount: change,
        items: cart,
        createdAt: serverTimestamp()
      });
      
      setCart([]);
      setPaymentAmount("");
      setShowCheckout(false);
      alert("Transaction success! Invoice: " + invoiceCode);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. See console.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <StaffLayout>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main POS Content */}
        <div className="flex-1 space-y-8 w-full order-1">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight">Point of Sale</h1>
              <p className="text-brand-secondary text-[10px] sm:text-xs uppercase tracking-[0.3em] mt-1">Koncoku.Kopi Tegalsari</p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={16} />
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-brand-accent transition-all shadow-lg"
              />
            </div>
          </header>

          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
            <button 
              onClick={() => setSelectedCategory("all")}
              className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${
                selectedCategory === "all" ? "bg-brand-accent text-white shadow-brand-accent/20" : "bg-neutral-900 border border-white/5 text-brand-secondary hover:bg-white/5"
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${
                  selectedCategory === cat.id ? "bg-brand-accent text-white shadow-brand-accent/20" : "bg-neutral-900 border border-white/5 text-brand-secondary hover:bg-white/5"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-square bg-neutral-900/50 rounded-3xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <motion.div 
                  key={product.id}
                  whileHover={{ y: -8 }}
                  onClick={() => addToCart(product)}
                  className="bg-neutral-900/40 backdrop-blur-sm border border-white/5 rounded-[32px] p-4 cursor-pointer hover:border-brand-accent/40 transition-all group overflow-hidden relative shadow-xl"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-black/40">
                     {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900"><Coffee className="text-white/5" size={48} /></div>
                     )}
                  </div>
                  <h3 className="text-sm font-medium mb-1 truncate text-white/90">{product.name}</h3>
                  <p className="text-brand-accent font-mono text-sm font-light">{product.price.toLocaleString('id-ID')}k</p>
                  
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-brand-accent p-2.5 rounded-full text-white shadow-[0_4px_15px_rgba(217,119,6,0.4)]">
                      <Plus size={18} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="w-full lg:w-[400px] bg-neutral-900/40 backdrop-blur-2xl border border-white/10 rounded-[40px] flex flex-col overflow-hidden shadow-2xl order-2 lg:sticky lg:top-24 h-fit lg:max-h-[calc(100vh-8rem)]">
          <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="text-base md:text-lg font-light tracking-tight flex items-center gap-3">
              Current Order <span className="bg-brand-accent text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-lg shadow-brand-accent/20">{cart.length}</span>
            </h2>
            <button onClick={() => setCart([])} className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-secondary hover:text-red-400 transition-colors">Clear</button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[50vh] lg:max-h-none p-4 md:p-6 space-y-4 min-h-[150px]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-brand-secondary/30 space-y-4">
                <ShoppingCart size={48} />
                <p className="text-xs uppercase tracking-[0.3em]">Cart is empty</p>
              </div>
            ) : (
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div 
                    key={item.productId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-black/20 border border-white/5 rounded-2xl p-4 flex gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium truncate mb-2">{item.name}</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-1">
                          <button onClick={() => updateQty(item.productId, -1)} className="p-1 hover:text-brand-accent"><Minus size={12} /></button>
                          <span className="text-xs font-mono w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.productId, 1)} className="p-1 hover:text-brand-accent"><Plus size={12} /></button>
                        </div>
                        <span className="text-xs font-mono text-brand-secondary">{item.subtotal}k</span>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-brand-secondary/40 hover:text-red-400 self-center"><Trash2 size={16} /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="p-6 md:p-8 bg-neutral-950/50 border-t border-white/5 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-brand-secondary uppercase tracking-[0.2em]">Total Amount</span>
              <span className="text-2xl md:text-3xl font-light text-brand-accent">{total.toLocaleString('id-ID')}k</span>
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCheckout(true)}
              disabled={cart.length === 0}
              className="w-full bg-brand-text text-brand-bg rounded-2xl py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center gap-2"
            >
              Checkout <ChevronRight size={14} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCheckout(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-[40px] p-10 relative z-10 shadow-2xl"
            >
              <h2 className="text-2xl font-light mb-8">Payment Details</h2>
              <div className="space-y-6">
                <div className="flex justify-between pb-6 border-b border-white/5">
                   <span className="text-xs text-brand-secondary uppercase tracking-widest">Amount Due</span>
                   <span className="text-2xl font-mono text-brand-accent">{total}k</span>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-secondary">Payment Received (k)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xl font-mono focus:outline-none focus:border-brand-accent transition-all placeholder:text-neutral-800"
                    autoFocus
                  />
                </div>

                <div className="flex justify-between py-6">
                   <span className="text-xs text-brand-secondary uppercase tracking-widest">Change</span>
                   <span className={`text-xl font-mono ${change > 0 ? "text-green-400" : "text-white/20"}`}>{change}k</span>
                </div>

                <div className="flex gap-4">
                   <button 
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 border border-white/10 rounded-2xl py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white/5 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                    onClick={handleCheckout}
                    disabled={isProcessing || !paymentAmount || parseInt(paymentAmount) < total}
                    className="flex-1 bg-brand-accent text-white rounded-2xl py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:brightness-110 disabled:opacity-30 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,119,6,0.3)]"
                   >
                     {isProcessing ? "Processing..." : "Confirm"} <CreditCard size={14} />
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </StaffLayout>
  );
}
