# Kiến trúc hệ thống BellaBridal (`bella-bridal`)

## 1. Kiến trúc tổng thể
Dự án được tổ chức theo mô hình **Decoupled Full-stack Monorepo**:
- **`backend/` (Laravel 11 RESTful API)**:
  - Xử lý toàn bộ nghiệp vụ, xác thực (Laravel Sanctum), phân quyền (`admin`, `staff`), validation, rate limiting, lưu trữ DB, gửi email SMTP, sinh `sitemap.xml` / `robots.txt` và kết nối AI Chatbot API (giữ API Key an toàn trong `.env`).
  - Phân tầng rõ ràng: `Routes -> Middleware -> FormRequest -> Controller -> Service -> Model`.
- **`frontend/` (ReactJS + Vite + Tailwind CSS)**:
  - Giao diện Luxury Bridal với bảng màu chuẩn (`#FFFDF8`, `#F8F3ED`, `#F6E5E8`, `#EBCFD5`, `#C69A91`, `#4A4141`).
  - Code splitting theo route (`React.lazy` + `Suspense`), SEO động với `react-helmet-async` (Meta Title/Description, Open Graph, Canonical, Schema.org JSON-LD), Debounce search, Loading Skeletons, AI Chatbot Widget & Zalo Floating Button.

## 2. Cấu trúc thư mục
```text
bella-bridal/
├── docker-compose.yml
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── HomeController.php
│   │   │   │   ├── DressController.php
│   │   │   │   ├── ServiceController.php
│   │   │   │   ├── AppointmentController.php
│   │   │   │   ├── BlogPostController.php
│   │   │   │   ├── ReviewController.php
│   │   │   │   ├── ContactController.php
│   │   │   │   ├── ChatbotController.php
│   │   │   │   ├── SettingController.php
│   │   │   │   ├── SitemapController.php
│   │   │   │   └── Admin/
│   │   │   │       ├── DashboardController.php
│   │   │   │       ├── AdminDressController.php
│   │   │   │       ├── AdminCategoryController.php
│   │   │   │       ├── AdminAppointmentController.php
│   │   │   │       ├── AdminServiceController.php
│   │   │   │       ├── AdminPostController.php
│   │   │   │       ├── AdminCustomerController.php
│   │   │   │       ├── AdminReviewController.php
│   │   │   │       ├── AdminSettingController.php
│   │   │   │       └── AdminChatbotController.php
│   │   │   ├── Middleware/EnsureRole.php
│   │   │   └── Requests/
│   │   ├── Models/
│   │   └── Services/
│   │       ├── AppointmentService.php
│   │       ├── ChatbotService.php
│   │       └── DashboardService.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   └── tests/Feature/
└── frontend/
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── api/
        ├── components/
        │   ├── common/
        │   ├── layout/
        │   ├── home/
        │   ├── dress/
        │   ├── booking/
        │   ├── chat/
        │   └── seo/
        ├── contexts/
        ├── pages/
        │   ├── public/
        │   └── admin/
        └── utils/
```

## 3. Database Schema
1. `users`: `id, name, email, phone, password, role (admin|staff|customer), is_active, timestamps`
2. `dress_categories`: `id, name, slug, description, image, sort_order, is_active, timestamps`
3. `dresses`: `id, category_id, code, name, slug, description, material, silhouette, style, color, rental_price, sale_price, is_featured, status (active|hidden), view_count, meta_title, meta_description, timestamps`
4. `dress_images`: `id, dress_id, image_url, alt_text, is_primary, sort_order, timestamps`
5. `services`: `id, name, slug, short_description, description, price_from, price_to, price_unit, duration_note, image, icon, is_featured, is_active, sort_order, meta_title, meta_description, timestamps`
6. `appointments`: `id, booking_code, customer_name, customer_phone, customer_email, appointment_date, time_slot, service_id, dress_id, notes, status (pending|confirmed|completed|cancelled), admin_note, confirmed_by, confirmed_at, timestamps`
7. `blog_posts`: `id, title, slug, category, excerpt, content, thumbnail, author_id, status (draft|published), published_at, view_count, meta_title, meta_description, timestamps`
8. `reviews`: `id, customer_name, customer_avatar, service_used, rating, content, wedding_date, is_featured, is_approved, sort_order, timestamps`
9. `contact_messages`: `id, name, phone, email, subject, message, status (new|read|replied), timestamps`
10. `site_settings`: `id, key, value, group, timestamps`
11. `chat_sessions`: `id, session_token, customer_name, customer_phone, status (active|handoff|closed), message_count, last_message_at, timestamps`
12. `chat_messages`: `id, chat_session_id, sender (user|assistant|staff), content, suggested_dresses, timestamps`
13. `chatbot_faqs`: `id, question, answer, category, keywords, is_active, sort_order, timestamps`

## 4. Danh sách API Endpoints (`/api/v1`)
- **Public**: `GET /home`, `GET /settings/public`, `GET /categories`, `GET /dresses`, `GET /dresses/{slug}`, `GET /services`, `GET /services/{slug}`, `GET /posts`, `GET /posts/{slug}`, `GET /reviews`, `GET /appointments/availability`, `POST /appointments`, `POST /contacts`, `POST /chatbot/message`, `POST /chatbot/handoff`, `GET /chatbot/history`.
- **Auth**: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.
- **Admin (`auth:sanctum` + `role:admin,staff`)**: `/admin/dashboard`, `/admin/dresses`, `/admin/categories`, `/admin/appointments`, `/admin/services`, `/admin/posts`, `/admin/customers`, `/admin/reviews`, `/admin/settings`, `/admin/chatbot/sessions`, `/admin/chatbot/faqs`, `/admin/chatbot/config`.
- **SEO**: `GET /sitemap.xml`, `GET /robots.txt`.
