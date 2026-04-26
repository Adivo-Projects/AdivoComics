'use client';

import { ReactNode, createContext, useEffect, useState } from 'react';
import { getFirebaseAuth, loadAnalytics } from '@/lib/firebase/client';
import { onAuthStateChanged, User } from 'firebase/auth';

export const AuthContext = createContext<{ user: User | null; booting: boolean }>({
  user: null,
  booting: true,
});

export default function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    void loadAnalytics().catch(() => undefined);
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setBooting(false);
    });
  }, []);

  return <AuthContext.Provider value={{ user, booting }}>{children}</AuthContext.Provider>;
}
