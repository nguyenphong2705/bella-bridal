import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { DatabaseService, formatVnPhonePlus84 } from '../database/database.service';
import { NotificationService } from '../notifications/notification.service';

export const TIME_SLOTS = ['09:00', '10:30', '13:30', '15:00', '16:30', '18:00'] as const;

export interface SlotAvailability {
  time_slot: string;
  available: boolean;
}

@Injectable()
export class AppointmentsService {
  public readonly availabilityEvents$ = new Subject<{ date: string; slots: SlotAvailability[] }>();

  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(NotificationService) private readonly notifications: NotificationService
  ) {}

  getAvailability(date: string): SlotAvailability[] {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException({ message: 'Ngày hẹn không hợp lệ (YYYY-MM-DD).' });
    }
    const rows = this.db.db
      .prepare(
        `SELECT time_slot FROM appointments WHERE appointment_date = ? AND status IN ('pending', 'confirmed')`
      )
      .all(date) as { time_slot: string }[];
    const booked = new Set(rows.map((r) => r.time_slot));
    return TIME_SLOTS.map((slot) => ({
      time_slot: slot,
      available: !booked.has(slot),
    }));
  }

  emitAvailabilityUpdate(date: string) {
    this.availabilityEvents$.next({
      date,
      slots: this.getAvailability(date),
    });
  }

  async createBooking(body: {
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    appointment_date?: string;
    time_slot?: string;
    service_id?: number | string | null;
    dress_id?: number | string | null;
    notes?: string;
  }) {
    const customerName = (body.customer_name || '').trim();
    const rawCustomerPhone = (body.customer_phone || '').trim();
    const customerPhone = rawCustomerPhone ? formatVnPhonePlus84(rawCustomerPhone) : '';
    const customerEmail = (body.customer_email || '').trim() || null;
    const appointmentDate = (body.appointment_date || '').trim();
    const timeSlot = (body.time_slot || '').trim();
    const serviceId = body.service_id ? Number(body.service_id) : null;
    const dressId = body.dress_id ? Number(body.dress_id) : null;
    const notes = (body.notes || '').trim() || null;

    if (!customerName || !customerPhone || !appointmentDate || !timeSlot) {
      throw new BadRequestException({
        message: 'Vui lòng điền đầy đủ họ tên, số điện thoại, ngày hẹn và khung giờ.',
      });
    }
    if (!TIME_SLOTS.includes(timeSlot as (typeof TIME_SLOTS)[number])) {
      throw new BadRequestException({ message: 'Khung giờ thử váy không hợp lệ.' });
    }

    const created = this.db.transaction(() => {
      const existing = this.db.db
        .prepare(
          `SELECT id FROM appointments WHERE appointment_date = ? AND time_slot = ? AND status IN ('pending', 'confirmed')`
        )
        .get(appointmentDate, timeSlot);

      if (existing) {
        throw new ConflictException({
          message: 'Khung giờ này đã có khách đặt trước. Vui lòng chọn khung giờ khác.',
          errors: { time_slot: ['Khung giờ này đã có khách đặt trước.'] },
        });
      }

      let estimatedRevenue = 0;
      let dressName: string | null = null;
      let serviceName: string | null = null;

      if (dressId) {
        const d = this.db.db.prepare('SELECT name, rental_price FROM dresses WHERE id = ?').get(dressId) as
          | { name: string; rental_price: number }
          | undefined;
        if (d) {
          estimatedRevenue = d.rental_price;
          dressName = d.name;
        }
      }
      if (serviceId) {
        const s = this.db.db.prepare('SELECT name, price_from FROM services WHERE id = ?').get(serviceId) as
          | { name: string; price_from: number }
          | undefined;
        if (s) {
          if (!estimatedRevenue) estimatedRevenue = s.price_from;
          serviceName = s.name;
        }
      }

      const compactDate = appointmentDate.replace(/-/g, '');
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      const bookingCode = `BB-${compactDate}-${rand}`;

      const res = this.db.db
        .prepare(
          `INSERT INTO appointments (booking_code, customer_name, customer_phone, customer_email, appointment_date, time_slot, service_id, dress_id, notes, status, estimated_revenue)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
        )
        .run(
          bookingCode,
          customerName,
          customerPhone,
          customerEmail,
          appointmentDate,
          timeSlot,
          serviceId,
          dressId,
          notes,
          estimatedRevenue
        );

      const id = Number(res.lastInsertRowid);
      const appt = this.db.db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as Record<string, unknown>;
      return { appt, serviceName, dressName };
    });

    // Broadcast real-time slot update to all connected booking pages
    this.emitAvailabilityUpdate(appointmentDate);

    // Dispatch Zalo ZNS, SMS & Email notifications
    const notificationResults = await this.notifications.dispatchBookingNotifications({
      appointmentId: Number(created.appt.id),
      bookingCode: String(created.appt.booking_code),
      customerName,
      customerPhone,
      customerEmail,
      appointmentDate,
      timeSlot,
      serviceName: created.serviceName,
      dressName: created.dressName,
      event: 'booking_created',
    });

    return {
      message: 'Đặt lịch thử váy thành công! Hệ thống đã gửi xác nhận qua Zalo ZNS, SMS & Email.',
      data: {
        ...created.appt,
        service: created.serviceName ? { id: serviceId, name: created.serviceName } : null,
        dress: created.dressName ? { id: dressId, name: created.dressName } : null,
        notifications: notificationResults,
      },
    };
  }
}
