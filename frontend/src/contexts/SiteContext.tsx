'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { SiteSettings } from '@/types';

const DEFAULT_SETTINGS: SiteSettings = {
  brand_name: 'BellaBridal',
  brand_tagline: 'Luxury Wedding Studio & Haute Couture Bridal',
  hotline: '+84 901 234 567',
  email: 'concierge@bellabridal.vn',
  address: '128 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  working_hours: '09:00 - 21:00 (Thứ 2 - Chủ Nhật)',
  zalo_url: 'https://zalo.me/84901234567',
  zalo_phone: '+84 901 234 567',
  facebook_url: 'https://facebook.com/bellabridal.vn',
  instagram_url: 'https://instagram.com/bellabridal.vn',
  chatbot_enabled: '1',
  chatbot_welcome:
    'Xin chào nàng dâu tương lai! Mình là trợ lý AI của BellaBridal. Mình có thể hỗ trợ bạn chọn váy cưới theo vóc dáng, báo giá thuê váy hoặc đặt lịch thử váy ngay hôm nay.',
};

const SiteContext = createContext<{ settings: SiteSettings; refresh: () => void }>({
  settings: DEFAULT_SETTINGS,
  refresh: () => {},
});

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  const loadSettings = () => {
    apiClient
      .get<SiteSettings>('/settings/public')
      .then((res) => setSettings((prev) => ({ ...prev, ...res.data })))
      .catch(() => {});
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return <SiteContext.Provider value={{ settings, refresh: loadSettings }}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
