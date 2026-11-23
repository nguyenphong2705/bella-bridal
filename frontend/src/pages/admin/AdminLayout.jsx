import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import {
  Bot,
  CalendarCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Shirt,
  Sparkles,
  Star,
  Users,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../../components/common/Skeleton';

const menuItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/appointments', label: 'Lịch hẹn', icon: CalendarCheck },
  { to: '/admin/dresses', label: 'Váy cưới', icon: Shirt },
  { to: '/admin/services', label: 'Dịch vụ', icon: Briefcase },
  { to: '/admin/posts', label: 'Blog / Tin tức', icon: FileText },
  { to: '/admin/customers', label: 'Khách hàng', icon: Users },
  { to: '/admin/reviews', label: 'Đánh giá', icon: Star },
  { to: '/admin/chatbot', label: 'AI Chatbot', icon: Bot },
  { to: '/admin/settings', label: 'Cấu hình Web', icon: Settings },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="flex min-h-screen bg-cream/60 text-charcoal">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-blush-pink bg-ivory p-5 lg:flex">
        <Link to="/" className="flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-pink text-rose-gold-dark">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-serif text-2xl font-semibold">BellaBridal</span>
        </Link>

        <nav className="mt-8 flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-rose-gold text-white shadow-sm'
                      : 'text-charcoal hover:bg-soft-pink/70'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-blush-pink/60 pt-4">
          <p className="truncate px-2 text-xs font-medium text-charcoal">{user.name}</p>
          <p className="truncate px-2 text-[11px] uppercase text-muted">{user.role}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-x-hidden p-4 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-blush-pink/60 pb-4 lg:hidden">
          <span className="font-serif text-2xl font-semibold">BellaBridal Admin</span>
          <div className="flex flex-wrap gap-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs ${isActive ? 'bg-rose-gold text-white' : 'bg-white text-charcoal'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
