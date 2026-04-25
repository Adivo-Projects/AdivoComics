"use client";
import { useContext } from 'react';
import { AuthContext } from '../providers';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const handleLogout = async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
  };
  if (!user) {
    return (
      <div className="px-4 pt-8">
        <h1 className="text-xl font-bold mb-4">Profile</h1>
        <p className="text-sm mb-4">You are not signed in.</p>
        <Link href="/auth/login" className="text-primary-dark underline text-sm">
          Sign in
        </Link>
      </div>
    );
  }
  return (
    <div className="px-4 pt-8 space-y-4">
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      <p className="text-sm">
        Signed in as <span className="font-semibold">{user.displayName || user.email}</span>
      </p>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-primary text-background rounded text-sm font-semibold hover:bg-primary-dark"
      >
        Sign Out
      </button>
    </div>
  );
}
