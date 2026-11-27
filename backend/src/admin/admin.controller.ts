import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AuthGuard, AuthUser, Roles, RolesGuard } from '../auth/auth.guard';
import { AppointmentsService } from '../appointments/appointments.service';
import { DatabaseService, slugifyVi } from '../database/database.service';
import { NotificationService } from '../notifications/notification.service';

@Controller('api/v1/admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'staff')
export class AdminController {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(AppointmentsService) private readonly appointmentsService: AppointmentsService,
    @Inject(NotificationService) private readonly notifications: NotificationService
  ) {}

  @Get('dashboard')
  dashboard() {
    const totalDresses = (this.db.db.prepare('SELECT COUNT(*) as c FROM dresses').get() as { c: number }).c;
    const totalAppointments = (this.db.db.prepare('SELECT COUNT(*) as c FROM appointments').get() as { c: number }).c;
    const pendingAppointments = (
      this.db.db.prepare("SELECT COUNT(*) as c FROM appointments WHERE status = 'pending'").get() as { c: number }
    ).c;
    const confirmedRevenue = (
      this.db.db
        .prepare("SELECT COALESCE(SUM(estimated_revenue), 0) as s FROM appointments WHERE status IN ('confirmed', 'completed')")
        .get() as { s: number }
    ).s;

    const recentAppointments = this.db.db
      .prepare(
        `SELECT a.*, s.name as service_name, d.name as dress_name
         FROM appointments a
         LEFT JOIN services s ON a.service_id = s.id
         LEFT JOIN dresses d ON a.dress_id = d.id
         ORDER BY a.created_at DESC LIMIT 8`
      )
      .all();

    const recentNotifications = this.db.db
      .prepare(
        `SELECT nl.*, a.booking_code, a.customer_name
         FROM notification_logs nl
         LEFT JOIN appointments a ON nl.appointment_id = a.id
         ORDER BY nl.created_at DESC LIMIT 10`
      )
      .all();

    return {
      stats: {
        total_dresses: totalDresses,
        total_appointments: totalAppointments,
        pending_appointments: pendingAppointments,
        estimated_revenue: confirmedRevenue,
      },
      recent_appointments: recentAppointments,
      recent_notifications: recentNotifications,
    };
  }

  // --- Dresses ---
  @Get('dresses')
  listDresses() {
    const rows = this.db.db
      .prepare(
        `SELECT d.*, c.name as category_name
         FROM dresses d
         LEFT JOIN dress_categories c ON d.category_id = c.id
         ORDER BY d.id DESC`
      )
      .all() as Record<string, unknown>[];
    return {
      data: rows.map((d) => ({
        ...d,
        images: this.db.db
          .prepare('SELECT * FROM dress_images WHERE dress_id = ? ORDER BY sort_order ASC')
          .all(d.id as number),
      })),
    };
  }

  @Post('dresses')
  createDress(@Body() body: Record<string, unknown>) {
    const name = String(body.name || '').trim();
    const code = String(body.code || '').trim();
    const categoryId = Number(body.category_id);
    if (!name || !code || !categoryId) {
      throw new BadRequestException({ message: 'Vui lòng nhập mã váy, tên váy và danh mục.' });
    }
    const slug = String(body.slug || '').trim() ? slugifyVi(String(body.slug)) : slugifyVi(name);

    const res = this.db.db
      .prepare(
        `INSERT INTO dresses (category_id, code, name, slug, description, material, silhouette, style, color, rental_price, sale_price, video_url, is_featured, status, meta_title, meta_description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        categoryId,
        code,
        name,
        slug,
        String(body.description || ''),
        String(body.material || ''),
        String(body.silhouette || ''),
        String(body.style || ''),
        String(body.color || ''),
        Number(body.rental_price || 0),
        Number(body.sale_price || 0),
        body.video_url ? String(body.video_url) : null,
        body.is_featured ? 1 : 0,
        String(body.status || 'active'),
        String(body.meta_title || `${name} | BellaBridal`),
        String(body.meta_description || body.description || '')
      );

    const dressId = Number(res.lastInsertRowid);
    if (body.image_url) {
      this.db.db
        .prepare('INSERT INTO dress_images (dress_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, 1, 0)')
        .run(dressId, String(body.image_url), name);
    }

    return { data: this.db.db.prepare('SELECT * FROM dresses WHERE id = ?').get(dressId) };
  }

  @Put('dresses/:id')
  updateDress(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const dressId = Number(id);
    const existing = this.db.db.prepare('SELECT * FROM dresses WHERE id = ?').get(dressId) as Record<string, unknown> | undefined;
    if (!existing) throw new NotFoundException({ message: 'Không tìm thấy váy cưới.' });

    this.db.db
      .prepare(
        `UPDATE dresses SET
          category_id = ?, code = ?, name = ?, description = ?, material = ?, silhouette = ?,
          style = ?, color = ?, rental_price = ?, sale_price = ?, video_url = ?, is_featured = ?, status = ?
         WHERE id = ?`
      )
      .run(
        body.category_id ? Number(body.category_id) : (existing.category_id as number),
        String(body.code ?? existing.code),
        String(body.name ?? existing.name),
        String(body.description ?? existing.description ?? ''),
        String(body.material ?? existing.material ?? ''),
        String(body.silhouette ?? existing.silhouette ?? ''),
        String(body.style ?? existing.style ?? ''),
        String(body.color ?? existing.color ?? ''),
        body.rental_price !== undefined ? Number(body.rental_price) : (existing.rental_price as number),
        body.sale_price !== undefined ? Number(body.sale_price) : (existing.sale_price as number),
        body.video_url !== undefined ? (body.video_url ? String(body.video_url) : null) : (existing.video_url as string | null),
        body.is_featured !== undefined ? (body.is_featured ? 1 : 0) : (existing.is_featured as number),
        String(body.status ?? existing.status),
        dressId
      );

    if (body.image_url) {
      const url = String(body.image_url).trim();
      const primary = this.db.db
        .prepare('SELECT id FROM dress_images WHERE dress_id = ? AND is_primary = 1')
        .get(dressId) as { id: number } | undefined;
      if (primary) {
        this.db.db.prepare('UPDATE dress_images SET image_url = ? WHERE id = ?').run(url, primary.id);
      } else {
        this.db.db
          .prepare('INSERT INTO dress_images (dress_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, 1, 0)')
          .run(dressId, url, String(body.name ?? existing.name));
      }
    }

    return { data: this.db.db.prepare('SELECT * FROM dresses WHERE id = ?').get(dressId) };
  }

  @Delete('dresses/:id')
  deleteDress(@Param('id') id: string) {
    this.db.db.prepare('DELETE FROM dresses WHERE id = ?').run(Number(id));
    return { message: 'Đã xóa mẫu váy.' };
  }

  // --- Categories ---
  @Get('categories')
  listCategories() {
    return { data: this.db.db.prepare('SELECT * FROM dress_categories ORDER BY sort_order ASC').all() };
  }

  @Post('categories')
  createCategory(@Body() body: Record<string, unknown>) {
    const name = String(body.name || '').trim();
    if (!name) throw new BadRequestException({ message: 'Vui lòng nhập tên danh mục.' });
    const slug = String(body.slug || '').trim() ? slugifyVi(String(body.slug)) : slugifyVi(name);
    const res = this.db.db
      .prepare('INSERT INTO dress_categories (name, slug, description, image, sort_order, is_active) VALUES (?, ?, ?, ?, ?, 1)')
      .run(name, slug, String(body.description || ''), String(body.image || ''), Number(body.sort_order ?? 0));
    return { data: this.db.db.prepare('SELECT * FROM dress_categories WHERE id = ?').get(Number(res.lastInsertRowid)) };
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const catId = Number(id);
    const existing = this.db.db.prepare('SELECT * FROM dress_categories WHERE id = ?').get(catId) as
      | Record<string, unknown>
      | undefined;
    if (!existing) throw new NotFoundException({ message: 'Không tìm thấy danh mục.' });
    this.db.db
      .prepare('UPDATE dress_categories SET name = ?, description = ?, image = ?, sort_order = ?, is_active = ? WHERE id = ?')
      .run(
        String(body.name ?? existing.name),
        String(body.description ?? existing.description ?? ''),
        String(body.image ?? existing.image ?? ''),
        Number(body.sort_order ?? existing.sort_order ?? 0),
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : Number(existing.is_active ?? 1),
        catId
      );
    return { data: this.db.db.prepare('SELECT * FROM dress_categories WHERE id = ?').get(catId) };
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    this.db.db.prepare('DELETE FROM dress_categories WHERE id = ?').run(Number(id));
    return { message: 'Đã xóa danh mục.' };
  }

  // --- Appointments ---
  @Get('appointments')
  listAppointments(@Query('status') status?: string, @Query('date') date?: string) {
    let sql = `
      SELECT a.*, s.name as service_name, d.name as dress_name
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN dresses d ON a.dress_id = d.id
      WHERE 1=1
    `;
    const params: string[] = [];
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    if (date) {
      sql += ' AND a.appointment_date = ?';
      params.push(date);
    }
    sql += ' ORDER BY a.appointment_date DESC, a.time_slot ASC';
    const rows = this.db.db.prepare(sql).all(...params) as Record<string, unknown>[];
    return {
      data: rows.map((r) => ({
        ...r,
        notifications: this.db.db
          .prepare('SELECT * FROM notification_logs WHERE appointment_id = ? ORDER BY id DESC')
          .all(r.id as number),
      })),
    };
  }

  @Put('appointments/:id')
  async updateAppointment(
    @Param('id') id: string,
    @Body() body: { status?: string; notes?: string },
    @Req() req: { user: AuthUser }
  ) {
    const apptId = Number(id);
    const existing = this.db.db
      .prepare(
        `SELECT a.*, s.name as service_name, d.name as dress_name
         FROM appointments a
         LEFT JOIN services s ON a.service_id = s.id
         LEFT JOIN dresses d ON a.dress_id = d.id
         WHERE a.id = ?`
      )
      .get(apptId) as Record<string, unknown> | undefined;

    if (!existing) throw new NotFoundException({ message: 'Không tìm thấy lịch hẹn.' });

    const newStatus = body.status || String(existing.status);
    const confirmedAt = newStatus === 'confirmed' ? new Date().toISOString() : existing.confirmed_at;
    const confirmedBy = newStatus === 'confirmed' ? req.user.id : existing.confirmed_by;

    this.db.db
      .prepare('UPDATE appointments SET status = ?, notes = ?, confirmed_by = ?, confirmed_at = ? WHERE id = ?')
      .run(
        newStatus,
        (body.notes ?? existing.notes ?? null) as string | null,
        (confirmedBy ?? null) as number | null,
        (confirmedAt ?? null) as string | null,
        apptId
      );

    // Broadcast real-time availability update if status changed
    this.appointmentsService.emitAvailabilityUpdate(String(existing.appointment_date));

    // Dispatch Zalo ZNS / SMS / Email notification when confirmed or cancelled
    if (newStatus !== existing.status && (newStatus === 'confirmed' || newStatus === 'cancelled')) {
      await this.notifications.dispatchBookingNotifications({
        appointmentId: apptId,
        bookingCode: String(existing.booking_code),
        customerName: String(existing.customer_name),
        customerPhone: String(existing.customer_phone),
        customerEmail: existing.customer_email ? String(existing.customer_email) : null,
        appointmentDate: String(existing.appointment_date),
        timeSlot: String(existing.time_slot),
        serviceName: existing.service_name ? String(existing.service_name) : null,
        dressName: existing.dress_name ? String(existing.dress_name) : null,
        event: newStatus === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled',
      });
    }

    return { data: this.db.db.prepare('SELECT * FROM appointments WHERE id = ?').get(apptId) };
  }

  @Delete('appointments/:id')
  deleteAppointment(@Param('id') id: string) {
    const appt = this.db.db.prepare('SELECT appointment_date FROM appointments WHERE id = ?').get(Number(id)) as
      | { appointment_date: string }
      | undefined;
    this.db.db.prepare('DELETE FROM appointments WHERE id = ?').run(Number(id));
    if (appt) {
      this.appointmentsService.emitAvailabilityUpdate(appt.appointment_date);
    }
    return { message: 'Đã xóa lịch hẹn.' };
  }

  // --- Services ---
  @Get('services')
  listServices() {
    return { data: this.db.db.prepare('SELECT * FROM services ORDER BY sort_order ASC').all() };
  }

  @Post('services')
  createService(@Body() body: Record<string, unknown>) {
    const name = String(body.name || '').trim();
    if (!name) throw new BadRequestException({ message: 'Vui lòng nhập tên dịch vụ.' });
    const slug = String(body.slug || '').trim() ? slugifyVi(String(body.slug)) : slugifyVi(name);
    const res = this.db.db
      .prepare(
        `INSERT INTO services (name, slug, short_description, description, price_from, price_to, duration_note, image, icon, is_featured, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
      )
      .run(
        name,
        slug,
        String(body.short_description || ''),
        String(body.description || ''),
        Number(body.price_from || 0),
        Number(body.price_to || 0),
        String(body.duration_note || ''),
        String(body.image || ''),
        String(body.icon || 'Sparkles'),
        body.is_featured ? 1 : 0
      );
    return { data: this.db.db.prepare('SELECT * FROM services WHERE id = ?').get(Number(res.lastInsertRowid)) };
  }

  @Put('services/:id')
  updateService(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const existing = this.db.db.prepare('SELECT * FROM services WHERE id = ?').get(Number(id)) as
      | Record<string, unknown>
      | undefined;
    if (!existing) throw new NotFoundException({ message: 'Không tìm thấy dịch vụ.' });
    this.db.db
      .prepare(
        `UPDATE services
         SET name = ?, short_description = ?, description = ?, price_from = ?, price_to = ?, duration_note = ?, image = ?, is_featured = ?, is_active = ?
         WHERE id = ?`
      )
      .run(
        String(body.name ?? existing.name),
        String(body.short_description ?? existing.short_description ?? ''),
        String(body.description ?? existing.description ?? ''),
        Number(body.price_from ?? existing.price_from ?? 0),
        Number(body.price_to ?? existing.price_to ?? 0),
        String(body.duration_note ?? existing.duration_note ?? ''),
        String(body.image ?? existing.image ?? ''),
        body.is_featured !== undefined ? (body.is_featured ? 1 : 0) : Number(existing.is_featured ?? 0),
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : Number(existing.is_active ?? 1),
        Number(id)
      );
    return { data: this.db.db.prepare('SELECT * FROM services WHERE id = ?').get(Number(id)) };
  }

  @Delete('services/:id')
  deleteService(@Param('id') id: string) {
    this.db.db.prepare('DELETE FROM services WHERE id = ?').run(Number(id));
    return { message: 'Đã xóa dịch vụ.' };
  }

  // --- Blog Posts ---
  @Get('posts')
  listPosts() {
    return { data: this.db.db.prepare('SELECT * FROM blog_posts ORDER BY id DESC').all() };
  }

  @Post('posts')
  createPost(@Body() body: Record<string, unknown>, @Req() req: { user: AuthUser }) {
    const title = String(body.title || '').trim();
    if (!title) throw new BadRequestException({ message: 'Vui lòng nhập tiêu đề.' });
    const slug = String(body.slug || '').trim() ? slugifyVi(String(body.slug)) : slugifyVi(title);
    const res = this.db.db
      .prepare(
        `INSERT INTO blog_posts (title, slug, category, excerpt, content, thumbnail, author_id, status, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      )
      .run(
        title,
        slug,
        String(body.category || 'Kinh nghiệm cưới'),
        String(body.excerpt || ''),
        String(body.content || ''),
        String(body.thumbnail || ''),
        req.user.id,
        String(body.status || 'published')
      );
    return { data: this.db.db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(Number(res.lastInsertRowid)) };
  }

  @Put('posts/:id')
  updatePost(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const existing = this.db.db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(Number(id)) as
      | Record<string, unknown>
      | undefined;
    if (!existing) throw new NotFoundException({ message: 'Không tìm thấy bài viết.' });
    this.db.db
      .prepare(
        `UPDATE blog_posts
         SET title = ?, category = ?, excerpt = ?, content = ?, thumbnail = ?, status = ?
         WHERE id = ?`
      )
      .run(
        String(body.title ?? existing.title),
        String(body.category ?? existing.category ?? 'Kinh nghiệm cưới'),
        String(body.excerpt ?? existing.excerpt ?? ''),
        String(body.content ?? existing.content ?? ''),
        String(body.thumbnail ?? existing.thumbnail ?? ''),
        String(body.status ?? existing.status ?? 'published'),
        Number(id)
      );
    return { data: this.db.db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(Number(id)) };
  }

  @Delete('posts/:id')
  deletePost(@Param('id') id: string) {
    this.db.db.prepare('DELETE FROM blog_posts WHERE id = ?').run(Number(id));
    return { message: 'Đã xóa bài viết.' };
  }

  // --- Hero Banners ---
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = path.resolve(process.cwd(), '../frontend/public/uploads/banners');
          fs.mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
          const safeExt = ['.png', '.jpg', '.jpeg', '.webp', '.avif'].includes(ext) ? ext : '.png';
          cb(null, `banner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${safeExt}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    })
  )
  uploadBannerImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({ message: 'Vui lòng chọn file ảnh hợp lệ.' });
    }
    return {
      url: `/uploads/banners/${file.filename}`,
      filename: file.filename,
    };
  }

  @Get('banners')
  listBanners() {
    return { data: this.db.db.prepare('SELECT * FROM hero_banners ORDER BY sort_order ASC, id ASC').all() };
  }

  @Post('banners')
  createBanner(@Body() body: Record<string, unknown>) {
    const title = String(body.title || '').trim();
    const imageUrl = String(body.image_url || '').trim();
    if (!title || !imageUrl) {
      throw new BadRequestException({ message: 'Vui lòng nhập tiêu đề và đường dẫn ảnh banner.' });
    }
    const res = this.db.db
      .prepare(
        `INSERT INTO hero_banners (badge, title, subtitle, image_url, bg_gradient, cta_text, cta_link, secondary_cta_text, secondary_cta_link, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        String(body.badge || 'HAUTE COUTURE BRIDAL 2026'),
        title,
        String(body.subtitle || ''),
        imageUrl,
        String(
          body.bg_gradient ||
            'linear-gradient(180deg, #B59CA0 0%, #C8ADA8 24%, #D7B8B0 48%, #CE9F97 72%, #EADBD6 92%, #DFCCC6 100%)'
        ),
        String(body.cta_text || 'Đặt lịch thử váy ngay'),
        String(body.cta_link || '/dat-lich'),
        String(body.secondary_cta_text || 'Xem bộ sưu tập'),
        String(body.secondary_cta_link || '/bo-suu-tap'),
        Number(body.sort_order ?? 0),
        body.is_active === false || body.is_active === 0 ? 0 : 1
      );
    return { data: this.db.db.prepare('SELECT * FROM hero_banners WHERE id = ?').get(Number(res.lastInsertRowid)) };
  }

  @Put('banners/:id')
  updateBanner(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const existing = this.db.db.prepare('SELECT * FROM hero_banners WHERE id = ?').get(Number(id)) as
      | Record<string, unknown>
      | undefined;
    if (!existing) throw new NotFoundException({ message: 'Không tìm thấy banner.' });
    this.db.db
      .prepare(
        `UPDATE hero_banners
         SET badge = ?, title = ?, subtitle = ?, image_url = ?, bg_gradient = ?, cta_text = ?, cta_link = ?, secondary_cta_text = ?, secondary_cta_link = ?, sort_order = ?, is_active = ?
         WHERE id = ?`
      )
      .run(
        String(body.badge ?? existing.badge),
        String(body.title ?? existing.title),
        String(body.subtitle ?? existing.subtitle ?? ''),
        String(body.image_url ?? existing.image_url),
        String(body.bg_gradient ?? existing.bg_gradient ?? ''),
        String(body.cta_text ?? existing.cta_text),
        String(body.cta_link ?? existing.cta_link),
        String(body.secondary_cta_text ?? existing.secondary_cta_text),
        String(body.secondary_cta_link ?? existing.secondary_cta_link),
        Number(body.sort_order ?? existing.sort_order ?? 0),
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : Number(existing.is_active ?? 1),
        Number(id)
      );
    return { data: this.db.db.prepare('SELECT * FROM hero_banners WHERE id = ?').get(Number(id)) };
  }

  @Delete('banners/:id')
  deleteBanner(@Param('id') id: string) {
    this.db.db.prepare('DELETE FROM hero_banners WHERE id = ?').run(Number(id));
    return { message: 'Đã xóa banner.' };
  }

  // --- Reviews ---
  @Get('reviews')
  listReviews() {
    return { data: this.db.db.prepare('SELECT * FROM reviews ORDER BY sort_order ASC, id DESC').all() };
  }

  @Post('reviews')
  createReview(@Body() body: Record<string, unknown>) {
    const res = this.db.db
      .prepare(
        'INSERT INTO reviews (customer_name, service_used, rating, content, wedding_date, is_featured, is_approved) VALUES (?, ?, ?, ?, ?, 1, 1)'
      )
      .run(
        String(body.customer_name || ''),
        String(body.service_used || ''),
        Number(body.rating || 5),
        String(body.content || ''),
        String(body.wedding_date || '')
      );
    return { data: this.db.db.prepare('SELECT * FROM reviews WHERE id = ?').get(Number(res.lastInsertRowid)) };
  }

  @Delete('reviews/:id')
  deleteReview(@Param('id') id: string) {
    this.db.db.prepare('DELETE FROM reviews WHERE id = ?').run(Number(id));
    return { message: 'Đã xóa đánh giá.' };
  }

  // --- Customers ---
  @Get('customers')
  listCustomers() {
    const rows = this.db.db
      .prepare(
        `SELECT customer_name, customer_phone, customer_email,
                COUNT(*) as total_appointments,
                MAX(appointment_date) as last_appointment_date,
                SUM(estimated_revenue) as total_estimated_revenue
         FROM appointments
         GROUP BY customer_phone
         ORDER BY last_appointment_date DESC`
      )
      .all();
    return { data: rows };
  }

  // --- Chatbot Admin ---
  @Get('chatbot/sessions')
  chatbotSessions() {
    return { data: this.db.db.prepare('SELECT * FROM chat_sessions ORDER BY updated_at DESC').all() };
  }

  @Get('chatbot/faqs')
  chatbotFaqs() {
    return { data: this.db.db.prepare('SELECT * FROM chatbot_faqs ORDER BY sort_order ASC').all() };
  }

  @Post('chatbot/faqs')
  createFaq(@Body() body: { question?: string; answer?: string; category?: string; keywords?: string }) {
    const res = this.db.db
      .prepare('INSERT INTO chatbot_faqs (question, answer, category, keywords, is_active) VALUES (?, ?, ?, ?, 1)')
      .run(body.question || '', body.answer || '', body.category || 'general', body.keywords || '');
    return { data: this.db.db.prepare('SELECT * FROM chatbot_faqs WHERE id = ?').get(Number(res.lastInsertRowid)) };
  }

  @Delete('chatbot/faqs/:id')
  deleteFaq(@Param('id') id: string) {
    this.db.db.prepare('DELETE FROM chatbot_faqs WHERE id = ?').run(Number(id));
    return { message: 'Đã xóa FAQ.' };
  }

  // --- Settings (Admin only) ---
  @Get('settings')
  @Roles('admin')
  getSettings() {
    const rows = this.db.db.prepare('SELECT key, value, group_name FROM site_settings').all() as {
      key: string;
      value: string;
      group_name: string;
    }[];
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return { data: map, items: rows };
  }

  @Put('settings')
  @Roles('admin')
  updateSettings(@Body() body: Record<string, string>) {
    const upsert = this.db.db.prepare(
      'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    );
    this.db.transaction(() => {
      for (const [k, v] of Object.entries(body)) {
        upsert.run(k, String(v ?? ''));
      }
    });
    return { message: 'Cập nhật cấu hình thành công!' };
  }
}
