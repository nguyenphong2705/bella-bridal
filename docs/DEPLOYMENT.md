# Hướng Dẫn Cài Đặt & Triển Khai BellaBridal

## 1. Yêu cầu hệ thống
- PHP >= 8.2, Composer
- Node.js >= 20, npm
- MySQL >= 8.0 hoặc PostgreSQL >= 15 (hoặc SQLite cho môi trường dev)

## 2. Cài đặt Backend (Laravel 11)
```bash
cd bella-bridal/backend
cp .env.example .env
composer install
php artisan key:generate
```
Cập nhật thông tin Database, SMTP Mail và `OPENAI_API_KEY` trong `.env`:
```env
DB_CONNECTION=mysql
DB_DATABASE=bella_bridal
DB_USERNAME=root
DB_PASSWORD=your_password

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```
Chạy migration, seed dữ liệu mẫu và tạo storage link:
```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```
Chạy kiểm thử Backend:
```bash
php artisan test
```

## 3. Cài đặt Frontend (React + Vite)
```bash
cd bella-bridal/frontend
npm install
npm run dev
```
Build Production:
```bash
npm run build
```

## 4. Triển khai Production
1. Backend: cấu hình Nginx trỏ `root` vào `backend/public`, bật `APP_ENV=production`, `APP_DEBUG=false`, chạy `php artisan config:cache && php artisan route:cache`.
2. Frontend: deploy thư mục `frontend/dist` lên Nginx / Vercel / Cloudflare Pages với biến `VITE_API_URL=https://api.yourdomain.com/api/v1`.
3. Khai báo `sitemap.xml` (`https://api.yourdomain.com/sitemap.xml`) trong Google Search Console và nhập mã GA4 + GSC trong trang Admin -> Cấu hình Web.
