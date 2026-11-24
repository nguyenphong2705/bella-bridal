'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@bellabridal.vn');
  const [password, setPassword] = useState('Bella@2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/admin');
    } catch {
      setError('Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md rounded-3xl border border-blush-pink bg-white p-8 shadow-luxury">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-soft-pink text-rose-gold-dark">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-charcoal">BellaBridal Admin</h1>
          <p className="mt-1 text-xs text-muted">Đăng nhập cổng quản trị Studio</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="luxury-input" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal">Mật khẩu</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="luxury-input" required />
          </div>
          {error && <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-muted">
          <Link href="/" className="hover:text-rose-gold-dark">← Quay về trang chủ BellaBridal</Link>
        </div>
      </div>
    </div>
  );
}
