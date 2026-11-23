import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Thông tin đăng nhập không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md rounded-3xl border border-blush-pink bg-ivory p-8 shadow-luxury">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-soft-pink text-rose-gold-dark">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-charcoal">BellaBridal Admin</h1>
          <p className="mt-1 text-xs text-muted">Đăng nhập cổng quản trị Studio</p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Email quản trị</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bellabridal.vn"
              className="luxury-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="luxury-input"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            <Lock className="h-4 w-4" />
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted hover:text-rose-gold-dark">
            ← Quay lại trang chủ BellaBridal
          </Link>
        </div>
      </div>
    </div>
  );
}
