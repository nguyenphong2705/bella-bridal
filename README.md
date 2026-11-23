# BellaBridal — Luxury Wedding Studio & Bridal Shop

Website thương mại dịch vụ cao cấp dành cho cửa hàng áo cưới **BellaBridal**, xây dựng trên kiến trúc **Laravel 11 RESTful API + ReactJS (Vite + Tailwind CSS)**.

## Tính năng chính
- **Trang chủ & Showroom Online**: Hero Banner, Bộ sưu tập nổi bật, 7 Dịch vụ cưới, Quy trình 4 bước, Khách hàng thực tế, Đánh giá, Tạp chí cưới.
- **Bộ sưu tập & Lọc thông minh**: 6 danh mục váy cưới, lọc theo kiểu dáng, mức giá, tìm kiếm debounce, chi tiết sản phẩm & gallery ảnh.
- **Đặt lịch thử váy trực tuyến**: Kiểm tra khung giờ còn trống theo ngày, khóa trùng lịch ở mức transaction DB, gửi email xác nhận SMTP.
- **AI Chatbot Tư vấn 24/7**: Kết nối OpenAI-compatible API qua Backend (`.env`), tư vấn dựa trên dữ liệu váy/dịch vụ/FAQ thực tế, giới hạn tin nhắn chống spam, nút chuyển sang nhân viên tư vấn.
- **Tích hợp Zalo**: Nút chat Zalo cố định góc dưới màn hình, dễ dàng thay đổi URL/SĐT trong Admin.
- **Admin Dashboard**: Thống kê tổng quan, quản lý Váy cưới, Lịch hẹn (ngày/tuần/tháng), Dịch vụ, Blog, Khách hàng, Đánh giá, Cấu hình Web & Chatbot.
- **SEO & Bảo mật**: Meta Tags, Open Graph, Canonical, Schema.org JSON-LD, `sitemap.xml` tự động, `robots.txt`, Sanctum Auth, Rate Limiting, Validation.

## Tài khoản Admin mặc định (sau khi seed)
- **Admin**: `admin@bellabridal.vn` / `Bella@2026!`
- **Stylist (Staff)**: `stylist@bellabridal.vn` / `Stylist@2026!`

## Cài đặt nhanh
Xem chi tiết tại [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) và kiến trúc tại [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
