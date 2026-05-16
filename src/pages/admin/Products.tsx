import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Edit2, Trash2, LayoutGrid as CatIcon, Coffee, Search, X, Check } from "lucide-react";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Product, Category } from "../../types";
import StaffLayout from "../../components/pos/Layout";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: "",
    imageUrl: "",
    isAvailable: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const prodSnap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
      const catSnap = await getDocs(collection(db, "categories"));
      
      const allProds = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      const allCats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));

      setProducts(allProds.filter(p => !p.isDeleted));
      setCategories(allCats.filter(c => !c.isDeleted));
    } finally {
      setLoading(false);
    }
  }

  const handleProductSubmit = async (e: any) => {
    e.preventDefault();
    setIsProcessing(true);
    const data = {
      ...formData,
      price: parseInt(formData.price),
      createdAt: serverTimestamp()
    };

    try {
      if (editProduct) {
        await updateDoc(doc(db, "products", editProduct.id), data);
      } else {
        await addDoc(collection(db, "products"), data);
      }
      setIsModalOpen(false);
      setEditProduct(null);
      setFormData({ name: "", categoryId: "", price: "", imageUrl: "", isAvailable: true });
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Error saving product.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!newCatName || isProcessing) return;
    setIsProcessing(true);
    try {
      if (editingCategory) {
        await updateDoc(doc(db, "categories", editingCategory.id), { name: newCatName });
      } else {
        await addDoc(collection(db, "categories"), { name: newCatName, isDeleted: false });
      }
      setNewCatName("");
      setEditingCategory(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to save category");
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "products", id), { isDeleted: true });
      await fetchData();
    } catch (error: any) {
      console.error(error);
      alert(`Failed to delete product: ${error.message || error.code || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete category? Items in this category will become uncategorized.")) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "categories", id), { isDeleted: true });
      await fetchData();
    } catch (error: any) {
      console.error(error);
      alert(`Failed to delete category: ${error.message || error.code || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <StaffLayout adminOnly>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">Product Management</h1>
            <p className="text-brand-secondary text-[10px] uppercase tracking-[0.3em] mt-1">Manage your menu offerings</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
             <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex-1 sm:flex-none justify-center bg-neutral-900 border border-white/5 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <CatIcon size={14} /> Categories
            </button>
            <button 
              onClick={() => {
                setEditProduct(null);
                setFormData({ name: "", categoryId: "", price: "", imageUrl: "", isAvailable: true });
                setIsModalOpen(true);
              }}
              className="flex-1 sm:flex-none justify-center bg-brand-accent text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(217,119,6,0.3)]"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>
        </header>

        {/* Table/Grid */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-[30px] md:rounded-[40px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Image</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Details</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Category</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Price</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Status</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-brand-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center animate-pulse text-brand-secondary uppercase tracking-widest text-xs">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-brand-secondary uppercase tracking-widest text-xs">No products found.</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-6">
                      <div className="w-16 h-16 rounded-xl bg-black overflow-hidden flex items-center justify-center">
                        {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <Coffee className="text-white/10" size={20} />}
                      </div>
                    </td>
                    <td className="p-6">
                       <p className="font-medium">{p.name}</p>
                    </td>
                    <td className="p-6">
                       <span className="text-xs text-brand-secondary bg-white/5 px-3 py-1 rounded-full uppercase tracking-tighter">
                         {categories.find(c => c.id === p.categoryId)?.name || 'Uncategorized'}
                       </span>
                    </td>
                    <td className="p-6 font-mono text-brand-accent">
                       {p.price.toLocaleString('id-ID')}k
                    </td>
                    <td className="p-6">
                       <span className={`text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-md ${p.isAvailable ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                         {p.isAvailable ? "Active" : "Out of Stock"}
                       </span>
                    </td>
                    <td className="p-6 flex gap-2">
                       <button 
                        disabled={isProcessing}
                        onClick={() => {
                          setEditProduct(p);
                          setFormData({ 
                            name: p.name, 
                            categoryId: p.categoryId, 
                            price: p.price.toString(), 
                            imageUrl: p.imageUrl || "", 
                            isAvailable: p.isAvailable 
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-3 bg-white/5 hover:bg-brand-accent hover:text-white rounded-xl transition-all disabled:opacity-30"
                       >
                         <Edit2 size={14} />
                       </button>
                       <button 
                        disabled={isProcessing}
                        onClick={() => deleteProduct(p.id)}
                        className="p-3 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all disabled:opacity-30"
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

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isProcessing && setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-xl bg-neutral-900 border border-white/10 rounded-[30px] md:rounded-[40px] p-6 md:p-10 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
               <div className="flex justify-between items-center mb-8 md:mb-10">
                  <h2 className="text-xl md:text-2xl font-light">{editProduct ? "Edit Product" : "New Item"}</h2>
                  <button disabled={isProcessing} onClick={() => setIsModalOpen(false)} className="disabled:opacity-30 p-2"><X size={20} /></button>
               </div>
               
               <form onSubmit={handleProductSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-secondary ml-1">Name</label>
                      <input 
                        required
                        disabled={isProcessing}
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-accent transition-all disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-secondary ml-1">Category</label>
                      <select 
                        required
                        disabled={isProcessing}
                        value={formData.categoryId}
                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-accent transition-all appearance-none disabled:opacity-50"
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-secondary ml-1">Price (k)</label>
                      <input 
                        required
                        disabled={isProcessing}
                        type="number" 
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-accent transition-all disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-secondary ml-1">Image URL</label>
                      <input 
                        disabled={isProcessing}
                        type="text" 
                        placeholder="https://..."
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-accent transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-4">
                    <button 
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setFormData({...formData, isAvailable: !formData.isAvailable})}
                      className={`w-12 h-6 rounded-full relative transition-all disabled:opacity-30 ${formData.isAvailable ? "bg-brand-accent" : "bg-neutral-800"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isAvailable ? "left-7" : "left-1"}`} />
                    </button>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Still in Stock</span>
                  </div>

                  <button 
                    disabled={isProcessing}
                    type="submit"
                    className="w-full bg-brand-text text-brand-bg rounded-2xl py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all shadow-xl disabled:opacity-30"
                  >
                    {isProcessing ? "Processing..." : (editProduct ? "Update Item" : "Create Item")}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Categories Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isProcessing && setIsCategoryModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-[40px] p-10 relative z-10 shadow-2xl">
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-light">Categories</h2>
                  <button disabled={isProcessing} onClick={() => setIsCategoryModalOpen(false)} className="disabled:opacity-30"><X size={20} /></button>
               </div>

               <div className="space-y-4 mb-8">
                  {categories.map(c => (
                    <div key={c.id} className="flex justify-between items-center bg-black/40 border border-white/5 rounded-xl px-6 py-4">
                       <span className="text-sm">{c.name}</span>
                       <div className="flex gap-2">
                         <button 
                          disabled={isProcessing}
                          onClick={() => {
                            setEditingCategory(c);
                            setNewCatName(c.name);
                          }} 
                          className="text-brand-secondary hover:text-brand-accent disabled:opacity-30"
                         >
                            <Edit2 size={14} />
                         </button>
                         <button 
                          disabled={isProcessing}
                          onClick={() => handleDeleteCategory(c.id)} 
                          className="text-brand-secondary hover:text-red-400 disabled:opacity-30"
                         >
                            <Trash2 size={14} />
                         </button>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="flex gap-2">
                 <input 
                    disabled={isProcessing}
                    type="text" 
                    placeholder={editingCategory ? "Edit Category Name..." : "New Category..."}
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 bg-black border border-white/10 rounded-xl px-6 py-3 text-sm focus:outline-none focus:border-brand-accent transition-all disabled:opacity-50"
                 />
                 <button 
                  disabled={isProcessing || !newCatName}
                  onClick={handleSaveCategory}
                  className="bg-brand-accent p-3 rounded-xl hover:brightness-110 disabled:opacity-30"
                 >
                    {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editingCategory ? <Check size={20} /> : <Plus size={20} />)}
                 </button>
                 {editingCategory && (
                   <button 
                    disabled={isProcessing}
                    onClick={() => {
                      setEditingCategory(null);
                      setNewCatName("");
                    }}
                    className="bg-neutral-800 p-3 rounded-xl hover:bg-neutral-700 disabled:opacity-30"
                   >
                     <X size={20} />
                   </button>
                 )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </StaffLayout>
  );
}
