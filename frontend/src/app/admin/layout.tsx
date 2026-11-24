'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, LayoutDashboard, LogOut, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !user && !isLogin) {
      router.replace('/admin/login');
    }
  }, [loading, user, isLogin, router]);

  if (isLogin) return <>{children}</>;
  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-muted">Đang tải...</div>;
  }

  const nav = [
    { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/admin/appointments', label: 'Lịch hẹn & ZNS', icon: Calendar },
    { href: '/admin/dresses', label: 'Váy cưới', icon: Sparkles },
    { href: '/admin/settings', label: 'Cấu hình', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-blush-pink bg-cream p-5 md:flex">
        <Link href="/" className="font-serif text-2xl font-semibold text-charcoal">
          BellaBridal
        </Link>
        <p className="text-xs text-muted">{user.name}</p>

        <nav className="mt-8 flex-1 space-y-1.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-rose-gold text-white' : 'text-charcoal hover:bg-soft-pink'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push('/admin/login');
          }}
          className="flex items-center gap-2 rounded-xl border border-blush-pink px-3.5 py-2.5 text-sm text-charcoal hover:bg-soft-pink"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất</span>
        </button>
      </aside>

      <main className="flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}
