import { getFirebaseDatabase } from '@/lib/firebase/client';
import { ref, set, remove, get, child, onValue, update } from 'firebase/database';

// Library repository handles persistence of favorites, bookmarks, reading history,
// continue reading and progress to Firebase Realtime Database. It assumes
// authentication is enforced at a higher level (via context or hooks).

export async function addFavorite(uid: string, seriesSlug: string) {
  const db = getFirebaseDatabase();
  const now = Date.now();
  await set(ref(db, `users/${uid}/library/favorites/${seriesSlug}`), { addedAt: now });
}

export async function removeFavorite(uid: string, seriesSlug: string) {
  const db = getFirebaseDatabase();
  await remove(ref(db, `users/${uid}/library/favorites/${seriesSlug}`));
}

export async function isFavorite(uid: string, seriesSlug: string): Promise<boolean> {
  const db = getFirebaseDatabase();
  const snapshot = await get(child(ref(db), `users/${uid}/library/favorites/${seriesSlug}`));
  return snapshot.exists();
}

export async function saveProgress(uid: string, seriesSlug: string, chapterSlug: string, pageIndex: number) {
  const db = getFirebaseDatabase();
  await update(ref(db, `users/${uid}/library/progress/${seriesSlug}`), {
    chapter: chapterSlug,
    pageIndex,
    updatedAt: Date.now(),
  });
}

export async function getProgress(uid: string, seriesSlug: string): Promise<{ chapter: string; pageIndex: number } | null> {
  const db = getFirebaseDatabase();
  const snapshot = await get(child(ref(db), `users/${uid}/library/progress/${seriesSlug}`));
  return snapshot.exists() ? (snapshot.val() as any) : null;
}