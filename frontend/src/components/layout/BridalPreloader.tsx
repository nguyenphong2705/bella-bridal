'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function BridalPreloader() {
  const pathname = usePathname();
  const [navLoading, setNavLoading] = useState(false);
  const [navProgress, setNavProgress] = useState(0);
  const prevPathRef = useRef(pathname);
  const navTimerRef = useRef<number | null>(null);

  // Subtle top progress bar on client-side route transitions (non-blocking for instant page loads)
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
        setNavProgress(32);
        if (navTimerRef.current) window.clearInterval(navTimerRef.current);
        navTimerRef.current = window.setInterval(() => {
          setNavProgress((p) => (p < 88 ? p + (88 - p) * 0.25 : p));
        }, 90);
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

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      if (navTimerRef.current) window.clearInterval(navTimerRef.current);
      setNavLoading(true);
      setNavProgress(100);

      const doneTimer = window.setTimeout(() => {
        setNavLoading(false);
        setNavProgress(0);
      }, 240);

      return () => window.clearTimeout(doneTimer);
    }
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[90] h-[2.5px] transition-opacity duration-200 ${
        navLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="h-full bg-gradient-to-r from-plum via-rose-gold to-champagne shadow-[0_0_10px_rgba(110,44,62,0.45)] transition-all duration-200 ease-out"
        style={{ width: `${navProgress}%` }}
      />
    </div>
  );
}
