import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Heart, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Về BellaBridal Studio',
  description: 'Câu chuyện thương hiệu BellaBridal — Luxury Wedding Studio & Haute Couture Bridal tại TP. Hồ Chí Minh.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">Our Story</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Nghệ Thuật Tôn Vinh Vẻ Đẹp Cô Dâu
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Thành lập từ tâm huyết của những nhà thiết kế và Bridal Stylist hàng đầu, BellaBridal mang đến không gian
            thử váy riêng tư, sang trọng bậc nhất tại trung tâm Quận 1, TP. Hồ Chí Minh.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Mỗi thiết kế tại BellaBridal đều được tuyển chọn kỹ lưỡng từ chất liệu ren Chantilly Pháp, lụa Mikado Nhật
            Bản đến từng viên pha lê đính kết thủ công hàng trăm giờ.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-cream p-4 text-center">
              <Sparkles className="mx-auto h-5 w-5 text-rose-gold" />
              <p className="mt-2 font-serif text-xl font-semibold">250+</p>
              <p className="text-xs text-muted">Mẫu váy cao cấp</p>
            </div>
            <div className="rounded-2xl bg-cream p-4 text-center">
              <Heart className="mx-auto h-5 w-5 text-rose-gold" />
              <p className="mt-2 font-serif text-xl font-semibold">5.000+</p>
              <p className="text-xs text-muted">Cặp đôi tin chọn</p>
            </div>
            <div className="rounded-2xl bg-cream p-4 text-center">
              <Award className="mx-auto h-5 w-5 text-rose-gold" />
              <p className="mt-2 font-serif text-xl font-semibold">10 năm</p>
              <p className="text-xs text-muted">Kinh nghiệm Bridal</p>
            </div>
          </div>
          <Link href="/dat-lich" className="btn-primary mt-8">
            Đặt lịch ghé thăm Studio
          </Link>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-blush-pink/60 shadow-luxury">
          <Image
            src="https://images.unsplash.com/photo-1546193430-c2d207739ed7?auto=format&fit=crop&w=1000&q=85"
            alt="BellaBridal Studio"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
