'use client';

import { useSite } from '@/contexts/SiteContext';

export default function ZaloFloatingButton() {
  const { settings } = useSite();
  const zaloUrl = settings.zalo_url || 'https://zalo.me/84901234567';

  return (
    <a
      href={zaloUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-36 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-plum text-xs font-bold text-white shadow-lg transition-transform hover:scale-110 hover:bg-plum-dark"
      title="Chat Zalo với BellaBridal"
    >
      Zalo
    </a>
  );
}
