<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Appointment $appointment)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[BellaBridal] Xác nhận yêu cầu đặt lịch tư vấn - '.$this->appointment->booking_code,
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $a = $this->appointment;
        $serviceName = $a->service?->name ?? 'Tư vấn chung';
        $dressName = $a->dress?->name ?? 'Chưa chọn cụ thể';

        return <<<HTML
        <div style="font-family: Georgia, serif; background: #FFFDF8; color: #4A4141; padding: 32px; border: 1px solid #EBCFD5; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #C69A91; margin-top: 0;">BellaBridal Luxury Studio</h2>
            <p>Thân gửi <strong>{$a->customer_name}</strong>,</p>
            <p>Cảm ơn bạn đã đặt lịch tư vấn tại BellaBridal. Thông tin lịch hẹn của bạn đã được ghi nhận:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #F8F3ED;">
                <tr><td style="padding: 8px 12px;"><strong>Mã đặt lịch:</strong></td><td style="padding: 8px 12px;">{$a->booking_code}</td></tr>
                <tr><td style="padding: 8px 12px;"><strong>Ngày hẹn:</strong></td><td style="padding: 8px 12px;">{$a->appointment_date->format('d/m/Y')}</td></tr>
                <tr><td style="padding: 8px 12px;"><strong>Khung giờ:</strong></td><td style="padding: 8px 12px;">{$a->time_slot}</td></tr>
                <tr><td style="padding: 8px 12px;"><strong>Dịch vụ:</strong></td><td style="padding: 8px 12px;">{$serviceName}</td></tr>
                <tr><td style="padding: 8px 12px;"><strong>Mẫu váy quan tâm:</strong></td><td style="padding: 8px 12px;">{$dressName}</td></tr>
            </table>
            <p>Chuyên viên tư vấn của BellaBridal sẽ liên hệ xác nhận trong thời gian sớm nhất.</p>
            <p style="color: #8c7a7a; font-size: 13px;">Trân trọng,<br>BellaBridal Concierge</p>
        </div>
        HTML;
    }
}
