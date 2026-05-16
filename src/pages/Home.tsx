import { motion } from "motion/react";
import { Coffee, Instagram, MapPin, Clock, LogOut, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../lib/firebase";

const IMAGES = {
  logo: "https://github.com/ngetikin/koncokukopi/blob/main/public/icon.png?raw=true",
  hero: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000",
  detail1: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=1000",
  detail2: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1000",
  coffee: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=1000",
  vibe: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1000",
  promo: "https://images.unsplash.com/photo-1497933321027-944a3ef1d25c?auto=format&fit=crop&q=80&w=1000"
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, logout, isStaff } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-brand-bg/80 backdrop-blur-md py-4 border-b border-white/5" : "bg-transparent py-8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#home" className="flex items-center gap-3">
          <img src={IMAGES.logo} alt="Logo" className="w-10 h-10 rounded-full" />
          <span className="font-semibold tracking-[0.2em] text-sm hidden sm:block font-sans">KONCOKU.KOPI</span>
        </a>
        <div className="flex gap-4 sm:gap-8 items-center text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-medium text-brand-secondary">
          <a href="#about" className="hover:text-brand-text transition-colors">About</a>
          <a href="#menu" className="hover:text-brand-text transition-colors">Menu</a>
          <a href="#location" className="hover:text-brand-text transition-colors">Space</a>
          <a href="#gallery" className="hover:text-brand-text transition-colors">Gallery</a>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:text-brand-text transition-colors border border-white/10 rounded-full px-3 py-1 bg-white/5"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} className="w-4 h-4 rounded-full" alt="avatar" />
                ) : (
                  <UserIcon size={12} />
                )}
                <span className="max-w-[80px] truncate hidden md:inline">{user.displayName?.split(' ')[0]}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="pb-3 mb-3 border-b border-white/5">
                    <p className="text-brand-text text-[10px] font-bold truncate">{user.displayName}</p>
                    <p className="text-brand-secondary text-[8px] truncate lowercase">{user.email}</p>
                  </div>
                  
                  {isStaff && (
                    <Link 
                      to="/pos"
                      className="flex items-center gap-2 w-full text-left text-brand-accent hover:brightness-110 transition-colors py-2 border-b border-white/5 mb-2"
                    >
                      <Coffee size={12} /> <span>Open POS</span>
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-2 w-full text-left text-brand-secondary hover:text-red-400 transition-colors py-1"
                  >
                    <LogOut size={12} /> <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="px-6 py-2 bg-brand-accent text-white rounded-full text-[10px] font-bold tracking-widest uppercase hover:brightness-110 transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const Hero = () => (
  <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 z-0">
      <img 
        src={IMAGES.hero} 
        alt="Atmosphere" 
        className="w-full h-full object-cover opacity-40 scale-105 brightness-50 contrast-125"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-night/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/50 via-transparent to-brand-bg" />
    </div>
    
    <div className="relative z-10 text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-[10px] uppercase tracking-[0.6em] text-brand-accent mb-6 block font-bold">The Quiet Soul of Tegalsari</h2>
        <h1 className="text-5xl md:text-8xl font-light tracking-tighter mb-8 leading-[0.9]">
          golden hours, <br />
          <span className="italic font-serif text-brand-accent drop-shadow-[0_0_20px_rgba(217,119,6,0.3)]">midnight brews.</span>
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <a 
            href="#menu" 
            className="px-8 py-3 bg-brand-text text-brand-bg rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-brand-accent hover:text-white transition-all duration-300 w-full sm:w-auto"
          >
            See Menu
          </a>
          <a 
            href="https://maps.app.goo.gl/K2M4CTsczGybB2Jh6" 
            target="_blank" 
            referrerPolicy="no-referrer"
            className="px-8 py-3 bg-transparent border border-white/20 text-brand-text rounded-full text-xs font-semibold tracking-widest uppercase hover:border-brand-accent transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            Find Us <MapPin size={14} />
          </a>
        </div>
      </motion.div>
    </div>

    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
      <div className="w-[1px] h-12 bg-white" />
    </div>
  </section>
);

const About = () => (
  <section id="about" className="py-32 px-6 bg-brand-bg">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative group"
        >
          <div className="overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
            <img 
              src={IMAGES.detail2} 
              alt="Workspace" 
              className="w-full aspect-[4/5] object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 hover:scale-110"
            />
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 border-2 border-brand-accent/20 rounded-2xl -z-10 hidden md:block" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <span className="text-brand-accent text-xs font-bold tracking-[0.34em] uppercase mb-6 block">Our Essence</span>
          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-tight">A private space for <span className="text-brand-secondary italic">stillness.</span></h2>
          <p className="text-brand-secondary leading-relaxed mb-8 text-lg font-light">
            KONCOKU.KOPI adalah private coffee space di Tegalsari yang mengutamakan ketenangan dan keintiman. Kami percaya bahwa setiap cangkir kopi terbaik layak dinikmati dalam suasana yang damai.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
            <div>
              <h4 className="text-brand-text font-semibold mb-2 flex items-center gap-2">
                <Clock size={16} className="text-brand-accent" /> Open Private
              </h4>
              <p className="text-xs text-brand-secondary tracking-wide uppercase">Focused on quality, not crowds.</p>
            </div>
            <div>
              <h4 className="text-brand-text font-semibold mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-brand-accent" /> Hidden Gem
              </h4>
              <p className="text-xs text-brand-secondary tracking-wide uppercase">Tegalsari, Banyuwangi.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const Menu = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        const prodSnap = await getDocs(query(collection(db, "products"), where("isAvailable", "==", true)));
        
        const cats = catSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(c => !c.isDeleted);
          
        const prods = prodSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(p => !p.isDeleted);
        
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  return (
    <section id="menu" className="py-32 bg-neutral-950/30 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-24">
          <span className="text-brand-accent text-xs font-bold tracking-[0.34em] uppercase mb-4 block">Selection</span>
          <h2 className="text-5xl font-light">The Menu</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16">
            {categories.map((cat: any, idx) => {
              const catProducts = products.filter(p => p.categoryId === cat.id);
              if (catProducts.length === 0) return null;

              return (
                <motion.div 
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <h3 className="text-[10px] uppercase tracking-[0.4em] text-brand-accent font-bold mb-10 border-b border-white/10 pb-4">
                    {cat.name}
                  </h3>
                  <div className="space-y-10">
                    {catProducts.map((item, i) => (
                      <div key={item.id} className="group cursor-default">
                        <div className="flex justify-between items-baseline mb-2">
                          <h4 className="text-lg font-medium group-hover:text-brand-accent transition-colors">{item.name}</h4>
                          <span className="w-12 h-[1px] bg-white/10 mx-4 hidden sm:block" />
                          <span className="font-mono text-sm text-brand-secondary">{item.price}k</span>
                        </div>
                        {item.imageUrl && (
                          <div className="hidden group-hover:block absolute z-50 pointer-events-none translate-x-32 -translate-y-20">
                            <img src={item.imageUrl} className="w-40 h-40 object-cover rounded-2xl shadow-2xl border border-white/10" alt={item.name} />
                          </div>
                        )}
                        <p className="text-xs text-brand-secondary/60 tracking-wider italic uppercase">Available at Space</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

const Gallery = () => {
  const images = [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1497933321027-944a3ef1d25c?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1495881674446-33e14d7fb620?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1512568448831-1d374ce7a85e?auto=format&fit=crop&q=80&w=1000"
  ];

  return (
    <section id="gallery" className="py-32 bg-brand-bg/20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-brand-accent text-xs font-bold tracking-[0.34em] uppercase mb-4 block">Atmosphere</span>
            <h2 className="text-5xl font-light">Cinematic Moments</h2>
          </div>
          <p className="text-brand-secondary max-w-sm text-sm uppercase tracking-widest leading-loose">
            Every frame tells a story of patience and perfection.
          </p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="overflow-hidden rounded-xl bg-neutral-900 group"
            >
              <img 
                src={img} 
                alt={`Atmosphere ${i}`} 
                className="w-full object-cover grayscale brightness-50 hover:scale-105 hover:grayscale-0 hover:brightness-100 transition-all duration-1000 cursor-pointer"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer id="contact" className="py-32 bg-neutral-950/40 px-6 border-t border-white/5">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div className="space-y-8">
          <img src={IMAGES.logo} alt="Logo" className="w-16 h-16 rounded-full" />
          <p className="text-brand-secondary text-lg font-light leading-relaxed">
            Quiet coffee space for your slow moments. Private, intimate, and memorable.
          </p>
          <div className="flex gap-6">
            <a 
              href="https://www.instagram.com/koncoku.kopi/" 
              target="_blank" 
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-accent hover:border-brand-accent transition-all"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent mb-10">Find Us</h3>
          <p className="text-brand-text mb-4">Krajan 1, Tegalsari, Kabupaten Banyuwangi, Jawa Timur 68485.</p>
          <a 
            href="https://maps.app.goo.gl/K2M4CTsczGybB2Jh6" 
            target="_blank" 
            referrerPolicy="no-referrer"
            className="text-brand-accent uppercase text-[10px] tracking-[0.3em] font-bold hover:underline"
          >
            Google Maps Link
          </a>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent mb-10">Hours</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-brand-secondary text-sm uppercase tracking-widest">Mon - Sun</span>
              <span className="text-brand-text text-sm">Open Private</span>
            </div>
            <p className="text-[10px] text-brand-secondary/60 uppercase tracking-widest leading-relaxed">
              Silakan DM Instagram atau WhatsApp untuk reservasi atau sekadar mampir.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-brand-secondary uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} KONCOKU.KOPI. All Rights Reserved.
        </p>
        <p className="text-[10px] text-brand-secondary/40 uppercase tracking-[0.3em]">
          Banyuwangi &bull; East Java
        </p>
      </div>
    </div>
  </footer>
);

export default function Home() {
  return (
    <div className="bg-transparent text-brand-text min-h-screen selection:bg-brand-accent selection:text-white noise-bg overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-brand-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[30vh] h-[30vh] bg-brand-sunset/10 rounded-full blur-[100px]" />
      </div>

      <Navbar />
      <Hero />
      <About />
      <Menu />
      <section id="location" className="py-32 bg-transparent px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
            <span className="text-brand-accent text-xs font-bold tracking-[0.34em] uppercase mb-4 block">Visit Us</span>
            <h2 className="text-5xl font-light">The Space</h2>
          </div>
          <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-white/5 grayscale brightness-50 hover:grayscale-0 hover:brightness-100 transition-all duration-1000 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d246.67443778329937!2d114.1404646518615!3d-8.422175118857224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd401230ed9f11f%3A0x1bc1ffba957d172b!2sCreativepangan!5e0!3m2!1sen!2sid!4v1778926692116!5m2!1sen!2sid" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
      <Gallery />
      <Footer />
    </div>
  );
}
