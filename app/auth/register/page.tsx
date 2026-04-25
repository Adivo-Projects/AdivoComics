"use client";
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const auth = getFirebaseAuth();
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(user, { displayName: name });
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <div className="px-4 pt-8">
      <h1 className="text-xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-sm mb-1" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-neutral-700 rounded text-sm focus:border-primary-dark outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-neutral-700 rounded text-sm focus:border-primary-dark outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-neutral-700 rounded text-sm focus:border-primary-dark outline-none"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 bg-primary text-background rounded text-sm font-semibold hover:bg-primary-dark"
        >
          Register
        </button>
      </form>
    </div>
  );
            }
