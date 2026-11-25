'use client';

import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useSite } from '@/contexts/SiteContext';
import { formatVnPhone, toTelHref } from '@/lib/format';

export default function Footer() {
  const { settings } = useSite();

  return (
    <footer className="border-t border-blush-pink bg-gradient-to-b from-soft-pink to-blush-pink/70 text-charcoal">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-charcoal">
            {settings.brand_name || 'BellaBridal'}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {settings.brand_tagline || 'Luxury Wedding Studio & Haute Couture Bridal'} — Cảm ơn bạn đã ghé thăm và tin chọn BellaBridal cho ngày trọng đại.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-lg font-semibold text-charcoal">Khám phá</h4>
          <ul className="mt-3 space-y-2 text-sm text-charcoal/85">
            <li><Link href="/bo-suu-tap" className="hover:text-plum">Bộ sưu tập váy cưới</Link></li>
            <li><Link href="/dich-vu" className="hover:text-plum">Dịch vụ cưới trọn gói</Link></li>
            <li><Link href="/dat-lich" className="hover:text-plum">Đặt lịch thử váy 1-1</Link></li>
            <li><Link href="/tin-tuc" className="hover:text-plum">Tạp chí & Kinh nghiệm cưới</Link></li>
            <li><Link href="/admin" className="hover:text-plum">Cổng quản trị Studio</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg font-semibold text-charcoal">Liên hệ Studio</h4>
          <ul className="mt-3 space-y-2.5 text-sm text-charcoal/85">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-plum" />
              <span>{settings.address || '128 Đồng Khởi, Quận 1, TP. HCM'}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-plum" />
              <a href={toTelHref(settings.hotline)} className="hover:text-plum">
                {formatVnPhone(settings.hotline)}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-plum" />
              <span>{settings.email || 'concierge@bellabridal.vn'}</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-plum" />
              <span>{settings.working_hours || '09:00 - 21:00 hàng ngày'}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg font-semibold text-charcoal">Đặt lịch thử váy riêng tư</h4>
          <p className="mt-3 text-sm leading-relaxed text-charcoal/85">
            Trải nghiệm phòng thử váy VIP 1-1 cùng Bridal Stylist và nhận tư vấn phom dáng miễn phí.
          </p>
          <Link href="/dat-lich" className="btn-primary mt-4 w-full justify-center">
            Đặt lịch ngay
          </Link>
        </div>
      </div>

      <div className="border-t border-rose-gold/20 py-5 text-center text-xs text-charcoal/80">
        © {new Date().getFullYear()} {settings.brand_name || 'BellaBridal Studio'}. Trân trọng cảm ơn quý khách.
      </div>
    </footer>
  );
}
