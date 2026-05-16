import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userDoc = await getDoc(userRef);
          const isAdminEmail = currentUser.email === 'ngetikin.community@gmail.com';
          
          if (!userDoc.exists()) {
            const role: UserRole = isAdminEmail ? 'admin' : 'customer';
            const newProfile: any = {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              role,
              createdAt: serverTimestamp(),
            };
            await setDoc(userRef, newProfile);
            setProfile({ ...newProfile, role });
          } else {
            const data = userDoc.data() as UserProfile;
            // Force admin if email matches but role is wrong in DB
            if (isAdminEmail && data.role !== 'admin') {
              await updateDoc(userRef, { role: 'admin' });
              data.role = 'admin';
            }
            setProfile(data);
          }
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isAdmin = profile?.role === 'admin' || user?.email === 'ngetikin.community@gmail.com';
  const isStaff = isAdmin || profile?.role === 'cashier';

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
