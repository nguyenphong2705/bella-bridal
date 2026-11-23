import { useEffect, useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import api from '../../api/client';
import { useSite } from '../../contexts/SiteContext';

const FIELD_LABELS = {
  brand_name: 'Tên thương hiệu',
  hotline: 'Hotline',
  email: 'Email liên hệ',
  address: 'Địa chỉ showroom',
  working_hours: 'Giờ mở cửa',
  zalo_url: 'Đường dẫn Zalo (OA hoặc zalo.me/SĐT)',
  facebook_url: 'Facebook Fanpage URL',
  logo_url: 'Link Logo (URL)',
  seo_title: 'SEO Meta Title mặc định',
  seo_description: 'SEO Meta Description mặc định',
  ga4_id: 'Google Analytics 4 ID (G-...)',
  gsc_verification: 'Google Search Console Verification Code',
  chatbot_enabled: 'Bật AI Chatbot (1 = Bật, 0 = Tắt)',
  chatbot_welcome: 'Lời chào AI Chatbot',
  chatbot_system_prompt: 'System Prompt hướng dẫn AI',
};

export default function AdminSettingsPage() {
  const { refreshSettings } = useSite();
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then((res) => {
      const map = {};
      (res.data.data || []).forEach((item) => {
        map[item.key] = item.value || '';
      });
      setForm(map);
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaved(false);
    await api.put('/admin/settings', { settings: form });
    await refreshSettings();
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Cấu Hình Website, Zalo &amp; SEO</h1>
        <p className="text-sm text-muted">Thay đổi Hotline, đường dẫn Zalo, thông tin thương hiệu và thẻ Meta SEO.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Đã lưu cấu hình website thành công!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-blush-pink bg-white p-6 shadow-card">
        {Object.entries(FIELD_LABELS).map(([key, label]) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
            {key === 'chatbot_system_prompt' || key === 'seo_description' ? (
              <textarea
                rows={3}
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="luxury-input"
              />
            ) : (
              <input
                type="text"
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="luxury-input"
              />
            )}
          </div>
        ))}

        <button type="submit" className="btn-primary">
          <Save className="h-4 w-4" /> Lưu tất cả cấu hình
        </button>
      </form>
    </div>
  );
}
