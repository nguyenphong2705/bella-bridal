'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import BridalPreloader from './BridalPreloader';
import AiChatbotWidget from '../chat/AiChatbotWidget';
import BookingFloatingButton from '../chat/BookingFloatingButton';
import ZaloFloatingButton from '../chat/ZaloFloatingButton';

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-ivory text-charcoal">
      <BridalPreloader />
      <Header />
      <main key={pathname} className="flex-1 animate-bridal-page-enter">
        {children}
      </main>
      <Footer />
      <ZaloFloatingButton />
      <BookingFloatingButton />
      <AiChatbotWidget />
    </div>
  );
}
