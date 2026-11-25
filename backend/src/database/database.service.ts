import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { EXTRA_DRESSES } from './extra-dresses';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const computed = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
}

export function formatVnPhonePlus84(phone?: string | null): string {
  if (!phone) return '+84 901 234 567';
  const trimmed = phone.trim();
  if (trimmed.includes('@')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;

  let national = digits;
  if (digits.startsWith('84') && digits.length >= 10) {
    national = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length >= 9) {
    national = digits.slice(1);
  }

  if (national.length === 9) {
    return `+84 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
  }
  if (national.length === 10) {
    return `+84 ${national.slice(0, 2)} ${national.slice(2, 6)} ${national.slice(6)}`;
  }
  return `+84 ${national}`;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public db!: DatabaseSync;

  onModuleInit() {
    const dbPath = path.resolve(process.cwd(), process.env.DB_PATH || './data/bella_bridal.db');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.migrate();
    this.seedIfEmpty();
    this.normalizeAllPhonesToPlus84();
  }

  onModuleDestroy() {
    if (this.db) {
      this.db.close();
    }
  }

  public transaction<T>(fn: () => T): T {
    this.db.exec('BEGIN IMMEDIATE;');
    try {
      const result = fn();
      this.db.exec('COMMIT;');
      return result;
    } catch (err) {
      this.db.exec('ROLLBACK;');
      throw err;
    }
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'staff',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS dress_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS dresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL REFERENCES dress_categories(id) ON DELETE CASCADE,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        material TEXT,
        silhouette TEXT,
        style TEXT,
        color TEXT,
        rental_price INTEGER NOT NULL DEFAULT 0,
        sale_price INTEGER NOT NULL DEFAULT 0,
        video_url TEXT,
        is_featured INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        meta_title TEXT,
        meta_description TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS dress_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dress_id INTEGER NOT NULL REFERENCES dresses(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        alt_text TEXT,
        is_primary INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        short_description TEXT,
        description TEXT,
        price_from INTEGER NOT NULL DEFAULT 0,
        price_to INTEGER NOT NULL DEFAULT 0,
        price_unit TEXT NOT NULL DEFAULT 'VNĐ',
        duration_note TEXT,
        image TEXT,
        icon TEXT,
        is_featured INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        meta_title TEXT,
        meta_description TEXT
      );

      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        thumbnail TEXT,
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status TEXT NOT NULL DEFAULT 'published',
        published_at TEXT,
        meta_title TEXT,
        meta_description TEXT
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        service_used TEXT,
        rating INTEGER NOT NULL DEFAULT 5,
        content TEXT NOT NULL,
        wedding_date TEXT,
        is_featured INTEGER NOT NULL DEFAULT 1,
        is_approved INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_code TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        appointment_date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
        dress_id INTEGER REFERENCES dresses(id) ON DELETE SET NULL,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        estimated_revenue INTEGER NOT NULL DEFAULT 0,
        confirmed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        confirmed_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_active_slot
        ON appointments(appointment_date, time_slot)
        WHERE status IN ('pending', 'confirmed');

      CREATE TABLE IF NOT EXISTS notification_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
        channel TEXT NOT NULL,
        recipient TEXT NOT NULL,
        status TEXT NOT NULL,
        payload TEXT,
        response_message TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        group_name TEXT NOT NULL DEFAULT 'general'
      );

      CREATE TABLE IF NOT EXISTS chatbot_faqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        keywords TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL UNIQUE,
        customer_name TEXT,
        customer_phone TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        message_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }

  private seedIfEmpty() {
    const userCount = (this.db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
    if (userCount > 0) return;

    this.transaction(() => {
      // 1. Users
      const insertUser = this.db.prepare(
        'INSERT INTO users (name, email, phone, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, 1)'
      );
      const adminRes = insertUser.run(
        'Quản trị viên BellaBridal',
        'admin@bellabridal.vn',
        '+84 901 234 567',
        hashPassword('Bella@2026!'),
        'admin'
      );
      const adminId = Number(adminRes.lastInsertRowid);
      insertUser.run(
        'Minh Anh - Bridal Stylist',
        'stylist@bellabridal.vn',
        '+84 907 654 321',
        hashPassword('Stylist@2026!'),
        'staff'
      );

      // 2. Categories
      const categories = [
        {
          name: 'Váy cưới công chúa',
          slug: 'vay-cuoi-cong-chua',
          description: 'Thiết kế tùng xòe bồng bềnh cổ điển, đính kết pha lê và ren thủ công tinh xảo tôn vòng eo.',
          image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80',
          sort_order: 1,
        },
        {
          name: 'Váy cưới chữ A',
          slug: 'vay-cuoi-chu-a',
          description: 'Phom dáng chữ A thanh lịch, che khuyết điểm tinh tế và phù hợp với mọi vóc dáng cô dâu.',
          image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
          sort_order: 2,
        },
        {
          name: 'Váy cưới đuôi cá',
          slug: 'vay-cuoi-duoi-ca',
          description: 'Đường cắt ôm sát tôn vinh đường cong quyến rũ, phần đuôi xòe mềm mại đầy kiêu sa.',
          image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80',
          sort_order: 3,
        },
        {
          name: 'Váy cưới tối giản',
          slug: 'vay-cuoi-toi-gian',
          description: 'Chất liệu lụa Satin và Mikado cao cấp với đường cắt may chuẩn xác theo phong cách Minimalist.',
          image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=900&q=80',
          sort_order: 4,
        },
        {
          name: 'Váy cưới cao cấp',
          slug: 'vay-cuoi-cao-cap',
          description: 'Bộ sưu tập Haute Couture giới hạn, nhập khẩu chất liệu từ Pháp và Ý, đính kết hàng trăm giờ.',
          image: 'https://images.unsplash.com/photo-1546193430-c2d207739ed7?auto=format&fit=crop&w=900&q=80',
          sort_order: 5,
        },
        {
          name: 'Váy cưới truyền thống',
          slug: 'vay-cuoi-truyen-thong',
          description: 'Áo dài cưới gấm lụa thêu tay, kết hợp nét đẹp văn hóa Á Đông và phom dáng hiện đại.',
          image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
          sort_order: 6,
        },
      ];

      const catMap: Record<string, number> = {};
      const insertCat = this.db.prepare(
        'INSERT INTO dress_categories (name, slug, description, image, sort_order, is_active) VALUES (?, ?, ?, ?, ?, 1)'
      );
      for (const c of categories) {
        const res = insertCat.run(c.name, c.slug, c.description, c.image, c.sort_order);
        catMap[c.slug] = Number(res.lastInsertRowid);
      }

      // 3. Dresses
      const dresses = [
        {
          cat: 'vay-cuoi-cong-chua',
          code: 'BB-PC01',
          name: 'Aurelia Royal Ballgown',
          slug: 'aurelia-royal-ballgown',
          description: 'Thiết kế váy cưới công chúa trễ vai quyến rũ, thân áo corset định hình eo thon gọn kết hợp tùng voan lưới Pháp nhiều lớp bồng bềnh. Phù hợp với lễ đường khách sạn sang trọng.',
          material: 'Voan lưới Pháp, Ren Chantilly, Pha lê Swarovski',
          silhouette: 'Công chúa (Ballgown)',
          style: 'Lãng mạn cổ điển',
          color: 'Trắng ngà Ivory',
          rental_price: 14500000,
          sale_price: 38000000,
          video_url: 'https://assets.mixkit.co/videos/preview/mixkit-bride-in-a-wedding-dress-posing-42874-large.mp4',
          is_featured: 1,
          images: [
            'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
          ],
        },
        {
          cat: 'vay-cuoi-cong-chua',
          code: 'BB-PC02',
          name: 'Seraphina Crystal Dream',
          slug: 'seraphina-crystal-dream',
          description: 'Mẫu váy công chúa tay dài xuyên thấu đính hoa 3D thủ công, mang lại vẻ đẹp ngọt ngào, kín đáo mà vẫn lộng lẫy dưới ánh đèn tiệc tối.',
          material: 'Tulle Ý, Hoa ren 3D thêu tay',
          silhouette: 'Công chúa (Ballgown)',
          style: 'Ngọt ngào tinh khôi',
          color: 'Ivory ánh hồng',
          rental_price: 16000000,
          sale_price: 42000000,
          video_url: 'https://assets.mixkit.co/videos/preview/mixkit-bride-walking-with-a-bouquet-of-flowers-42872-large.mp4',
          is_featured: 1,
          images: [
            'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=85',
          ],
        },
        {
          cat: 'vay-cuoi-chu-a',
          code: 'BB-AL01',
          name: 'Celeste Garden A-Line',
          slug: 'celeste-garden-a-line',
          description: 'Váy cưới chữ A nhẹ nhàng với cổ chữ V thanh thoát, chất liệu ren lá mềm mại rất lý tưởng cho tiệc cưới ngoài trời hoặc sân vườn.',
          material: 'Voan tơ, Ren cotton Pháp',
          silhouette: 'Chữ A (A-Line)',
          style: 'Thanh lịch nhẹ nhàng',
          color: 'Trắng ngà Ivory',
          rental_price: 9500000,
          sale_price: 26000000,
          video_url: '',
          is_featured: 1,
          images: [
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=85',
          ],
        },
        {
          cat: 'vay-cuoi-duoi-ca',
          code: 'BB-MM01',
          name: 'Vivienne Allure Mermaid',
          slug: 'vivienne-allure-mermaid',
          description: 'Phom đuôi cá ôm trọn đường cong cơ thể, lưng V xẻ sâu tinh tế cùng đuôi váy ren dài 1.5m tạo bước đi uyển chuyển và quyến rũ.',
          material: 'Ren Alencon, Lưới co giãn cao cấp',
          silhouette: 'Đuôi cá (Mermaid)',
          style: 'Quyến rũ hiện đại',
          color: 'Trắng kem Cream',
          rental_price: 13500000,
          sale_price: 35000000,
          video_url: '',
          is_featured: 1,
          images: [
            'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1546193430-c2d207739ed7?auto=format&fit=crop&w=1200&q=85',
          ],
        },
        {
          cat: 'vay-cuoi-toi-gian',
          code: 'BB-MN01',
          name: 'Claire Silk Minimalist',
          slug: 'claire-silk-minimalist',
          description: 'Váy cưới tối giản chất liệu lụa Mikado nhập khẩu Nhật Bản, điểm nhấn nơ bản lớn phía sau lưng tạo vẻ đẹp vượt thời gian.',
          material: 'Lụa Mikado cao cấp',
          silhouette: 'Chữ A (A-Line)',
          style: 'Tối giản Minimalist',
          color: 'Trắng ngà Ivory',
          rental_price: 8500000,
          sale_price: 24000000,
          video_url: '',
          is_featured: 1,
          images: [
            'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
          ],
        },
        {
          cat: 'vay-cuoi-cao-cap',
          code: 'BB-HC01',
          name: 'Empress Victoria Couture',
          slug: 'empress-victoria-couture',
          description: 'Tuyệt tác Haute Couture thực hiện thủ công hơn 320 giờ với hàng nghìn viên ngọc trai nước ngọt và pha lê ánh hồng Rose Gold.',
          material: 'Organza tơ tằm, Pha lê, Ngọc trai',
          silhouette: 'Công chúa (Ballgown)',
          style: 'Haute Couture xa hoa',
          color: 'Champagne Ivory',
          rental_price: 28000000,
          sale_price: 68000000,
          video_url: 'https://assets.mixkit.co/videos/preview/mixkit-bride-in-a-wedding-dress-posing-42874-large.mp4',
          is_featured: 1,
          images: [
            'https://images.unsplash.com/photo-1546193430-c2d207739ed7?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=85',
          ],
        },
        {
          cat: 'vay-cuoi-truyen-thong',
          code: 'BB-TR01',
          name: 'Ngọc Lan Gấm Lụa Áo Dài',
          slug: 'ngoc-lan-gam-lua-ao-dai',
          description: 'Áo dài cưới truyền thống trên nền lụa tơ tằm trắng ngà, thêu tay họa tiết hoa sen và chim hạc tinh tế cho lễ gia tiên.',
          material: 'Lụa tơ tằm Bảo Lộc, Chỉ tơ thêu tay',
          silhouette: 'Áo dài truyền thống',
          style: 'Truyền thống Á Đông',
          color: 'Trắng ngà / Đỏ son',
          rental_price: 6500000,
          sale_price: 18500000,
          video_url: '',
          is_featured: 0,
          images: [
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
          ],
        },
        {
          cat: 'vay-cuoi-chu-a',
          code: 'BB-AL02',
          name: 'Juliette Satin Off-Shoulder',
          slug: 'juliette-satin-off-shoulder',
          description: 'Váy chữ A trễ vai bằng lụa Satin mềm mại có túi ẩn hai bên tiện lợi, tôn lên bờ vai thanh mảnh của cô dâu.',
          material: 'Lụa Satin Hàn Quốc',
          silhouette: 'Chữ A (A-Line)',
          style: 'Tối giản Minimalist',
          color: 'Trắng ngà Ivory',
          rental_price: 10500000,
          sale_price: 29000000,
          video_url: '',
          is_featured: 0,
          images: [
            'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85',
          ],
        },
      ];

      const insertDress = this.db.prepare(
        `INSERT INTO dresses (category_id, code, name, slug, description, material, silhouette, style, color, rental_price, sale_price, video_url, is_featured, status, meta_title, meta_description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
      );
      const insertImg = this.db.prepare(
        'INSERT INTO dress_images (dress_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)'
      );
      let firstDressId = 0;
      for (const d of [...dresses, ...EXTRA_DRESSES]) {
        const res = insertDress.run(
          catMap[d.cat],
          d.code,
          d.name,
          d.slug,
          d.description,
          d.material,
          d.silhouette,
          d.style,
          d.color,
          d.rental_price,
          d.sale_price,
          d.video_url || null,
          d.is_featured,
          `${d.name} | Thuê váy cưới cao cấp BellaBridal`,
          d.description
        );
        const dressId = Number(res.lastInsertRowid);
        if (!firstDressId) firstDressId = dressId;
        d.images.forEach((url, idx) => {
          insertImg.run(dressId, url, `${d.name} - Váy cưới BellaBridal ${idx + 1}`, idx === 0 ? 1 : 0, idx);
        });
      }

      // 4. Services
      const services = [
        {
          name: 'Cho thuê váy cưới cao cấp',
          slug: 'cho-thue-vay-cuoi',
          short_description: 'Hơn 250+ thiết kế váy cưới nhập khẩu và thiết kế độc quyền, chỉnh sửa vừa vặn theo số đo cô dâu.',
          description: 'Dịch vụ cho thuê váy cưới tại BellaBridal bao gồm tư vấn 1-1 cùng Stylist, chỉnh sửa phom dáng miễn phí theo số đo thực tế, hấp ủi chuẩn studio và bảo quản chuyên nghiệp trước ngày trọng đại.',
          price_from: 6500000,
          price_to: 28000000,
          duration_note: 'Thời gian thuê linh hoạt 3 - 5 ngày',
          image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80',
          icon: 'Sparkles',
          is_featured: 1,
          sort_order: 1,
        },
        {
          name: 'May váy cưới thiết kế riêng',
          slug: 'may-vay-cuoi-thiet-ke-rieng',
          short_description: 'Sở hữu chiếc váy cưới độc bản được phác thảo và may đo thủ công theo câu chuyện tình yêu của riêng bạn.',
          description: 'Nhà thiết kế trực tiếp lấy số đo, tư vấn chất liệu ren Pháp, lụa Ý và dựng phom corset chuẩn xác qua 3 buổi fitting để tạo nên kiệt tác chỉ thuộc về bạn.',
          price_from: 22000000,
          price_to: 75000000,
          duration_note: 'Hoàn thiện trong 4 - 8 tuần',
          image: 'https://images.unsplash.com/photo-1546193430-c2d207739ed7?auto=format&fit=crop&w=900&q=80',
          icon: 'Scissors',
          is_featured: 1,
          sort_order: 2,
        },
        {
          name: 'Chụp ảnh cưới nghệ thuật',
          slug: 'chup-anh-cuoi',
          short_description: 'Ghi lại khoảnh khắc tình yêu tự nhiên, tinh tế tại Studio tối giản, phim trường hoặc ngoại cảnh Đà Lạt, Phú Quốc.',
          description: 'Ekip nhiếp ảnh gia giàu kinh nghiệm định hình concept riêng, ánh sáng điện ảnh tự nhiên và xử lý hậu kỳ màu sắc sang trọng vượt thời gian.',
          price_from: 12000000,
          price_to: 38000000,
          duration_note: 'Trọn gói 1 ngày chụp + Album Photobook',
          image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
          icon: 'Camera',
          is_featured: 1,
          sort_order: 3,
        },
        {
          name: 'Trang điểm cô dâu',
          slug: 'trang-diem-co-dau',
          short_description: 'Phong cách makeup trong veo Hàn Quốc hoặc sang trọng phương Tây, bền đẹp suốt ngày dài.',
          description: 'Sử dụng mỹ phẩm High-end (Charlotte Tilbury, Dior, NARS), tôn vinh đường nét tự nhiên của cô dâu kèm làm tóc và cài phụ kiện đồng bộ với váy cưới.',
          price_from: 3500000,
          price_to: 8500000,
          duration_note: 'Bao gồm làm tóc & dặm phấn tại tiệc',
          image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
          icon: 'Heart',
          is_featured: 1,
          sort_order: 4,
        },
        {
          name: 'Trang phục chú rể',
          slug: 'trang-phuc-chu-re',
          short_description: 'Vest cưới Tuxedo và Suit Bespoke may đo chuẩn mực, lịch lãm đồng điệu cùng cô dâu.',
          description: 'Đa dạng mẫu Tuxedo đen cổ điển, Suit kem, xám tro hoặc xanh navy chất liệu wool Ý thoáng mát, kèm sơ mi, nơ và cà vạt lụa.',
          price_from: 3000000,
          price_to: 12000000,
          duration_note: 'Thuê hoặc may đo theo số đo',
          image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
          icon: 'UserCheck',
          is_featured: 0,
          sort_order: 5,
        },
        {
          name: 'Phụ kiện cưới cao cấp',
          slug: 'phu-kien-cuoi',
          short_description: 'Khăn voan (veil) thêu tay, vương miện pha lê, hoa tai ngọc trai và giày cưới thủ công.',
          description: 'Hoàn thiện diện mạo cô dâu với bộ sưu tập phụ kiện tuyển chọn, phối hợp hài hòa theo từng dáng váy và kiểu tóc.',
          price_from: 800000,
          price_to: 4500000,
          duration_note: 'Miễn phí đi kèm một số gói thuê váy',
          image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=900&q=80',
          icon: 'Gem',
          is_featured: 0,
          sort_order: 6,
        },
        {
          name: 'Gói dịch vụ cưới trọn gói',
          slug: 'goi-dich-vu-cuoi-tron-goi',
          short_description: 'Giải pháp toàn diện từ váy cưới ngày tiệc, áo dài gia tiên, vest chú rể, makeup đến chụp ảnh phóng sự.',
          description: 'Tiết kiệm đến 25% chi phí với gói All-in-One được thiết kế riêng, có Bridal Concierge đồng hành xuyên suốt từ ngày thử váy đến khi kết thúc tiệc cưới.',
          price_from: 29000000,
          price_to: 65000000,
          duration_note: 'Ưu đãi đặc quyền cho cặp đôi đặt sớm',
          image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
          icon: 'Crown',
          is_featured: 1,
          sort_order: 7,
        },
      ];

      const insertSvc = this.db.prepare(
        `INSERT INTO services (name, slug, short_description, description, price_from, price_to, price_unit, duration_note, image, icon, is_featured, sort_order, is_active, meta_title, meta_description)
         VALUES (?, ?, ?, ?, ?, ?, 'VNĐ', ?, ?, ?, ?, ?, 1, ?, ?)`
      );
      let firstServiceId = 0;
      for (const s of services) {
        const res = insertSvc.run(
          s.name, s.slug, s.short_description, s.description, s.price_from, s.price_to,
          s.duration_note, s.image, s.icon, s.is_featured, s.sort_order,
          `${s.name} | BellaBridal Studio`, s.short_description
        );
        if (!firstServiceId) firstServiceId = Number(res.lastInsertRowid);
      }

      // 5. Blog Posts
      const posts = [
        {
          title: 'Bí quyết chọn váy cưới hoàn hảo theo từng vóc dáng cô dâu',
          slug: 'bi-quyet-chon-vay-cuoi-theo-voc-dang',
          category: 'Kinh nghiệm chọn váy cưới',
          excerpt: 'Khám phá cách chọn dáng váy chữ A, công chúa hay đuôi cá để tôn lên ưu điểm và che khuyết điểm tinh tế nhất.',
          content: 'Mỗi cô dâu đều sở hữu nét đẹp riêng biệt. Dáng người đồng hồ cát sẽ tỏa sáng rực rỡ trong mẫu váy đuôi cá ôm sát. Nếu bạn có dáng quả lê với phần hông đầy đặn, váy cưới chữ A hoặc công chúa tùng xòe nhẹ sẽ tạo sự cân đối hoàn hảo.\n\nĐối với cô dâu có vóc dáng nhỏ nhắn, hãy ưu tiên thiết kế eo cao, cổ chữ V thanh thoát và hạn chế chi tiết rườm rà ở phần chân váy để tạo hiệu ứng kéo dài đôi chân.',
          thumbnail: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80',
          daysAgo: 10,
        },
        {
          title: 'Xu hướng váy cưới Minimalist & Quiet Luxury lên ngôi năm 2026',
          slug: 'xu-huong-vay-cuoi-minimalist-2026',
          category: 'Xu hướng váy cưới',
          excerpt: 'Sự lên ngôi của lụa Satin, Mikado và đường cắt may kiến trúc mang lại vẻ đẹp sang trọng vượt thời gian.',
          content: 'Không cần quá nhiều pha lê lấp lánh, xu hướng váy cưới 2026 tôn vinh chất liệu thượng hạng và đường cắt may chuẩn xác. Những chiếc váy lụa Mikado trơn kết hợp nơ lưng bản lớn hoặc khăn voan thêu tên cô dâu chú rể đang được giới mộ điệu yêu thích.',
          thumbnail: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=900&q=80',
          daysAgo: 8,
        },
        {
          title: 'Checklist chuẩn bị đám cưới hoàn hảo trước 6 tháng không lo thiếu sót',
          slug: 'checklist-chuan-bi-dam-cuoi-truoc-6-thang',
          category: 'Kinh nghiệm chuẩn bị đám cưới',
          excerpt: 'Lộ trình chi tiết từng mốc thời gian giúp các cặp đôi chủ động ngân sách, chọn studio và đặt lịch thử váy sớm.',
          content: 'Thời điểm lý tưởng để bắt đầu thử váy cưới là trước ngày cưới từ 3 đến 5 tháng. Điều này giúp bạn có đủ thời gian lựa chọn mẫu váy ưng ý nhất và chỉnh sửa số đo chuẩn xác trước ngày trọng đại.',
          thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
          daysAgo: 6,
        },
        {
          title: 'Chọn phong cách trang điểm cô dâu phù hợp với váy cưới và ánh sáng tiệc',
          slug: 'bi-quyet-chon-phong-cach-trang-diem-co-dau',
          category: 'Bí quyết trang điểm',
          excerpt: 'Tiệc ngoài trời ban ngày cần lớp nền trong veo, trong khi tiệc tối khách sạn đòi hỏi điểm nhấn sắc sảo hơn.',
          content: 'Trang điểm cô dâu cần hài hòa với kiểu dáng váy và không gian tổ chức. Với váy tối giản và tiệc sân vườn, tone cam đào hoặc hồng đất nhẹ nhàng sẽ mang lại vẻ tươi tắn tự nhiên.',
          thumbnail: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
          daysAgo: 4,
        },
      ];

      const insertPost = this.db.prepare(
        `INSERT INTO blog_posts (title, slug, category, excerpt, content, thumbnail, author_id, status, published_at, meta_title, meta_description)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'published', datetime('now', ?), ?, ?)`
      );
      for (const p of posts) {
        insertPost.run(
          p.title, p.slug, p.category, p.excerpt, p.content, p.thumbnail, adminId,
          `-${p.daysAgo} days`, `${p.title} | Tạp chí BellaBridal`, p.excerpt
        );
      }

      // 6. Reviews
      const reviews = [
        {
          customer_name: 'Ngọc Hân & Minh Tuấn',
          service_used: 'Gói dịch vụ cưới trọn gói',
          rating: 5,
          content: 'Không gian BellaBridal thực sự tinh tế và riêng tư. Stylist tư vấn rất có tâm, giúp mình chọn được chiếc váy công chúa Aurelia vừa vặn như may riêng.',
          wedding_date: 'Tháng 10/2026',
          sort_order: 1,
        },
        {
          customer_name: 'Thảo Vy & Quốc Bảo',
          service_used: 'Thuê váy cưới cao cấp & Makeup',
          rating: 5,
          content: 'Váy lụa Mikado ở đây có chất liệu rất đứng phom, lên hình sang trọng vô cùng. Chuyên viên trang điểm nhẹ nhàng nhưng giữ lớp nền suốt 10 tiếng.',
          wedding_date: 'Tháng 09/2026',
          sort_order: 2,
        },
        {
          customer_name: 'Khánh Linh & Hoàng Nam',
          service_used: 'Chụp ảnh cưới & Áo dài gia tiên',
          rating: 5,
          content: 'Ekip chụp ảnh rất nhiệt tình, biết cách bắt khoảnh khắc tự nhiên nên hai vợ chồng không hề bị gượng gạo. Rất đáng tin cậy!',
          wedding_date: 'Tháng 08/2026',
          sort_order: 3,
        },
      ];
      const insertRev = this.db.prepare(
        'INSERT INTO reviews (customer_name, service_used, rating, content, wedding_date, is_featured, is_approved, sort_order) VALUES (?, ?, ?, ?, ?, 1, 1, ?)'
      );
      for (const r of reviews) {
        insertRev.run(r.customer_name, r.service_used, r.rating, r.content, r.wedding_date, r.sort_order);
      }

      // 7. Sample Appointments
      const d1 = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
      const d2 = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      const insertAppt = this.db.prepare(
        `INSERT INTO appointments (booking_code, customer_name, customer_phone, customer_email, appointment_date, time_slot, service_id, dress_id, notes, status, estimated_revenue, confirmed_by, confirmed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      insertAppt.run(
        'BB-20261126-01', 'Nguyễn Thu Hà', '+84 912 345 678', 'thuha@example.com',
        d1, '10:30', firstServiceId, firstDressId,
        'Mong muốn thử thêm 2 mẫu váy chữ A nhẹ nhàng.', 'confirmed', 14500000, adminId, new Date().toISOString()
      );
      insertAppt.run(
        'BB-20261127-02', 'Trần Minh Châu', '+84 987 654 321', 'minhchau@example.com',
        d2, '15:00', firstServiceId, null,
        'Tư vấn gói cưới trọn gói tháng 12.', 'pending', 29000000, null, null
      );

      // 8. Site Settings
      const settings = [
        ['brand_name', 'BellaBridal', 'general'],
        ['brand_tagline', 'Luxury Wedding Studio & Haute Couture Bridal', 'general'],
        ['logo_url', '', 'general'],
        ['lookbook_video_url', 'https://assets.mixkit.co/videos/preview/mixkit-bride-in-a-wedding-dress-posing-42874-large.mp4', 'general'],
        ['hotline', '+84 901 234 567', 'contact'],
        ['email', 'concierge@bellabridal.vn', 'contact'],
        ['address', '128 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', 'contact'],
        ['working_hours', '09:00 - 21:00 (Thứ 2 - Chủ Nhật)', 'contact'],
        ['zalo_url', 'https://zalo.me/84901234567', 'contact'],
        ['zalo_phone', '+84 901 234 567', 'contact'],
        ['facebook_url', 'https://facebook.com/bellabridal.vn', 'contact'],
        ['instagram_url', 'https://instagram.com/bellabridal.vn', 'contact'],
        ['google_maps_embed', 'https://www.google.com/maps?q=128+Dong+Khoi,+Quan+1,+Ho+Chi+Minh&output=embed', 'contact'],
        ['seo_title', 'BellaBridal | Cửa Hàng Váy Cưới Cao Cấp & Studio Áo Cưới Sang Trọng', 'seo'],
        ['seo_description', 'BellaBridal - Studio áo cưới cao cấp hàng đầu. Cho thuê váy cưới đẹp, may đo thiết kế riêng, chụp ảnh cưới và dịch vụ cưới trọn gói.', 'seo'],
        ['ga4_id', '', 'seo'],
        ['gsc_verification', '', 'seo'],
        ['chatbot_enabled', '1', 'chatbot'],
        ['chatbot_welcome', 'Xin chào nàng dâu tương lai! Mình là trợ lý AI của BellaBridal. Mình có thể hỗ trợ bạn chọn váy cưới theo vóc dáng, báo giá thuê váy, tư vấn gói cưới hoặc hướng dẫn đặt lịch thử váy ngay hôm nay.', 'chatbot'],
        ['chatbot_system_prompt', 'Bạn là chuyên viên tư vấn váy cưới cao cấp của BellaBridal Studio. Luôn xưng hô lịch sự, dịu dàng, sang trọng. Chỉ tư vấn dựa trên dữ liệu váy cưới, dịch vụ và chính sách có sẵn của cửa hàng.', 'chatbot'],
        ['chatbot_max_messages', '25', 'chatbot'],
      ];
      const insertSet = this.db.prepare('INSERT INTO site_settings (key, value, group_name) VALUES (?, ?, ?)');
      for (const [k, v, g] of settings) {
        insertSet.run(k, v, g);
      }

      // 9. Chatbot FAQs
      const faqs = [
        ['Giá thuê váy cưới tại BellaBridal là bao nhiêu?', 'Giá thuê váy cưới tại BellaBridal dao động từ 6.500.000 VNĐ cho dòng truyền thống/tối giản đến 28.000.000 VNĐ cho dòng Haute Couture cao cấp. Mọi mẫu thuê đều được chỉnh sửa số đo vừa vặn miễn phí.', 'pricing', 'giá thuê, bao nhiêu tiền, chi phí, bảng giá', 1],
        ['Nên đặt lịch thử váy trước ngày cưới bao lâu?', 'Thời điểm lý tưởng nhất là trước ngày cưới 2 - 4 tháng để bạn có nhiều lựa chọn nhất và kịp chỉnh sửa phom dáng chuẩn xác. Bạn có thể đặt lịch thử váy miễn phí trực tiếp trên website.', 'booking', 'đặt lịch, thử váy, bao lâu, thời gian', 2],
        ['Cô dâu dáng nhỏ nhắn hoặc tròn trịa nên mặc váy gì?', 'Cô dâu nhỏ nhắn rất hợp với váy chữ A eo cao hoặc váy tối giản cổ chữ V để tạo cảm giác thanh thoát. Cô dâu có vòng 2 hoặc bắp tay đầy đặn nên chọn váy chữ A tay lỡ hoặc corset định hình kết hợp tùng xòe nhẹ.', 'styling', 'vóc dáng, nhỏ nhắn, mập, tròn, gầy, thấp, cao, chọn váy', 3],
        ['BellaBridal có dịch vụ cưới trọn gói không?', 'Có ạ! Gói cưới trọn gói tại BellaBridal từ 29.000.000 VNĐ bao gồm váy cưới ngày tiệc, áo dài gia tiên, vest chú rể, trang điểm cô dâu và chụp ảnh cưới nghệ thuật.', 'services', 'trọn gói, combo, chụp ảnh, trang điểm, vest', 4],
      ];
      const insertFaq = this.db.prepare('INSERT INTO chatbot_faqs (question, answer, category, keywords, is_active, sort_order) VALUES (?, ?, ?, ?, 1, ?)');
      for (const f of faqs) {
        insertFaq.run(...f);
      }
    });
  }

  private normalizeAllPhonesToPlus84() {
    this.transaction(() => {
      const settingRows = this.db
        .prepare("SELECT key, value FROM site_settings WHERE key IN ('hotline', 'zalo_phone', 'zalo_url')")
        .all() as { key: string; value: string | null }[];

      const updateSetting = this.db.prepare('UPDATE site_settings SET value = ? WHERE key = ?');
      for (const row of settingRows) {
        if (!row.value) continue;
        if (row.key === 'zalo_url') {
          const updatedUrl = row.value.replace(/zalo\.me\/0(\d+)/g, 'zalo.me/84$1');
          if (updatedUrl !== row.value) updateSetting.run(updatedUrl, row.key);
        } else {
          const formatted = formatVnPhonePlus84(row.value);
          if (formatted !== row.value) updateSetting.run(formatted, row.key);
        }
      }

      const users = this.db.prepare('SELECT id, phone FROM users WHERE phone IS NOT NULL').all() as {
        id: number;
        phone: string;
      }[];
      const updateUser = this.db.prepare('UPDATE users SET phone = ? WHERE id = ?');
      for (const u of users) {
        const formatted = formatVnPhonePlus84(u.phone);
        if (formatted !== u.phone) updateUser.run(formatted, u.id);
      }

      const appts = this.db.prepare('SELECT id, customer_phone FROM appointments').all() as {
        id: number;
        customer_phone: string;
      }[];
      const updateAppt = this.db.prepare('UPDATE appointments SET customer_phone = ? WHERE id = ?');
      for (const a of appts) {
        const formatted = formatVnPhonePlus84(a.customer_phone);
        if (formatted !== a.customer_phone) updateAppt.run(formatted, a.id);
      }

      const contacts = this.db.prepare('SELECT id, phone FROM contact_messages').all() as {
        id: number;
        phone: string;
      }[];
      const updateContact = this.db.prepare('UPDATE contact_messages SET phone = ? WHERE id = ?');
      for (const c of contacts) {
        const formatted = formatVnPhonePlus84(c.phone);
        if (formatted !== c.phone) updateContact.run(formatted, c.id);
      }
    });
  }
}
