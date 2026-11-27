'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { HeroBanner } from '@/types';

const FALLBACK_BANNERS: HeroBanner[] = [
  {
    id: 1,
    badge: 'HAUTE COUTURE BRIDAL 2026',
    title: 'Vẻ Đẹp Tinh Khôi Cho Ngày Trọng Đại',
    subtitle:
      'Khám phá hơn 250+ tuyệt tác váy cưới nhập khẩu và thiết kế độc bản tại BellaBridal. Trải nghiệm thử váy riêng tư 1-1 cùng Bridal Stylist với hệ thống đặt lịch thời gian thực.',
    image_url: '/images/hero-slide-1.png',
    bg_gradient:
      'linear-gradient(180deg, #B59CA0 0%, #C8ADA8 24%, #D7B8B0 48%, #CE9F97 72%, #EADBD6 92%, #DFCCC6 100%)',
    cta_text: 'Đặt lịch thử váy ngay',
    cta_link: '/dat-lich',
    secondary_cta_text: 'Xem bộ sưu tập',
    secondary_cta_link: '/bo-suu-tap',
    sort_order: 1,
    is_active: 1,
  },
  {
    id: 2,
    badge: 'ETHEREAL FLORAL COUTURE',
    title: 'Nét Duyên Mơ Màng Trong Từng Cánh Hoa',
    subtitle:
      'Thiết kế ren hoa 3D thủ công kết hợp voan lưới Pháp siêu nhẹ, tôn vinh nét thanh thoát dịu dàng cho nàng dâu hiện đại.',
    image_url: '/images/hero-slide-2.png',
    bg_gradient:
      'linear-gradient(180deg, #B8ADB8 0%, #CCC0C8 24%, #DFD0D4 48%, #D3B8BE 72%, #EFE5E6 92%, #E5D7D9 100%)',
    cta_text: 'Đặt lịch thử váy ngay',
    cta_link: '/dat-lich',
    secondary_cta_text: 'Xem bộ sưu tập',
    secondary_cta_link: '/bo-suu-tap',
    sort_order: 2,
    is_active: 1,
  },
  {
    id: 3,
    badge: 'ROYAL MERMAID SILHOUETTE',
    title: 'Đường Cong Kiêu Sa & Thanh Lịch Vượt Thời Gian',
    subtitle:
      'Phom dáng đuôi cá trễ vai ôm trọn nét quyến rũ tinh tế, đi kèm khăn voan dài thướt tha dành riêng cho lễ đường.',
    image_url: '/images/hero-slide-3.png',
    bg_gradient:
      'linear-gradient(180deg, #B6BCB3 0%, #C8CDC2 24%, #DBD9CF 48%, #D4C7BC 72%, #EDE7E1 92%, #E3DBD3 100%)',
    cta_text: 'Đặt lịch thử váy ngay',
    cta_link: '/dat-lich',
    secondary_cta_text: 'Xem bộ sưu tập',
    secondary_cta_link: '/bo-suu-tap',
    sort_order: 3,
    is_active: 1,
  },
  {
    id: 4,
    badge: 'TIMELESS SATIN EDITION',
    title: 'Ánh Hào Quang Rạng Rỡ Ngày Hạnh Phúc',
    subtitle:
      'Chất liệu lụa Satin cao cấp nhập khẩu Ý với đường cắt tối giản chuẩn xác, giúp cô dâu tỏa sáng tự nhiên trong mọi khoảnh khắc.',
    image_url: '/images/hero-slide-4.png',
    bg_gradient:
      'linear-gradient(180deg, #BCAA98 0%, #CEBBA8 24%, #E0CEC0 48%, #D6B9A6 72%, #F1E5DC 92%, #E8D9CE 100%)',
    cta_text: 'Đặt lịch thử váy ngay',
    cta_link: '/dat-lich',
    secondary_cta_text: 'Xem bộ sưu tập',
    secondary_cta_link: '/bo-suu-tap',
    sort_order: 4,
    is_active: 1,
  },
];

