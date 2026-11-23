import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../api/client';
import { formatDate } from '../../utils/format';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Kinh nghiệm chọn váy cưới', excerpt: '', content: '', status: 'published' });

  const load = () => api.get('/admin/posts').then((res) => setPosts(res.data.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/admin/posts', form);
    setShowForm(false);
    setForm({ title: '', category: 'Kinh nghiệm chọn váy cưới', excerpt: '', content: '', status: 'published' });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Xóa bài viết này?')) return;
    await api.delete(`/admin/posts/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Quản Lý Bài Viết / Blog</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="h-4 w-4" /> Viết bài mới
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="space-y-4 rounded-2xl border border-blush-pink bg-white p-6">
          <input required placeholder="Tiêu đề bài viết" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="luxury-input" />
          <input required placeholder="Danh mục" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="luxury-input" />
          <input required placeholder="Tóm tắt ngắn" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="luxury-input" />
          <textarea required rows={5} placeholder="Nội dung bài viết" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="luxury-input" />
          <button type="submit" className="btn-primary">Xuất bản bài viết</button>
        </form>
      )}

      <div className="rounded-2xl border border-blush-pink bg-white p-4 shadow-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-blush-pink/60 text-xs uppercase text-muted">
            <tr>
              <th className="py-3 pr-4">Tiêu đề</th>
              <th className="py-3 pr-4">Danh mục</th>
              <th className="py-3 pr-4">Ngày đăng</th>
              <th className="py-3 text-right">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-pink/40">
            {posts.map((p) => (
              <tr key={p.id}>
                <td className="py-3 pr-4 font-medium">{p.title}</td>
                <td className="py-3 pr-4 text-xs text-muted">{p.category}</td>
                <td className="py-3 pr-4 text-xs">{formatDate(p.published_at)}</td>
                <td className="py-3 text-right">
                  <button type="button" onClick={() => remove(p.id)} className="rounded-lg bg-rose-50 p-1.5 text-rose-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
