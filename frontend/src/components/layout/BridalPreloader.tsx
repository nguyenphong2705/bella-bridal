'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSite } from '@/contexts/SiteContext';

type PreloaderStage = 'loading' | 'opening' | 'done';

export default function BridalPreloader() {
  const { settings } = useSite();
  const pathname = usePathname();
  const [stage, setStage] = useState<PreloaderStage>('loading');
  const [progress, setProgress] = useState(14);

  // Top shimmer bar for client-side route transitions
  const [navLoading, setNavLoading] = useState(false);
  const [navProgress, setNavProgress] = useState(0);
  const prevPathRef = useRef(pathname);
  const navTimerRef = useRef<number | null>(null);

  // Initial page reload Silk Veil Curtain sequence
  useEffect(() => {
    let cancelled = false;
    const startTime = performance.now();
    const minDisplayMs = 820;

    // Smoothly advance silk progress thread toward 92% while waiting for resources
    const tick = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const step = prev < 55 ? 11 : prev < 80 ? 6 : 2.5;
        return Math.min(92, prev + step);
      });
    }, 85);

    const finishLoading = () => {
      if (cancelled) return;
      window.clearInterval(tick);
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, minDisplayMs - elapsed);

      window.setTimeout(() => {
        if (cancelled) return;
        setProgress(100);

        window.setTimeout(() => {
          if (cancelled) return;
          setStage('opening');

          window.setTimeout(() => {
            if (!cancelled) setStage('done');
          }, 820);
        }, 160);
      }, remaining);
    };

    // Wait for window load + web fonts (with a crisp upper bound so reload never feels sluggish)
    const fontsPromise =
      typeof document !== 'undefined' && 'fonts' in document
        ? Promise.race([
            document.fonts.ready,
            new Promise((resolve) => window.setTimeout(resolve, 650)),
          ])
        : Promise.resolve();

    const loadPromise =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            window.addEventListener('load', () => resolve(), { once: true });
            window.setTimeout(resolve, 900);
          });

    Promise.all([fontsPromise, loadPromise]).then(finishLoading);

    // Absolute safety fallback
    const safetyTimer = window.setTimeout(finishLoading, 1400);

    return () => {
      cancelled = true;
      window.clearInterval(tick);
      window.clearTimeout(safetyTimer);
    };
  }, []);

  // Intercept internal link clicks to start the subtle top rose-gold route bar immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        anchor.target === '_blank'
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;

        setNavLoading(true);
        setNavProgress(28);
        if (navTimerRef.current) window.clearInterval(navTimerRef.current);
        navTimerRef.current = window.setInterval(() => {
          setNavProgress((p) => (p < 88 ? p + (88 - p) * 0.22 : p));
        }, 120);
      } catch {
        // Ignore malformed hrefs
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      if (navTimerRef.current) window.clearInterval(navTimerRef.current);
    };
  }, []);

  // Complete route progress bar when pathname updates
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      if (navTimerRef.current) window.clearInterval(navTimerRef.current);
      setNavLoading(true);
      setNavProgress(100);

      const doneTimer = window.setTimeout(() => {
        setNavLoading(false);
        setNavProgress(0);
      }, 360);

      return () => window.clearTimeout(doneTimer);
    }
  }, [pathname]);

  const brandName = settings.brand_name || 'BellaBridal';
  const isOpening = stage === 'opening';

  return (
    <>
      {/* If JS is disabled, never block the page */}
      <noscript>
        <style>{`.bridal-reload-curtain { display: none !important; }`}</style>
      </noscript>

      {/* Top Rose-Gold & Champagne Shimmer Bar on Route Transitions */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 z-[90] h-[2.5px] transition-opacity duration-300 ${
          navLoading ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="h-full bg-gradient-to-r from-plum via-rose-gold to-champagne shadow-[0_0_12px_rgba(183,110,121,0.65)] transition-all duration-300 ease-out"
          style={{ width: `${navProgress}%` }}
        />
      </div>

      {/* Full-Screen Haute Couture Silk Curtain Preloader on Page Reload */}
      {stage !== 'done' && (
        <div
          aria-hidden="true"
          className={`bridal-reload-curtain fixed inset-0 z-[100] flex items-center justify-center overflow-hidden ${
            isOpening ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          {/* Left Silk Veil Panel */}
          <div
            className={`bridal-curtain-ease absolute inset-y-0 left-0 w-1/2 border-r border-champagne/30 bg-gradient-to-br from-ivory via-cream to-soft-lavender/85 transition-transform duration-[800ms] ${
              isOpening ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,rgba(248,225,230,0.45),transparent_65%)]" />
            <div className="absolute inset-y-8 right-3 w-px bg-gradient-to-b from-transparent via-champagne/35 to-transparent" />
          </div>

          {/* Right Silk Veil Panel */}
          <div
            className={`bridal-curtain-ease absolute inset-y-0 right-0 w-1/2 border-l border-champagne/30 bg-gradient-to-bl from-ivory via-cream to-soft-pink/75 transition-transform duration-[800ms] ${
              isOpening ? 'translate-x-full' : 'translate-x-0'
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(239,232,246,0.55),transparent_65%)]" />
            <div className="absolute inset-y-8 left-3 w-px bg-gradient-to-b from-transparent via-champagne/35 to-transparent" />
          </div>

          {/* Central Bridal Crest, Interlocking Rings & Monogram */}
          <div
            className={`relative z-10 flex flex-col items-center px-6 text-center transition-all duration-500 ease-out ${
              isOpening ? 'scale-95 -translate-y-3 opacity-0' : 'scale-100 translate-y-0 opacity-100'
            }`}
          >
            {/* Emblem Medallion */}
            <div className="relative flex h-28 w-28 items-center justify-center">
              {/* Soft Pearl Aura */}
              <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-soft-pink/80 via-ivory to-soft-lavender/90 blur-md" />

              {/* Rotating Dotted Pearl Halo */}
              <svg
                viewBox="0 0 120 120"
                className="animate-bridal-halo absolute inset-0 h-full w-full text-champagne/55"
                fill="none"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="0.9"
                  strokeDasharray="2 6"
                  strokeLinecap="round"
                />
              </svg>

              {/* Interlocking Wedding Rings & Solitaire Diamond SVG */}
              <svg viewBox="0 0 120 120" className="relative h-24 w-24" fill="none">
                <defs>
                  <linearGradient id="bellaRingGrad" x1="15%" y1="10%" x2="85%" y2="90%">
                    <stop offset="0%" stopColor="#D4AF7A" />
                    <stop offset="50%" stopColor="#B76E79" />
                    <stop offset="100%" stopColor="#6D4C7D" />
                  </linearGradient>
                </defs>

                {/* Solitaire Diamond Crown at Top */}
                <path
                  d="M60 15 L66 21 L60 29 L54 21 Z"
                  stroke="url(#bellaRingGrad)"
                  strokeWidth="1.3"
                  fill="rgba(255, 253, 252, 0.9)"
                  className="animate-bridal-ring"
                />
                <path
                  d="M54 21 H66"
                  stroke="#D4AF7A"
                  strokeWidth="0.9"
                  opacity="0.8"
                />

                {/* Outer Couture Crest Ring */}
                <circle
                  cx="60"
                  cy="63"
                  r="35"
                  stroke="url(#bellaRingGrad)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  className="animate-bridal-ring"
                />

                {/* Subtle Offset Second Wedding Band */}
                <circle
                  cx="60"
                  cy="63"
                  r="30.5"
                  stroke="#D4AF7A"
                  strokeOpacity="0.45"
                  strokeWidth="0.85"
                />
              </svg>

              {/* Swarovski Starlight Accents */}
              <span
                className="animate-bridal-sparkle absolute right-3 top-3 text-xs text-champagne"
                style={{ animationDelay: '0.1s' }}
              >
                ✦
              </span>
              <span
                className="animate-bridal-sparkle absolute bottom-4 left-2.5 text-[10px] text-rose-gold"
                style={{ animationDelay: '0.85s' }}
              >
                ✦
              </span>

              {/* Central Serif Monogram */}
              <span className="pointer-events-none absolute translate-y-[2px] font-serif text-3xl font-semibold tracking-wider text-plum">
                {brandName.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Brand Title & Atelier Tagline */}
            <div className="mt-3">
              <p className="font-serif text-3xl font-semibold tracking-[0.08em] text-charcoal sm:text-4xl">
                {brandName}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.32em] text-rose-gold-dark">
                Haute Couture Bridal
              </p>
            </div>

            {/* Ultra-fine Silk Progress Thread */}
            <div className="mt-6 w-48 sm:w-56">
              <div className="h-[2px] w-full overflow-hidden rounded-full bg-lavender-deep/80">
                <div
                  className="animate-bridal-shimmer h-full rounded-full bg-gradient-to-r from-plum via-rose-gold to-champagne transition-[width] duration-200 ease-out"
                  style={{ width: `${Math.round(progress)}%` }}
                />
              </div>
              <p className="mt-2.5 font-serif text-xs italic tracking-wide text-muted/90">
                Đang nâng niu từng tà voan cưới...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
