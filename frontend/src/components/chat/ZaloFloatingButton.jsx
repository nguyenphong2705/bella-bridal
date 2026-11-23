import { MessageCircle } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';

export default function ZaloFloatingButton() {
  const { settings } = useSite();
  const zaloUrl = settings.zalo_url || 'https://zalo.me/0901234567';

  return (
    <a
      href={zaloUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat Zalo với BellaBridal"
      title="Chat Zalo tư vấn ngay"
      className="fixed bottom-24 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full border border-white/70 bg-[#0068FF] p-3.5 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl sm:bottom-24 sm:right-6"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="sr-only">Chat Zalo</span>
    </a>
  );
}
