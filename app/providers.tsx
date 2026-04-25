import '@/app/globals.css';
import { ReactNode, createContext, useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { onAuthStateChanged, User } from 'firebase/auth';

// Authentication context to expose the current user across the client app. This
// provider sets up a listener on Firebase Auth and triggers re-renders when
// auth state changes. Server components must not consume this context.

export const AuthContext = createContext<{ user: User | null }>({ user: null });

export default function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}