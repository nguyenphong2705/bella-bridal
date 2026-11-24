'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useSite } from '@/contexts/SiteContext';

export default function AdminSettingsPage() {
  const { refresh } = useSite();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState('');

  useEffect(() => {
    apiClient.get<{ data: Record<string, string> }>('/admin/settings').then((res) => setForm(res.data.data || {}));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiClient.put('/admin/settings', form);
    refresh();
    setSaved('Đã lưu cấu hình Studio!');
  };

  const fields = [
    ['brand_name', 'Tên thương hiệu'],
    ['hotline', 'Hotline'],
    ['address', 'Địa chỉ Showroom'],
    ['zalo_url', 'Link Zalo OA'],
    ['lookbook_video_url', 'URL Video Lookbook HD'],
    ['chatbot_welcome', 'Lời chào AI Chatbot'],
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-serif text-3xl font-semibold text-charcoal">Cấu Hình Website & Kênh Liên Hệ</h1>
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-blush-pink/60 bg-white p-6 shadow-card">
        {fields.map(([key, label]) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-medium text-charcoal">{label}</label>
            <input
              value={form[key] || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              className="luxury-input"
            />
          </div>
        ))}
        {saved && <p className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700">{saved}</p>}
        <button type="submit" className="btn-primary">
          Lưu cấu hình
        </button>
      </form>
    </div>
  );
}
