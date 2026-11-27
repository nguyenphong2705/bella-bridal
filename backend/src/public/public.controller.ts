import { BadRequestException, Body, Controller, Get, Inject, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { DatabaseService, formatVnPhonePlus84 } from '../database/database.service';

@Controller('api/v1')
export class PublicController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  @Get('health')
  health() {
    return { status: 'ok', app: 'BellaBridal NestJS API', timestamp: new Date().toISOString() };
  }

  @Get('settings/public')
  publicSettings() {
    const rows = this.db.db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  }

  @Get('home')
  home() {
    const categories = this.db.db
      .prepare('SELECT * FROM dress_categories WHERE is_active = 1 ORDER BY sort_order ASC')
      .all();

    const featuredDressesRaw = this.db.db
      .prepare(
        `SELECT d.*, c.name as category_name, c.slug as category_slug
         FROM dresses d
         JOIN dress_categories c ON d.category_id = c.id
         WHERE d.status = 'active' AND d.is_featured = 1
         ORDER BY d.id ASC LIMIT 6`
      )
      .all() as Record<string, unknown>[];

    const featuredDresses = featuredDressesRaw.map((d) => ({
      ...d,
      category: { id: d.category_id, name: d.category_name, slug: d.category_slug },
      images: this.db.db
        .prepare('SELECT * FROM dress_images WHERE dress_id = ? ORDER BY sort_order ASC')
        .all(d.id as number),
    }));

    const services = this.db.db
      .prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC')
      .all();

    const reviews = this.db.db
      .prepare('SELECT * FROM reviews WHERE is_approved = 1 ORDER BY sort_order ASC LIMIT 6')
      .all();

    const posts = this.db.db
      .prepare("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 3")
      .all();

    const settings = this.publicSettings();

    const banners = this.db.db
      .prepare('SELECT * FROM hero_banners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')
      .all();

    return {
      categories,
      featured_dresses: featuredDresses,
      services,
      reviews,
      posts,
      settings,
      banners,
    };
  }

  @Get('banners')
  banners() {
    return {
      data: this.db.db
        .prepare('SELECT * FROM hero_banners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')
        .all(),
    };
  }

  @Get('categories')
  categories() {
    return {
      data: this.db.db.prepare('SELECT * FROM dress_categories WHERE is_active = 1 ORDER BY sort_order ASC').all(),
    };
  }

  @Get('dresses')
  dresses(
    @Query('category') category?: string,
    @Query('silhouette') silhouette?: string,
    @Query('min_price') minPrice?: string,
    @Query('max_price') maxPrice?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string
  ) {
    let sql = `
      SELECT d.*, c.name as category_name, c.slug as category_slug
      FROM dresses d
      JOIN dress_categories c ON d.category_id = c.id
      WHERE d.status = 'active'
    `;
    const params: (string | number)[] = [];

    if (category) {
      sql += ' AND c.slug = ?';
      params.push(category);
    }
    if (silhouette) {
      sql += ' AND d.silhouette LIKE ?';
      params.push(`%${silhouette}%`);
    }
    if (minPrice) {
      sql += ' AND d.rental_price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      sql += ' AND d.rental_price <= ?';
      params.push(Number(maxPrice));
    }
    if (featured === '1' || featured === 'true') {
      sql += ' AND d.is_featured = 1';
    }
    if (search) {
      sql += ' AND (d.name LIKE ? OR d.code LIKE ? OR d.description LIKE ? OR d.material LIKE ?)';
      const q = `%${search.trim()}%`;
      params.push(q, q, q, q);
    }
    sql += ' ORDER BY d.is_featured DESC, d.id DESC';

    const rows = this.db.db.prepare(sql).all(...params) as Record<string, unknown>[];
    const data = rows.map((d) => ({
      ...d,
      category: { id: d.category_id, name: d.category_name, slug: d.category_slug },
      images: this.db.db
        .prepare('SELECT * FROM dress_images WHERE dress_id = ? ORDER BY sort_order ASC')
        .all(d.id as number),
    }));

    return { data };
  }

  @Get('dresses/:slug')
  dressDetail(@Param('slug') slug: string) {
    const dress = this.db.db
      .prepare(
        `SELECT d.*, c.name as category_name, c.slug as category_slug
         FROM dresses d
         JOIN dress_categories c ON d.category_id = c.id
         WHERE d.slug = ? AND d.status = 'active'`
      )
      .get(slug) as Record<string, unknown> | undefined;

    if (!dress) {
      throw new NotFoundException({ message: 'Không tìm thấy mẫu váy cưới này.' });
    }

    const images = this.db.db
      .prepare('SELECT * FROM dress_images WHERE dress_id = ? ORDER BY sort_order ASC')
      .all(dress.id as number);

    const relatedRaw = this.db.db
      .prepare(
        `SELECT d.*, c.name as category_name, c.slug as category_slug
         FROM dresses d
         JOIN dress_categories c ON d.category_id = c.id
         WHERE d.status = 'active' AND d.id != ? AND d.category_id = ?
         LIMIT 4`
      )
      .all(dress.id as number, dress.category_id as number) as Record<string, unknown>[];

    const related = relatedRaw.map((r) => ({
      ...r,
      category: { id: r.category_id, name: r.category_name, slug: r.category_slug },
      images: this.db.db
        .prepare('SELECT * FROM dress_images WHERE dress_id = ? ORDER BY sort_order ASC')
        .all(r.id as number),
    }));

    return {
      data: {
        ...dress,
        category: { id: dress.category_id, name: dress.category_name, slug: dress.category_slug },
        images,
      },
      related,
    };
  }

  @Get('services')
  services() {
    return {
      data: this.db.db.prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC').all(),
    };
  }

  @Get('services/:slug')
  serviceDetail(@Param('slug') slug: string) {
    const svc = this.db.db.prepare('SELECT * FROM services WHERE slug = ? AND is_active = 1').get(slug);
    if (!svc) throw new NotFoundException({ message: 'Không tìm thấy dịch vụ.' });
    return { data: svc };
  }

  @Get('posts')
  posts(@Query('category') category?: string, @Query('search') search?: string) {
    let sql = "SELECT * FROM blog_posts WHERE status = 'published'";
    const params: string[] = [];
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR excerpt LIKE ?)';
      const q = `%${search.trim()}%`;
      params.push(q, q);
    }
    sql += ' ORDER BY published_at DESC';
    return { data: this.db.db.prepare(sql).all(...params) };
  }

  @Get('posts/:slug')
  postDetail(@Param('slug') slug: string) {
    const post = this.db.db.prepare("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'").get(slug);
    if (!post) throw new NotFoundException({ message: 'Không tìm thấy bài viết.' });
    return { data: post };
  }

  @Get('reviews')
  reviews() {
    return {
      data: this.db.db.prepare('SELECT * FROM reviews WHERE is_approved = 1 ORDER BY sort_order ASC').all(),
    };
  }

  @Post('contacts')
  createContact(@Body() body: { name?: string; phone?: string; email?: string; message?: string }) {
    const name = (body.name || '').trim();
    const rawPhone = (body.phone || '').trim();
    const message = (body.message || '').trim();
    if (!name || !rawPhone || !message) {
      throw new BadRequestException({ message: 'Vui lòng nhập đầy đủ họ tên, số điện thoại và nội dung.' });
    }
    const phone = formatVnPhonePlus84(rawPhone);
    const res = this.db.db
      .prepare('INSERT INTO contact_messages (name, phone, email, message) VALUES (?, ?, ?, ?)')
      .run(name, phone, body.email?.trim() || null, message);
    return {
      message: 'Cảm ơn bạn đã liên hệ! Chuyên viên BellaBridal sẽ phản hồi trong thời gian sớm nhất.',
      data: { id: Number(res.lastInsertRowid) },
    };
  }

  @Post('chatbot/message')
  async chatbotMessage(@Body() body: { session_id?: string; message?: string }) {
    const sessionId = (body.session_id || 'guest-' + Date.now()).trim();
    const userMsg = (body.message || '').trim();
    if (!userMsg) {
      throw new BadRequestException({ message: 'Vui lòng nhập nội dung tin nhắn.' });
    }

    // Ensure session exists
    const existing = this.db.db.prepare('SELECT * FROM chat_sessions WHERE session_id = ?').get(sessionId) as
      | { id: number; message_count: number }
      | undefined;

    if (!existing) {
      this.db.db
        .prepare("INSERT INTO chat_sessions (session_id, status, message_count) VALUES (?, 'active', 0)")
        .run(sessionId);
    }

    const maxSetting = this.db.db
      .prepare("SELECT value FROM site_settings WHERE key = 'chatbot_max_messages'")
      .get() as { value: string } | undefined;
    const maxMsgs = Number(maxSetting?.value || 25);

    if (existing && existing.message_count >= maxMsgs) {
      return {
        session_id: sessionId,
        reply: 'Bạn đã đạt giới hạn tin nhắn cho phiên tư vấn này. Vui lòng đặt lịch thử váy hoặc liên hệ trực tiếp qua Zalo +84 901 234 567 để được stylist hỗ trợ chi tiết nhé!',
      };
    }

    this.db.db
      .prepare("INSERT INTO chat_messages (session_id, role, content) VALUES (?, 'user', ?)")
      .run(sessionId, userMsg);

    // Match FAQ or dresses/services, or call OpenAI if configured
    let reply = await this.generateAiReply(userMsg);

    this.db.db
      .prepare("INSERT INTO chat_messages (session_id, role, content) VALUES (?, 'assistant', ?)")
      .run(sessionId, reply);
    this.db.db
      .prepare("UPDATE chat_sessions SET message_count = message_count + 1, updated_at = datetime('now') WHERE session_id = ?")
      .run(sessionId);

    return { session_id: sessionId, reply };
  }

  @Post('chatbot/handoff')
  chatbotHandoff(@Body() body: { session_id?: string; customer_name?: string; customer_phone?: string }) {
    const sessionId = (body.session_id || '').trim();
    if (!sessionId) throw new BadRequestException({ message: 'Thiếu session_id.' });

    this.db.db
      .prepare(
        "UPDATE chat_sessions SET status = 'handoff', customer_name = COALESCE(?, customer_name), customer_phone = COALESCE(?, customer_phone), updated_at = datetime('now') WHERE session_id = ?"
      )
      .run(body.customer_name || null, body.customer_phone || null, sessionId);

    return {
      message: 'Đã chuyển yêu cầu đến Bridal Stylist! Nhân viên sẽ liên hệ qua Zalo/SĐT của bạn trong ít phút.',
    };
  }

  @Get('chatbot/history')
  chatbotHistory(@Query('session_id') sessionId?: string) {
    if (!sessionId) return { data: [] };
    const messages = this.db.db
      .prepare('SELECT role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY id ASC')
      .all(sessionId);
    return { data: messages };
  }

  private async generateAiReply(userMsg: string): Promise<string> {
    const lower = userMsg.toLowerCase();

    // Check FAQs first for fast, accurate studio responses
    const faqs = this.db.db
      .prepare('SELECT question, answer, keywords FROM chatbot_faqs WHERE is_active = 1 ORDER BY sort_order ASC')
      .all() as { question: string; answer: string; keywords: string | null }[];

    for (const faq of faqs) {
      const kws = (faq.keywords || '')
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);
      if (kws.some((kw) => lower.includes(kw))) {
        return faq.answer;
      }
    }

    // OpenAI-compatible API if key is set
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const promptRow = this.db.db
          .prepare("SELECT value FROM site_settings WHERE key = 'chatbot_system_prompt'")
          .get() as { value: string } | undefined;

        const dresses = this.db.db
          .prepare("SELECT name, silhouette, rental_price, material FROM dresses WHERE status = 'active' LIMIT 8")
          .all() as { name: string; silhouette: string; rental_price: number; material: string }[];
        const contextText = dresses
          .map((d) => `- ${d.name} (${d.silhouette}): thuê ${d.rental_price.toLocaleString('vi-VN')} VNĐ, chất liệu ${d.material}`)
          .join('\n');

        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: `${promptRow?.value || 'Bạn là tư vấn viên BellaBridal.'}\n\nDữ liệu váy cưới hiện có:\n${contextText}`,
              },
              { role: 'user', content: userMsg },
            ],
            max_tokens: 350,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          const text = data.choices?.[0]?.message?.content?.trim();
          if (text) return text;
        }
      } catch {
        // Fallback below
      }
    }

    if (lower.includes('công chúa') || lower.includes('ballgown')) {
      return 'BellaBridal đang có các mẫu váy công chúa nổi bật như Aurelia Royal Ballgown (thuê 14.500.000 VNĐ) và Seraphina Crystal Dream (thuê 16.000.000 VNĐ). Bạn có thể đặt lịch thử váy trực tiếp tại mục "Đặt lịch" để trải nghiệm phom dáng thực tế nhé!';
    }
    if (lower.includes('chữ a') || lower.includes('nhẹ nhàng')) {
      return 'Dòng váy chữ A thanh lịch tại BellaBridal gồm Celeste Garden A-Line (9.500.000 VNĐ) và Juliette Satin Off-Shoulder (10.500.000 VNĐ), rất phù hợp cho tiệc sân vườn hoặc lễ đường ấm cúng.';
    }
    if (lower.includes('đuôi cá') || lower.includes('mermaid')) {
      return 'Mẫu váy đuôi cá Vivienne Allure Mermaid (thuê 13.500.000 VNĐ) được thiết kế bằng ren Alencon cao cấp ôm trọn đường cong quyến rũ. Bạn có muốn đặt lịch thử mẫu này không ạ?';
    }

    return 'Cảm ơn nàng dâu đã nhắn tin cho BellaBridal! Studio mở cửa từ 09:00 - 21:00 hàng ngày tại 128 Đồng Khởi, Q.1. Bạn có thể hỏi về giá thuê váy, chọn dáng váy theo vóc dáng, gói cưới trọn gói hoặc đặt lịch thử váy 1-1 cùng Stylist nhé!';
  }
}
