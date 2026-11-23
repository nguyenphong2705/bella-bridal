import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const defaultSettings = {
  brand_name: 'BellaBridal',
  brand_tagline: 'Luxury Wedding Studio & Haute Couture Bridal',
  hotline: '0901 234 567',
  email: 'concierge@bellabridal.vn',
  address: '128 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  working_hours: '09:00 - 21:00 (Thứ 2 - Chủ Nhật)',
  zalo_url: 'https://zalo.me/0901234567',
  facebook_url: 'https://facebook.com/bellabridal.vn',
  instagram_url: 'https://instagram.com/bellabridal.vn',
  google_maps_embed: 'https://www.google.com/maps?q=128+Dong+Khoi,+Quan+1,+Ho+Chi+Minh&output=embed',
  seo_title: 'BellaBridal | Cửa Hàng Váy Cưới Cao Cấp & Studio Áo Cưới Sang Trọng',
  seo_description: 'BellaBridal - Studio áo cưới cao cấp. Thuê váy cưới đẹp, may đo thiết kế riêng, chụp ảnh cưới và dịch vụ cưới trọn gói.',
  chatbot_enabled: '1',
  chatbot_welcome: 'Xin chào nàng dâu tương lai! Mình là trợ lý AI của BellaBridal. Mình có thể hỗ trợ bạn chọn váy cưới theo vóc dáng, báo giá dịch vụ hoặc đặt lịch thử váy ngay hôm nay.',
};

const SiteContext = createContext({ settings: defaultSettings, refreshSettings: () => {} });

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);

  const refreshSettings = async () => {
    try {
      const { data } = await api.get('/settings/public');
      if (data?.data) {
        setSettings((prev) => ({ ...prev, ...data.data }));
      }
    } catch {
      // Giữ defaultSettings khi API chưa sẵn sàng
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SiteContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  return useContext(SiteContext);
}
