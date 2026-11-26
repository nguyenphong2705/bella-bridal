import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Sparkles } from 'lucide-react';

export default function HeroDressShowcase3D() {
  return (
    <section
      style={{
        background:
          'linear-gradient(180deg, #B29EA0 0%, #C4AEA9 22%, #D4B5AB 44%, #CF9F93 66%, #C58A7E 83.5%, #EAD8D1 86.5%, #DFCAC3 94%, #CEB5AF 100%)',
      }}
      className="relative w-full min-h-[760px] overflow-hidden border-b border-[#C59B95]/50 lg:h-[88vh] lg:min-h-[700px] lg:max-h-[940px]"
      aria-label="Banner cô dâu BellaBridal Haute Couture trên phông hồng đất sang trọng"
    >
      {/* Painterly Bridal Studio Cloud & Dusty-Rose Lighting Layers (original studio backdrop) */}
      <div
        aria-hidden="true"
        style={{
          background: [
            'radial-gradient(ellipse 44% 52% at 68% 40%, rgba(246, 232, 226, 0.56) 0%, rgba(220, 188, 179, 0.18) 56%, transparent 82%)',
            'radial-gradient(ellipse 52% 38% at 90% 70%, rgba(178, 112, 101, 0.48) 0%, transparent 74%)',
            'radial-gradient(ellipse 46% 36% at 38% 74%, rgba(196, 130, 118, 0.42) 0%, transparent 72%)',
            'radial-gradient(ellipse 70% 28% at 50% 0%, rgba(154, 134, 138, 0.48) 0%, transparent 76%)',
            'radial-gradient(ellipse 48% 58% at 20% 50%, rgba(248, 237, 233, 0.44) 0%, transparent 78%)',
          ].join(', '),
        }}
        className="pointer-events-none absolute inset-0"
      />

      {/* RIGHT SIDE — Static Transparent Cutout Bride in White Lace Gown */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[62%] sm:h-[66%] lg:inset-y-0 lg:left-[38%] lg:right-0 lg:h-auto">
        <div
          style={{
            filter: 'drop-shadow(-10px 14px 28px rgba(74, 42, 46, 0.24))',
          }}
          className="relative h-full w-full"
        >
          <Image
            src="/images/hero-bride-cutout.png"
            alt="Cô dâu BellaBridal trong thiết kế váy cưới ren trắng tách nền"
            fill
            priority
            draggable={false}
            sizes="(max-width: 1024px) 100vw, 62vw"
            className="select-none object-contain object-bottom"
          />
        </div>
      </div>

      {/* Mobile-only Soft Warm Bottom Veil for Text Legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#EAD8D1] via-[#E4C9C1]/90 to-transparent lg:hidden"
      />

      {/* LEFT SIDE — Original Title, Description, CTA Buttons & Studio Stats */}
      <div className="pointer-events-none relative z-10 mx-auto flex h-full min-h-[760px] max-w-7xl flex-col justify-end px-4 pb-20 pt-64 sm:px-6 lg:min-h-0 lg:justify-center lg:px-8 lg:py-16">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#5A354A] shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#9E5863]" /> HAUTE COUTURE BRIDAL 2026
          </span>

          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-[#2A1C22] drop-shadow-[0_1px_12px_rgba(255,248,245,0.45)] sm:text-5xl lg:text-6xl">
            Vẻ Đẹp Tinh Khôi Cho Ngày Trọng Đại
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-[#3E2B32]">
            Khám phá hơn 250+ tuyệt tác váy cưới nhập khẩu và thiết kế độc bản tại BellaBridal. Trải nghiệm thử váy
            riêng tư 1-1 cùng Bridal Stylist với hệ thống đặt lịch thời gian thực.
          </p>

          <div className="pointer-events-auto mt-7 flex flex-wrap gap-4">
            <Link
              href="/dat-lich"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5A354A] px-6 py-3 text-sm font-medium tracking-wide text-white shadow-lg transition-all duration-300 hover:bg-[#462739] focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <Calendar className="h-4 w-4" />
              <span>Đặt lịch thử váy ngay</span>
            </Link>
            <Link
              href="/bo-suu-tap"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/90 bg-white/88 px-6 py-3 text-sm font-medium tracking-wide text-[#2A1C22] shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white"
            >
              <span>Xem bộ sưu tập</span>
            </Link>
          </div>

          <div className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-[#4A2E38]/20 pt-5">
            <div>
              <p className="font-serif text-2xl font-semibold text-[#2A1C22]">250+</p>
              <p className="text-xs font-medium text-[#4A353D]">Thiết kế độc quyền</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-semibold text-[#2A1C22]">5.000+</p>
              <p className="text-xs font-medium text-[#4A353D]">Cô dâu hạnh phúc</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-semibold text-[#2A1C22]">1 - 1</p>
              <p className="text-xs font-medium text-[#4A353D]">Phòng thử VIP riêng tư</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
