import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SiteProvider } from '@/contexts/SiteContext';
import PublicShell from '@/components/layout/PublicShell';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'BellaBridal | Cửa Hàng Váy Cưới Cao Cấp & Studio Áo Cưới Sang Trọng',
    template: '%s | BellaBridal Studio',
  },
  description:
    'BellaBridal - Studio áo cưới cao cấp hàng đầu. Cho thuê váy cưới đẹp, may đo thiết kế riêng, chụp ảnh cưới nghệ thuật và đặt lịch thử váy 1-1 trực tuyến.',
  keywords: ['váy cưới cao cấp', 'thuê váy cưới', 'studio áo cưới', 'BellaBridal', 'may váy cưới thiết kế riêng'],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'BellaBridal Studio',
    title: 'BellaBridal | Luxury Wedding Studio & Haute Couture Bridal',
    description: 'Bộ sưu tập váy cưới Haute Couture, Lookbook HD & Đặt lịch thử váy trực tuyến theo thời gian thực.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <SiteProvider>
            <PublicShell>{children}</PublicShell>
          </SiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
