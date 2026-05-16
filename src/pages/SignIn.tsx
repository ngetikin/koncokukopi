import { motion } from "motion/react";
import { Coffee, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function SignIn() {
  const { signInWithGoogle, user, isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      if (isStaff) {
        navigate("/pos");
      } else {
        navigate("/");
      }
    }
  }, [user, isStaff, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans relative flex items-center justify-center p-6 noise-bg overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-brand-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[30vh] h-[30vh] bg-brand-sunset/20 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <a href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-medium text-brand-secondary hover:text-brand-text transition-colors mb-12">
          <ArrowLeft size={14} /> Back to Home
        </a>

        <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 p-10 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-brand-accent/20 rounded-2xl flex items-center justify-center mb-6 border border-brand-accent/20">
              <Coffee className="text-brand-accent" size={32} />
            </div>
            <h1 className="text-3xl font-light mb-2 tracking-tight">Welcome back.</h1>
            <p className="text-brand-secondary text-sm font-light uppercase tracking-widest leading-relaxed">
              Sign in to your private coffee space account.
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <p className="text-red-500 text-[10px] uppercase tracking-widest mb-4 text-center">{error}</p>
            )}

            <button 
              onClick={handleGoogleSignIn}
              className="w-full bg-brand-text text-brand-bg rounded-2xl py-5 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all shadow-lg flex items-center justify-center gap-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>

        <p className="mt-12 text-center text-[10px] uppercase tracking-[0.3em] text-brand-secondary/60">
          Don't have an account? <span className="text-brand-accent cursor-pointer hover:underline">Contact us</span>
        </p>
      </motion.div>
    </div>
  );
}
