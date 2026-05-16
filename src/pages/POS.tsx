import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, ChevronRight, Coffee } from "lucide-react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Product, Category, TransactionItem } from "../types";
import { useAuth } from "../contexts/AuthContext";
import StaffLayout from "../components/pos/Layout";
import { AlertModal } from "../components/AlertModal";

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
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("Alert");

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
      setShowMobileCart(false);
      setAlertTitle("Success");
      setAlertMessage("Transaction success! Invoice: " + invoiceCode);
    } catch (error) {
      console.error("Checkout failed:", error);
      setAlertTitle("Error");
      setAlertMessage("Checkout failed. See console.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <StaffLayout>
      <div className="flex h-[calc(100vh-2rem)] lg:h-full flex-col lg:flex-row gap-6 lg:gap-8 pb-20 lg:pb-0">
        {/* Main POS Content */}
        <div className="flex-1 space-y-6 lg:space-y-8 flex flex-col min-h-0">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight">Point of Sale</h1>
              <p className="text-brand-secondary text-xs uppercase tracking-[0.3em] mt-1">Koncoku.Kopi Tegalsari</p>
            </div>
            <div className="relative w-full sm:w-72 mt-2 sm:mt-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={16} />
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs focus:border-brand-accent transition-all"
              />
            </div>
          </header>

          {/* Categories */}
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide shrink-0">
            <button 
              onClick={() => setSelectedCategory("all")}
              className={`px-4 sm:px-8 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedCategory === "all" ? "bg-brand-accent text-white" : "bg-neutral-900 border border-white/5 text-brand-secondary"
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 sm:px-8 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat.id ? "bg-brand-accent text-white" : "bg-neutral-900 border border-white/5 text-brand-secondary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pr-2 pb-4">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-neutral-900 rounded-3xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {filteredProducts.map(product => (
                  <motion.div 
                    key={product.id}
                    whileHover={{ y: -5 }}
                    onClick={() => addToCart(product)}
                    className="bg-neutral-900/50 border border-white/5 rounded-3xl p-3 sm:p-4 cursor-pointer hover:border-brand-accent/50 transition-all group overflow-hidden relative flex flex-col"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-3 sm:mb-4 bg-black">
                      {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center"><Coffee className="text-white/10" size={40} /></div>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-medium mb-1 truncate">{product.name}</h3>
                    <p className="text-brand-accent font-mono text-xs sm:text-sm">{product.price.toLocaleString('id-ID')}k</p>
                    
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-brand-accent/20 lg:bg-brand-accent p-2 rounded-full text-brand-accent lg:text-white shadow-xl backdrop-blur-sm lg:backdrop-blur-none">
                        <Plus size={16} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile floating view cart button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md border-t border-white/10 lg:hidden z-20 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs text-brand-secondary uppercase tracking-widest">Total Layout</span>
            <span className="text-xl font-bold">{total.toLocaleString('id-ID')}k</span>
          </div>
          <button 
            onClick={() => setShowMobileCart(true)}
            className="bg-brand-accent text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg"
          >
            View Cart ({cart.length})
          </button>
        </div>

        {/* Cart Sidebar (Desktop & Mobile Drawer) */}
        <div className={`${showMobileCart ? 'fixed inset-0 z-50 flex flex-col bg-neutral-900' : 'hidden lg:flex w-96 bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-[40px] flex-col overflow-hidden shadow-2xl shrink-0'}`}>
          {showMobileCart && (
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
              <h2 className="text-lg font-bold">Your Cart</h2>
              <button onClick={() => setShowMobileCart(false)} className="p-2 text-brand-secondary hover:text-white border border-white/10 rounded-full">Close</button>
            </div>
          )}
          
          <div className={`p-6 sm:p-8 border-b border-white/5 flex justify-between items-center ${showMobileCart ? 'hidden' : 'flex'}`}>
            <h2 className="text-lg font-light tracking-tight flex items-center gap-2">
              Current Order <span className="bg-brand-accent text-[10px] font-bold px-2 py-0.5 rounded-full text-white">{cart.length}</span>
            </h2>
            <button onClick={() => setCart([])} className="text-xs uppercase tracking-widest text-brand-secondary hover:text-red-400 transition-colors">Clear</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
                    className="bg-black/20 border border-white/5 rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 items-center"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium truncate mb-2">{item.name}</h4>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-1">
                          <button onClick={() => updateQty(item.productId, -1)} className="p-2 sm:p-1 hover:text-brand-accent"><Minus size={12} /></button>
                          <span className="text-xs font-mono w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.productId, 1)} className="p-2 sm:p-1 hover:text-brand-accent"><Plus size={12} /></button>
                        </div>
                        <span className="text-xs font-mono text-brand-secondary">{item.subtotal}k</span>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="p-2 text-brand-secondary/40 hover:text-red-400 self-center border border-transparent hover:border-red-400/20 rounded-xl transition-all"><Trash2 size={16} /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="p-6 sm:p-8 bg-neutral-950/50 border-t border-white/5 space-y-4 sm:space-y-6 shrink-0 mt-auto">
            <div className="flex justify-between items-center">
              <span className="text-xs text-brand-secondary uppercase tracking-[0.2em]">Total Amount</span>
              <span className="text-2xl sm:text-3xl font-light text-brand-accent">{total.toLocaleString('id-ID')}k</span>
            </div>
            
            <div className="flex gap-2">
              {showMobileCart && (
                <button 
                  onClick={() => setCart([])}
                  className="flex-1 bg-neutral-900 border border-white/10 rounded-2xl py-4 text-[10px] font-bold text-red-400 tracking-widest uppercase hover:bg-neutral-800"
                >
                  Clear
                </button>
              )}
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0}
                className="flex-[2] w-full bg-brand-text text-brand-bg rounded-2xl py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center gap-2"
              >
                Checkout <ChevronRight size={14} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCheckout(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-[30px] sm:rounded-[40px] p-6 sm:p-10 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl sm:text-2xl font-light mb-6 sm:mb-8">Payment Details</h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between pb-4 sm:pb-6 border-b border-white/5 items-center">
                   <span className="text-[10px] sm:text-xs text-brand-secondary uppercase tracking-widest">Amount Due</span>
                   <span className="text-xl sm:text-2xl font-mono text-brand-accent">{total}k</span>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-secondary">Payment Received (k)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-xl font-mono focus:outline-none focus:border-brand-accent transition-all placeholder:text-neutral-800"
                    autoFocus
                  />
                </div>

                <div className="flex justify-between py-4 sm:py-6 items-center">
                   <span className="text-[10px] sm:text-xs text-brand-secondary uppercase tracking-widest">Change</span>
                   <span className={`text-lg sm:text-xl font-mono ${change > 0 ? "text-green-400" : "text-white/20"}`}>{change}k</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                   <button 
                    onClick={() => setShowCheckout(false)}
                    className="w-full sm:flex-1 border border-white/10 rounded-2xl py-3 sm:py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white/5 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                    onClick={handleCheckout}
                    disabled={isProcessing || !paymentAmount || parseInt(paymentAmount) < total}
                    className="w-full sm:flex-1 bg-brand-accent text-white rounded-2xl py-3 sm:py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:brightness-110 disabled:opacity-30 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,119,6,0.3)]"
                   >
                     {isProcessing ? "Processing..." : "Confirm"} <CreditCard size={14} />
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AlertModal
        isOpen={!!alertMessage}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertMessage("")}
      />
    </StaffLayout>
  );
}
