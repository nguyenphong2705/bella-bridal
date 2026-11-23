import { Link, NavLink } from 'react-router-dom';
import { CalendarHeart, Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useSite } from '../../contexts/SiteContext';

const navLinks = [
  { to: '/', label: 'Trang chủ' },
  { to: '/bo-suu-tap', label: 'Bộ sưu tập' },
  { to: '/dich-vu', label: 'Dịch vụ' },
  { to: '/gioi-thieu', label: 'Giới thiệu' },
  { to: '/blog', label: 'Tạp chí cưới' },
  { to: '/lien-he', label: 'Liên hệ' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings } = useSite();

  return (
    <header className="sticky top-0 z-40 border-b border-blush-pink/60 bg-ivory/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={settings.brand_name} className="h-9 w-auto object-contain" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-soft-pink text-rose-gold-dark">
              <Sparkles className="h-5 w-5" />
            </div>
          )}
          <div>
            <span className="block font-serif text-2xl font-semibold tracking-wide text-charcoal">
              {settings.brand_name || 'BellaBridal'}
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.22em] text-muted sm:block">
              Luxury Wedding Studio
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors hover:text-rose-gold-dark ${
                  isActive ? 'text-rose-gold-dark underline decoration-blush-pink decoration-2 underline-offset-8' : 'text-charcoal'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/dat-lich" className="btn-primary">
            <CalendarHeart className="h-4 w-4" />
            Đặt lịch thử váy
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg border border-blush-pink p-2 text-charcoal lg:hidden"
          aria-label="Mở menu điều hướng"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-blush-pink/60 bg-ivory px-4 pb-5 pt-3 lg:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-soft-pink text-rose-gold-dark' : 'text-charcoal'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/dat-lich"
              onClick={() => setMobileOpen(false)}
              className="btn-primary mt-2 w-full justify-center"
            >
              <CalendarHeart className="h-4 w-4" />
              Đặt lịch thử váy
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
