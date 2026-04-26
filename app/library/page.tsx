"use client";
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../providers';
import { getFirebaseDatabase } from '@/lib/firebase/client';
import { onValue, ref } from 'firebase/database';
import Link from 'next/link';

interface FavoriteEntry {
  addedAt: number;
}

export default function LibraryPage() {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState<Record<string, FavoriteEntry>>({});
  useEffect(() => {
    if (!user) return;
    const db = getFirebaseDatabase();
    const favRef = ref(db, `users/${user.uid}/library/favorites`);
    const unsub = onValue(favRef, (snap) => {
      setFavorites(snap.exists() ? (snap.val() as any) : {});
    });
    return () => unsub();
  }, [user]);
  if (!user) {
    return (
      <div className="px-4 pt-8">
        <h1 className="text-xl font-bold mb-4">Library</h1>
        <p className="text-sm mb-4">You need to sign in to access your library.</p>
        <Link href="/auth/login" className="text-primary-dark underline text-sm">
          Sign in
        </Link>
      </div>
    );
  }
  const favoriteSlugs = Object.keys(favorites);
  return (
    <div className="px-4 pt-8">
      <h1 className="text-xl font-bold mb-4">Library</h1>
      {favoriteSlugs.length === 0 ? (
        <p className="text-sm text-muted">No favorites yet.</p>
      ) : (
        <p className="text-sm text-muted mb-2">Favorites ({favoriteSlugs.length})</p>
      )}
      {/* We currently cannot fetch series details here because that would require server side scraping. */}
      <div className="grid grid-cols-2 gap-4">
        {favoriteSlugs.map((slug) => (
          <div key={slug} className="text-sm">
            <Link href={`/series/${slug}`} className="text-primary-dark hover:underline">
              {slug.replace(/-/g, ' ')}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}