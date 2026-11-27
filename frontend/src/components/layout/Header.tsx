'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, ChevronDown, Menu, Phone, Sparkles, X } from 'lucide-react';
import { useSite } from '@/contexts/SiteContext';
import { formatVnPhone, toTelHref } from '@/lib/format';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/dich-vu', label: 'Dịch vụ' },
  { href: '/ve-chung-toi', label: 'Về chúng tôi' },
  { href: '/tin-tuc', label: 'Tạp chí cưới' },
  { href: '/lien-he', label: 'Liên hệ' },
];

const bridalTiers = [
  {
    slug: 'whispers-of-love',
    title: 'Whispers of Love',
    subtitle: 'Váy cưới giá thuê dưới 10 triệu đồng',
  },
  {
    slug: 'timeless-grace',
    title: 'Timeless Grace',
    subtitle: 'Váy cưới giá thuê 10 – 20 triệu đồng',
  },
  {
    slug: 'royal-couture',
    title: 'Royal Couture',
    subtitle: 'Váy cưới cao cấp từ 20 triệu đồng',
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { settings } = useSite();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[#EAE2DF] transition-all duration-300 backdrop-blur-md ${
        scrolled ? 'bg-white/95 shadow-card' : 'bg-[#FAF8F7]/95'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-plum/30 bg-white/80 font-serif text-xl font-semibold text-plum">
            B
          </div>
          <div>
            <span className="block font-serif text-2xl font-semibold tracking-wide text-charcoal">
              {settings.brand_name || 'BellaBridal'}
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted sm:block">
              Haute Couture Bridal
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-rose-gold-dark ${
              pathname === '/' ? 'text-rose-gold-dark underline decoration-rose-gold/60 underline-offset-8' : 'text-charcoal/85'
            }`}
          >
            Trang chủ
          </Link>

          {/* Danh mục "Váy Cưới" với menu xổ xuống khi rê chuột */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <Link
              href="/bo-suu-tap"
              className={`flex items-center gap-1 py-2 text-sm font-medium transition-colors hover:text-rose-gold-dark ${
                pathname.startsWith('/bo-suu-tap')
                  ? 'text-rose-gold-dark underline decoration-rose-gold/60 underline-offset-8'
                  : 'text-charcoal/85'
              }`}
            >
              <span>Váy Cưới</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </Link>

            {dropdownOpen && (
              <div className="absolute left-0 top-full z-50 w-72 pt-1">
                <div className="overflow-hidden rounded-2xl border border-blush-pink bg-ivory p-2 shadow-luxury">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-rose-gold-dark">
                    Phân khúc Váy Cưới
                  </div>
                  {bridalTiers.map((tier) => (
                    <Link
                      key={tier.slug}
                      href={`/bo-suu-tap?tier=${tier.slug}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-soft-pink/70"
                    >
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-rose-gold" />
                      <div>
                        <p className="font-serif text-base font-semibold text-charcoal">{tier.title}</p>
                        <p className="text-xs text-muted">{tier.subtitle}</p>
                      </div>
                    </Link>
                  ))}
                  <div className="mt-1 border-t border-blush-pink/50 pt-1">
                    <Link
                      href="/bo-suu-tap"
                      onClick={() => setDropdownOpen(false)}
                      className="block rounded-xl px-3 py-2 text-center text-xs font-medium text-rose-gold-dark hover:bg-soft-pink/50"
                    >
                      Xem tất cả 40+ mẫu váy →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {navLinks.slice(1).map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-rose-gold-dark ${
                  active ? 'text-rose-gold-dark underline decoration-rose-gold/60 underline-offset-8' : 'text-charcoal/85'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={toTelHref(settings.hotline)}
            className="flex items-center gap-1.5 text-sm font-medium text-charcoal/80 hover:text-rose-gold-dark"
          >
            <Phone className="h-4 w-4 text-rose-gold" />
            <span>{formatVnPhone(settings.hotline)}</span>
          </a>
          <Link href="/dat-lich" className="btn-primary py-2.5">
            <Calendar className="h-4 w-4" />
            <span>Đặt lịch thử váy</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-blush-pink p-2 text-charcoal lg:hidden"
          aria-label="Mở menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-blush-pink/60 bg-ivory px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            <Link href="/" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-charcoal hover:bg-soft-pink">
              Trang chủ
            </Link>
            <div className="rounded-xl border border-blush-pink/60 bg-cream/60 p-2">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-rose-gold-dark">Váy Cưới</p>
              {bridalTiers.map((tier) => (
                <Link
                  key={tier.slug}
                  href={`/bo-suu-tap?tier=${tier.slug}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-1.5 text-sm text-charcoal hover:bg-soft-pink"
                >
                  <span className="font-medium">{tier.title}</span>{' '}
                  <span className="text-xs text-muted">({tier.subtitle})</span>
                </Link>
              ))}
            </div>
            {navLinks.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-charcoal hover:bg-soft-pink"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/dat-lich" onClick={() => setOpen(false)} className="btn-primary mt-2 justify-center">
              <Calendar className="h-4 w-4" />
              <span>Đặt lịch thử váy ngay</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
