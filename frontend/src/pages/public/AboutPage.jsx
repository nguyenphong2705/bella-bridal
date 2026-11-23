import { Link } from 'react-router-dom';
import { Award, CalendarHeart, HeartHandshake, Sparkles } from 'lucide-react';
import SeoHead from '../../components/seo/SeoHead';

const TEAM = [
  {
    name: 'Lê Thanh Vân',
    role: 'Founder & Creative Director',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Minh Anh',
    role: 'Senior Bridal Stylist',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Hoàng Khang',
    role: 'Lead Bridal Photographer',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
];

export default function AboutPage() {
  return (
    <>
      <SeoHead
        title="Giới Thiệu BellaBridal | Câu Chuyện Thương Hiệu &amp; Studio Áo Cưới"
        description="Tìm hiểu câu chuyện thương hiệu, tầm nhìn, sứ mệnh và đội ngũ chuyên gia tâm huyết tại BellaBridal Luxury Wedding Studio."
        canonicalPath="/gioi-thieu"
      />

      <section className="bg-cream py-14">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark">Our Story</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Câu Chuyện BellaBridal</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            Được thành lập từ niềm đam mê với thời trang cưới Haute Couture, BellaBridal tin rằng mỗi cô dâu đều xứng đáng được tỏa sáng theo cách tự nhiên và kiêu sa nhất.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-blush-pink shadow-luxury">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
            alt="Không gian thử váy sang trọng tại BellaBridal"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="font-serif text-3xl font-semibold text-charcoal">Tầm Nhìn &amp; Sứ Mệnh</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            Chúng tôi không chỉ cho thuê hay may đo một chiếc váy cưới, mà kiến tạo trọn vẹn trải nghiệm cảm xúc: từ khoảnh khắc bạn bước vào showroom ngập tràn ánh nắng, chạm tay vào từng thớ lụa Ý, đến giây phút bước lên lễ đường.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-blush-pink bg-white p-4">
              <Sparkles className="h-5 w-5 text-rose-gold" />
              <p className="mt-2 font-serif text-lg font-semibold">Chất liệu tinh tuyển</p>
            </div>
            <div className="rounded-2xl border border-blush-pink bg-white p-4">
              <HeartHandshake className="h-5 w-5 text-rose-gold" />
              <p className="mt-2 font-serif text-lg font-semibold">Tận tâm 1-1</p>
            </div>
            <div className="rounded-2xl border border-blush-pink bg-white p-4">
              <Award className="h-5 w-5 text-rose-gold" />
              <p className="mt-2 font-serif text-lg font-semibold">Phom dáng chuẩn</p>
            </div>
          </div>
          <Link to="/dat-lich" className="btn-primary mt-8">
            <CalendarHeart className="h-4 w-4" />
            Trải nghiệm không gian Studio
          </Link>
        </div>
      </section>

      <section className="bg-cream/60 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-semibold">Đội Ngũ Chuyên Gia</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {TEAM.map((m) => (
              <div key={m.name} className="overflow-hidden rounded-2xl border border-blush-pink bg-white p-4 text-center shadow-card">
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-cream">
                  <img src={m.img} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold">{m.name}</h3>
                <p className="text-xs uppercase tracking-wider text-rose-gold-dark">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
