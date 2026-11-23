import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';

export default function Footer() {
  const { settings } = useSite();

  return (
    <footer className="border-t border-blush-pink/70 bg-cream text-charcoal">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-pink text-rose-gold-dark">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-serif text-2xl font-semibold">{settings.brand_name || 'BellaBridal'}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Studio áo cưới cao cấp tôn vinh vẻ đẹp thanh lịch, lãng mạn và độc bản của mỗi nàng dâu trong ngày trọng đại.
          </p>
        </div>

        <div>
          <h3 className="font-serif text-xl font-semibold">Khám phá</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link to="/bo-suu-tap" className="hover:text-rose-gold-dark">Bộ sưu tập váy cưới</Link></li>
            <li><Link to="/dich-vu" className="hover:text-rose-gold-dark">Dịch vụ cưới trọn gói</Link></li>
            <li><Link to="/dat-lich" className="hover:text-rose-gold-dark">Đặt lịch thử váy</Link></li>
            <li><Link to="/blog" className="hover:text-rose-gold-dark">Kinh nghiệm cưới</Link></li>
            <li><Link to="/gioi-thieu" className="hover:text-rose-gold-dark">Về BellaBridal</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-xl font-semibold">Thông tin liên hệ</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-gold" />
              <span>{settings.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-rose-gold" />
              <a href={`tel:${settings.hotline?.replace(/\s+/g, '')}`} className="hover:text-rose-gold-dark">
                {settings.hotline}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-rose-gold" />
              <a href={`mailto:${settings.email}`} className="hover:text-rose-gold-dark">
                {settings.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-rose-gold" />
              <span>{settings.working_hours}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-xl font-semibold">Kết nối &amp; Quản trị</h3>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted">
            <a href={settings.zalo_url} target="_blank" rel="noreferrer" className="hover:text-rose-gold-dark">
              Zalo Official / Tư vấn trực tiếp
            </a>
            <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-rose-gold-dark">
              Facebook Fanpage
            </a>
            <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-rose-gold-dark">
              Instagram Lookbook
            </a>
            <Link to="/admin/login" className="mt-2 inline-block text-xs text-muted/80 underline hover:text-rose-gold-dark">
              Cổng quản trị Studio
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-blush-pink/60 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {settings.brand_name || 'BellaBridal'}. All rights reserved. Luxury Bridal Studio.
      </div>
    </footer>
  );
}
