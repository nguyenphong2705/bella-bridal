'use client';

import Link from 'next/link';
import { Calendar } from 'lucide-react';

export default function BookingFloatingButton() {
  return (
    <Link
      href="/dat-lich"
      className="fixed bottom-20 right-5 z-40 flex h-12 items-center gap-2 rounded-full bg-plum px-4 text-xs font-semibold text-white shadow-luxury transition-transform hover:scale-105 hover:bg-plum-dark"
      title="Đặt lịch thử váy BellaBridal"
    >
      <Calendar className="h-4 w-4" />
      <span>Đặt lịch</span>
    </Link>
  );
}
