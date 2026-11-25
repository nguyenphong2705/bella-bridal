'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, MoveHorizontal, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';

const MAX_DRAG_Y = 30;
const MAX_DRAG_X = 9;
const MAX_HOVER_Y = 15;
const MAX_HOVER_X = 5.5;
const SPRING_STIFFNESS = 0.062;
const SPRING_DAMPING = 0.81;

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export default function HeroDressShowcase3D() {
  const bannerRef = useRef<HTMLElement | null>(null);
  const dressPlaneRef = useRef<HTMLDivElement | null>(null);
  const floorShadowRef = useRef<HTMLDivElement | null>(null);
  const centerLayerRef = useRef<HTMLDivElement | null>(null);
  const leftLayerRef = useRef<HTMLDivElement | null>(null);
  const rightLayerRef = useRef<HTMLDivElement | null>(null);
  const angleBadgeRef = useRef<HTMLSpanElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [autoSpin, setAutoSpin] = useState(true);

  const physicsRef = useRef({
    currentY: 0,
    currentX: 0,
    velY: 0,
    velX: 0,
    baseY: 0,
    baseX: 0,
    hoverY: 0,
    hoverX: 0,
    dragging: false,
    hovered: false,
    startClientX: 0,
    startClientY: 0,
    startBaseY: 0,
    startBaseX: 0,
    autoPhase: 0,
  });

  const autoSpinRef = useRef(autoSpin);
  autoSpinRef.current = autoSpin;

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.667, 2.5);
      lastTime = now;
      const p = physicsRef.current;

      // Slow, steady, smooth autonomous 3D motion when idle
      let idleOffsetY = 0;
      let idleOffsetX = 0;
      if (autoSpinRef.current && !p.dragging && !p.hovered) {
        p.autoPhase += 0.011 * dt;
        idleOffsetY = Math.sin(p.autoPhase) * 17;
        idleOffsetX = Math.cos(p.autoPhase * 0.5) * 2;
      }

      const targetY = clamp(p.baseY + p.hoverY + idleOffsetY, -MAX_DRAG_Y, MAX_DRAG_Y);
      const targetX = clamp(p.baseX + p.hoverX + idleOffsetX, -MAX_DRAG_X, MAX_DRAG_X);

      // Spring-like damping for natural, blur-free rotation
      const forceY = (targetY - p.currentY) * SPRING_STIFFNESS;
      const forceX = (targetX - p.currentX) * SPRING_STIFFNESS;

      p.velY = (p.velY + forceY * dt) * Math.pow(SPRING_DAMPING, dt);
      p.velX = (p.velX + forceX * dt) * Math.pow(SPRING_DAMPING, dt);

      p.currentY += p.velY * dt;
      p.currentX += p.velX * dt;

      const rotY = p.currentY;
      const rotX = p.currentX;

      // Apply 3D perspective rotation & dynamic silhouette drop-shadow directly to cutout PNG
      if (dressPlaneRef.current) {
        const shiftX = (rotY * 0.45).toFixed(2);
        const dropShadowX = (-rotY * 1.4).toFixed(2);
        const dropShadowY = (18 + rotX * 0.85).toFixed(2);
        const subtleLight = (1.02 + rotY * 0.0012).toFixed(4);
        dressPlaneRef.current.style.transform = `translate3d(${shiftX}px, 0, 0) rotateX(${rotX.toFixed(3)}deg) rotateY(${rotY.toFixed(3)}deg)`;
        dressPlaneRef.current.style.filter = `drop-shadow(${dropShadowX}px ${dropShadowY}px 30px rgba(74, 42, 46, 0.28)) brightness(${subtleLight})`;
      }

      // Complementary cross-fade across transparent PNG angles so silhouettes stay crisp
      if (centerLayerRef.current && leftLayerRef.current && rightLayerRef.current) {
        const leftOpacity = rotY < -3 ? clamp((Math.abs(rotY) - 3) / 17, 0, 1) : 0;
        const rightOpacity = rotY > 3 ? clamp((rotY - 3) / 17, 0, 1) : 0;
        const sideMax = Math.max(leftOpacity, rightOpacity);
        const centerOpacity = clamp(1 - sideMax * 0.92, 0, 1);

        centerLayerRef.current.style.opacity = centerOpacity.toFixed(3);
        leftLayerRef.current.style.opacity = leftOpacity.toFixed(3);
        rightLayerRef.current.style.opacity = rightOpacity.toFixed(3);
      }

      // Shifting floor shadow beneath the gown train on the studio floor
      if (floorShadowRef.current) {
        const shadowX = (-rotY * 1.65).toFixed(2);
        const shadowScale = (1 - Math.abs(rotY) * 0.0025).toFixed(3);
        floorShadowRef.current.style.transform = `translateX(${shadowX}px) scaleX(${shadowScale})`;
      }

      if (angleBadgeRef.current) {
        const rounded = Math.round(rotY);
        angleBadgeRef.current.textContent = `${rounded > 0 ? `+${rounded}` : rounded}°`;
      }

      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    const p = physicsRef.current;
    p.dragging = true;
    p.startClientX = e.clientX;
    p.startClientY = e.clientY;
    p.startBaseY = p.baseY;
    p.startBaseX = p.baseX;
    p.hoverY = 0;
    p.hoverX = 0;
    setAutoSpin(false);
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const p = physicsRef.current;
    const el = bannerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    if (p.dragging) {
      const deltaX = e.clientX - p.startClientX;
      const deltaY = e.clientY - p.startClientY;
      p.baseY = clamp(p.startBaseY + (deltaX / rect.width) * 72, -MAX_DRAG_Y, MAX_DRAG_Y);
      p.baseX = clamp(p.startBaseX - (deltaY / rect.height) * 24, -MAX_DRAG_X, MAX_DRAG_X);
      return;
    }

    p.hovered = true;
    const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    p.hoverY = clamp(normX * MAX_HOVER_Y, -MAX_HOVER_Y, MAX_HOVER_Y);
    p.hoverX = clamp(-normY * MAX_HOVER_X, -MAX_HOVER_X, MAX_HOVER_X);
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLElement>) => {
    const p = physicsRef.current;
    if (p.dragging) {
      p.dragging = false;
      setIsDragging(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
  };

  const handlePointerLeave = () => {
    const p = physicsRef.current;
    p.hovered = false;
    p.hoverY = 0;
    p.hoverX = 0;
  };

  const handleReset = useCallback(() => {
    const p = physicsRef.current;
    p.baseY = 0;
    p.baseX = 0;
    p.hoverY = 0;
    p.hoverX = 0;
    p.autoPhase = 0;
    setAutoSpin(false);
  }, []);

  return (
    <section
      ref={bannerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      onPointerLeave={handlePointerLeave}
      style={{
        background:
          'linear-gradient(180deg, #B29EA0 0%, #C4AEA9 22%, #D4B5AB 44%, #CF9F93 66%, #C58A7E 83.5%, #EAD8D1 86.5%, #DFCAC3 94%, #CEB5AF 100%)',
      }}
      className={`relative w-full min-h-[760px] overflow-hidden border-b border-[#C59B95]/50 select-none touch-pan-y lg:h-[88vh] lg:min-h-[700px] lg:max-h-[940px] ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      aria-label="Banner váy cưới Haute Couture 3D tách nền trên phông hồng đất sang trọng — kéo hoặc di chuột để xoay váy"
    >
      {/* Painterly Bridal Studio Cloud & Dusty-Rose Lighting Layers (matching reference studio backdrop) */}
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

      {/* RIGHT SIDE — Full-Size Transparent Cutout White 3D Wedding Gown */}
      <div
        style={{ perspective: '1400px' }}
        className="pointer-events-none absolute inset-x-0 top-2 h-[55%] sm:h-[59%] lg:inset-y-2 lg:left-[36%] lg:right-0 lg:h-auto"
      >
        <div
          ref={dressPlaneRef}
          style={{
            transformStyle: 'preserve-3d',
            willChange: 'transform, filter',
          }}
          className="relative h-full w-full"
        >
          {/* Base Front Cutout PNG (Transparent Background) */}
          <div ref={centerLayerRef} style={{ willChange: 'opacity' }} className="absolute inset-0">
            <Image
              src="/images/hero-gown-center.png"
              alt="BellaBridal Aurelia Alençon Haute Couture Wedding Gown — Tách nền chính diện"
              fill
              priority
              draggable={false}
              sizes="(max-width: 1024px) 100vw, 64vw"
              className="object-contain object-center scale-[1.06] lg:scale-[1.1]"
            />
          </div>

          {/* Left 3/4 Cutout PNG (Transparent Background) */}
          <div
            ref={leftLayerRef}
            style={{ opacity: 0, willChange: 'opacity' }}
            className="absolute inset-0"
          >
            <Image
              src="/images/hero-gown-left.png"
              alt="BellaBridal Aurelia Alençon Haute Couture Wedding Gown — Tách nền góc trái"
              fill
              draggable={false}
              sizes="(max-width: 1024px) 100vw, 64vw"
              className="object-contain object-center scale-[1.06] lg:scale-[1.1]"
            />
          </div>

          {/* Right 3/4 Cutout PNG (Transparent Background) */}
          <div
            ref={rightLayerRef}
            style={{ opacity: 0, willChange: 'opacity' }}
            className="absolute inset-0"
          >
            <Image
              src="/images/hero-gown-right.png"
              alt="BellaBridal Aurelia Alençon Haute Couture Wedding Gown — Tách nền góc phải"
              fill
              draggable={false}
              sizes="(max-width: 1024px) 100vw, 64vw"
              className="object-contain object-center scale-[1.06] lg:scale-[1.1]"
            />
          </div>
        </div>

        {/* Dynamic Shifting Floor Shadow Underneath Transparent Gown Hem */}
        <div
          ref={floorShadowRef}
          aria-hidden="true"
          className="absolute bottom-3 left-1/2 -ml-[26%] h-7 w-[52%] rounded-full bg-[#5C3A3A]/28 blur-xl"
        />
      </div>

      {/* Mobile-only Soft Warm Bottom Veil for Text Legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#EAD8D1] via-[#E4C9C1]/90 to-transparent lg:hidden"
      />

      {/* LEFT SIDE — Title, Description, CTA Buttons & Studio Stats */}
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

      {/* BOTTOM-RIGHT FLOATING 3D SHOWCASE CONTROLS & RESET BUTTON */}
      <div className="pointer-events-auto absolute bottom-4 right-4 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-white/90 bg-white/88 px-3.5 py-2 shadow-card backdrop-blur-md sm:bottom-6 sm:right-8">
        <div className="hidden pr-1 sm:block">
          <p className="font-serif text-sm font-semibold leading-tight text-[#2A1C22]">Aurelia Alençon Couture</p>
          <p className="flex items-center gap-1 text-[11px] text-[#5E4950]">
            <MoveHorizontal className="h-3 w-3 text-[#8C4A58]" />
            <span>Kéo / di chuột xoay 3D</span>
          </p>
        </div>

        <span
          ref={angleBadgeRef}
          className="rounded-lg bg-[#F5E6E4] px-2 py-1 font-mono text-xs font-semibold text-[#6D3B47]"
        >
          0°
        </span>

        <button
          type="button"
          onClick={() => setAutoSpin((v) => !v)}
          className="inline-flex items-center gap-1 rounded-xl border border-[#E5CECB] bg-[#FAF0EE] px-2.5 py-1.5 text-xs font-medium text-[#5A354A] transition-colors hover:bg-[#F2E0DD]"
          title={autoSpin ? 'Tạm dừng tự xoay' : 'Bật tự xoay chậm'}
        >
          {autoSpin ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span>{autoSpin ? 'Dừng' : 'Tự xoay'}</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 rounded-xl border border-[#5A354A]/25 bg-white px-3 py-1.5 text-xs font-medium text-[#2A1C22] transition-all hover:border-[#5A354A] hover:bg-[#FAF0EE] focus:outline-none focus:ring-2 focus:ring-white/80"
          title="Đặt lại góc nhìn chính diện (0°)"
        >
          <RotateCcw className="h-3.5 w-3.5 text-[#9E5863]" />
          <span>Đặt lại</span>
        </button>
      </div>
    </section>
  );
}