export default function HeroDressShowcase3D({ banners }: { banners?: HeroBanner[] }) {
  const slides = banners && banners.length > 0 ? banners : FALLBACK_BANNERS;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length, paused]);

  const current = slides[activeIndex % slides.length];

  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % slides.length);

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        background:
          current.bg_gradient ||
          'linear-gradient(180deg, #B59CA0 0%, #C8ADA8 24%, #D7B8B0 48%, #CE9F97 72%, #EADBD6 92%, #DFCCC6 100%)',
      }}
      className="relative w-full min-h-[760px] overflow-hidden border-b border-[#C59B95]/40 transition-[background] duration-700 lg:h-[88vh] lg:min-h-[700px] lg:max-h-[940px]"
      aria-label="Banner cô dâu BellaBridal Haute Couture"
    >
      {/* Painterly Bridal Studio Lighting Layers */}
      <div
        aria-hidden="true"
        style={{
          background: [
            'radial-gradient(ellipse 44% 52% at 68% 40%, rgba(255, 248, 244, 0.56) 0%, rgba(235, 215, 208, 0.18) 56%, transparent 82%)',
            'radial-gradient(ellipse 52% 38% at 90% 70%, rgba(185, 145, 138, 0.34) 0%, transparent 74%)',
            'radial-gradient(ellipse 48% 58% at 20% 50%, rgba(255, 250, 247, 0.45) 0%, transparent 78%)',
          ].join(', '),
        }}
        className="pointer-events-none absolute inset-0"
      />

      {/* RIGHT SIDE — Cutout Bride Carousel */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[62%] sm:h-[66%] lg:inset-y-0 lg:left-[38%] lg:right-0 lg:h-auto">
        {slides.map((slide, idx) => {
          const isCurrent = idx === activeIndex % slides.length;
          return (
            <div
              key={slide.id ?? idx}
              style={{
                filter: 'drop-shadow(-10px 14px 28px rgba(74, 42, 46, 0.22))',
              }}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                isCurrent ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-6 scale-[0.98] opacity-0'
              }`}
            >
              <Image
                src={slide.image_url}
                alt={slide.title}
                fill
                priority={idx === 0}
                unoptimized
                draggable={false}
                sizes="(max-width: 1024px) 100vw, 62vw"
                className="select-none object-contain object-bottom"
              />
            </div>
          );
        })}
      </div>

      {/* Left-to-right soft cream/white veil for crisp text legibility */}
      <div
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(90deg, rgba(255, 250, 247, 0.78) 0%, rgba(253, 245, 242, 0.54) 38%, rgba(250, 238, 234, 0.18) 62%, transparent 82%)',
        }}
        className="pointer-events-none absolute inset-0"
      />

      {/* Mobile-only Soft Warm Bottom Veil for Text Legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#EAD8D1] via-[#E4C9C1]/90 to-transparent lg:hidden"
      />

      {/* LEFT SIDE — Title, Description, CTA Buttons & Studio Stats */}
      <div className="pointer-events-none relative z-10 mx-auto flex h-full min-h-[760px] max-w-7xl flex-col justify-end px-4 pb-20 pt-64 sm:px-6 lg:min-h-0 lg:justify-center lg:px-8 lg:py-16">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-plum shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#9E5863]" /> {current.badge}
          </span>

          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-[#2B2426] drop-shadow-[0_1px_12px_rgba(255,248,245,0.45)] sm:text-5xl lg:text-6xl">
            {current.title}
          </h1>

          {current.subtitle && (
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[#47383C]">{current.subtitle}</p>
          )}

          <div className="pointer-events-auto mt-7 flex flex-wrap gap-4">
            <Link
              href={current.cta_link || '/dat-lich'}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-plum px-6 py-3 text-sm font-medium tracking-wide text-white shadow-lg transition-all duration-300 hover:bg-plum-dark focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <Calendar className="h-4 w-4" />
              <span>{current.cta_text || 'Đặt lịch thử váy ngay'}</span>
            </Link>
            <Link
              href={current.secondary_cta_link || '/bo-suu-tap'}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/75 bg-[rgba(255,255,255,0.40)] px-6 py-3 text-sm font-medium tracking-wide text-[#2B2426] shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-[rgba(255,255,255,0.68)]"
            >
              <span>{current.secondary_cta_text || 'Xem bộ sưu tập'}</span>
            </Link>
          </div>

          <div className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-[#4A2E38]/20 pt-5">
            <div>
              <p className="font-serif text-2xl font-semibold text-[#2B2426]">250+</p>
              <p className="text-xs font-medium text-[#5E5356]">Thiết kế độc quyền</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-semibold text-[#2B2426]">5.000+</p>
              <p className="text-xs font-medium text-[#5E5356]">Cô dâu hạnh phúc</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-semibold text-[#2B2426]">1 - 1</p>
              <p className="text-xs font-medium text-[#5E5356]">Phòng thử VIP riêng tư</p>
            </div>
          </div>

          {/* Subtle Carousel Controls */}
          {slides.length > 1 && (
            <div className="pointer-events-auto mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Banner trước"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/50 text-[#2B2426] backdrop-blur-md transition-colors hover:bg-white/85"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {slides.map((s, idx) => (
                  <button
                    key={s.id ?? idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Chọn banner ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeIndex % slides.length ? 'w-7 bg-plum' : 'w-2 bg-[#2B2426]/25 hover:bg-[#2B2426]/45'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Banner tiếp theo"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/50 text-[#2B2426] backdrop-blur-md transition-colors hover:bg-white/85"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
