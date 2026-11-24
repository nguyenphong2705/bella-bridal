import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { DatabaseService } from '../database/database.service';

export interface AppointmentNotificationPayload {
  appointmentId: number;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  appointmentDate: string;
  timeSlot: string;
  serviceName?: string | null;
  dressName?: string | null;
  event: 'booking_created' | 'booking_confirmed' | 'booking_cancelled';
}

export interface NotificationResult {
  channel: 'zalo_zns' | 'sms' | 'email';
  status: 'sent' | 'simulated' | 'failed';
  recipient: string;
  message: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly db: DatabaseService) {}

  async dispatchBookingNotifications(payload: AppointmentNotificationPayload): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // 1. Zalo ZNS
    results.push(await this.sendZaloZns(payload));

    // 2. SMS
    results.push(await this.sendSms(payload));

    // 3. Email (if email provided)
    if (payload.customerEmail) {
      results.push(await this.sendEmail(payload));
    }

    return results;
  }

  private formatVietnameseText(p: AppointmentNotificationPayload): string {
    const item = p.dressName || p.serviceName || 'Tư vấn & Thử váy cưới';
    if (p.event === 'booking_confirmed') {
      return `[BellaBridal] Lịch hẹn ${p.bookingCode} đã ĐƯỢC XÁC NHẬN lúc ${p.timeSlot} ngày ${p.appointmentDate} (${item}). Hân hạnh đón tiếp nàng dâu ${p.customerName} tại 128 Đồng Khởi, Q.1!`;
    }
    if (p.event === 'booking_cancelled') {
      return `[BellaBridal] Lịch hẹn ${p.bookingCode} ngày ${p.appointmentDate} lúc ${p.timeSlot} đã được hủy. Liên hệ hotline 0901 234 567 nếu bạn cần đặt lại lịch.`;
    }
    return `[BellaBridal] Cảm ơn ${p.customerName} đã đặt lịch hẹn ${p.bookingCode} lúc ${p.timeSlot} ngày ${p.appointmentDate} (${item}). Stylist sẽ liên hệ xác nhận sớm nhất!`;
  }

  private normalizeVnPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) return '84' + digits.slice(1);
    if (digits.startsWith('84')) return digits;
    return '84' + digits;
  }

  private async sendZaloZns(p: AppointmentNotificationPayload): Promise<NotificationResult> {
    const token = process.env.ZALO_OA_ACCESS_TOKEN;
    const templateId = process.env.ZALO_ZNS_TEMPLATE_ID;
    const endpoint = process.env.ZALO_ZNS_ENDPOINT || 'https://business.openapi.zalo.me/message/template';
    const recipient = this.normalizeVnPhone(p.customerPhone);
    const text = this.formatVietnameseText(p);

    const body = {
      phone: recipient,
      template_id: templateId || 'BELLA_BOOKING_ZNS',
      template_data: {
        booking_code: p.bookingCode,
        customer_name: p.customerName,
        appointment_date: p.appointmentDate,
        time_slot: p.timeSlot,
        service_name: p.dressName || p.serviceName || 'Thử váy cưới',
        status: p.event,
      },
      tracking_id: p.bookingCode,
    };

    let status: 'sent' | 'simulated' | 'failed' = 'simulated';
    let responseMessage = 'Zalo ZNS simulated (chưa cấu hình ZALO_OA_ACCESS_TOKEN)';

    if (token && templateId) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            access_token: token,
          },
          body: JSON.stringify(body),
        });
        const json = (await res.json()) as { error?: number; message?: string };
        if (res.ok && (json.error === 0 || json.error === undefined)) {
          status = 'sent';
          responseMessage = 'Zalo ZNS delivered';
        } else {
          status = 'failed';
          responseMessage = `Zalo ZNS error: ${json.message || res.status}`;
        }
      } catch (err) {
        status = 'failed';
        responseMessage = `Zalo ZNS exception: ${(err as Error).message}`;
      }
    } else {
      this.logger.log(`[Zalo ZNS Simulated -> ${recipient}] ${text}`);
    }

    this.logNotification(p.appointmentId, 'zalo_zns', recipient, status, JSON.stringify(body), responseMessage);
    return { channel: 'zalo_zns', status, recipient, message: responseMessage };
  }

  private async sendSms(p: AppointmentNotificationPayload): Promise<NotificationResult> {
    const apiUrl = process.env.SMS_API_URL;
    const apiKey = process.env.SMS_API_KEY;
    const recipient = p.customerPhone;
    const text = this.formatVietnameseText(p);

    let status: 'sent' | 'simulated' | 'failed' = 'simulated';
    let responseMessage = 'SMS simulated (chưa cấu hình SMS_API_URL)';

    if (apiUrl && apiKey) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ApiKey: apiKey,
            SecretKey: process.env.SMS_SECRET_KEY || '',
            Brandname: process.env.SMS_BRANDNAME || 'BellaBridal',
            Phone: recipient,
            Content: text,
          }),
        });
        if (res.ok) {
          status = 'sent';
          responseMessage = 'SMS delivered';
        } else {
          status = 'failed';
          responseMessage = `SMS HTTP ${res.status}`;
        }
      } catch (err) {
        status = 'failed';
        responseMessage = `SMS exception: ${(err as Error).message}`;
      }
    } else {
      this.logger.log(`[SMS Simulated -> ${recipient}] ${text}`);
    }

    this.logNotification(p.appointmentId, 'sms', recipient, status, text, responseMessage);
    return { channel: 'sms', status, recipient, message: responseMessage };
  }

  private async sendEmail(p: AppointmentNotificationPayload): Promise<NotificationResult> {
    const recipient = p.customerEmail || '';
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const text = this.formatVietnameseText(p);

    let status: 'sent' | 'simulated' | 'failed' = 'simulated';
    let responseMessage = 'Email simulated (chưa cấu hình SMTP_HOST)';

    if (host && user && pass) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT || 587) === 465,
          auth: { user, pass },
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"BellaBridal Studio" <concierge@bellabridal.vn>',
          to: recipient,
          subject: `[BellaBridal] Xác nhận lịch hẹn ${p.bookingCode}`,
          text,
          html: `
            <div style="font-family: Georgia, serif; background:#FFFDF8; padding:24px; color:#4A4141; border:1px solid #EBCFD5; border-radius:12px;">
              <h2 style="color:#A87C73; margin-top:0;">BellaBridal Studio</h2>
              <p>${text}</p>
              <hr style="border:none; border-top:1px solid #EBCFD5; margin:16px 0;" />
              <p style="font-size:12px; color:#7A6F6F;">128 Đồng Khởi, Quận 1, TP. Hồ Chí Minh • Hotline: 0901 234 567</p>
            </div>
          `,
        });
        status = 'sent';
        responseMessage = 'Email delivered';
      } catch (err) {
        status = 'failed';
        responseMessage = `Email exception: ${(err as Error).message}`;
      }
    } else {
      this.logger.log(`[Email Simulated -> ${recipient}] ${text}`);
    }

    this.logNotification(p.appointmentId, 'email', recipient, status, text, responseMessage);
    return { channel: 'email', status, recipient, message: responseMessage };
  }

  private logNotification(
    appointmentId: number,
    channel: string,
    recipient: string,
    status: string,
    payload: string,
    responseMessage: string
  ) {
    this.db.db
      .prepare(
        'INSERT INTO notification_logs (appointment_id, channel, recipient, status, payload, response_message) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(appointmentId, channel, recipient, status, payload, responseMessage);
  }
}
