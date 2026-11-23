<?php

namespace App\Services;

use App\Mail\AppointmentConfirmationMail;
use App\Models\Appointment;
use App\Models\Dress;
use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AppointmentService
{
    public const TIME_SLOTS = [
        '09:00',
        '10:30',
        '13:30',
        '15:00',
        '16:30',
        '18:00',
    ];

    public function getAvailability(string $date): array
    {
        $bookedSlots = Appointment::query()
            ->whereDate('appointment_date', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->pluck('time_slot')
            ->all();

        return array_map(function (string $slot) use ($bookedSlots) {
            return [
                'time_slot' => $slot,
                'available' => ! in_array($slot, $bookedSlots, true),
            ];
        }, self::TIME_SLOTS);
    }

    public function createBooking(array $data): Appointment
    {
        $appointment = DB::transaction(function () use ($data) {
            $exists = Appointment::query()
                ->whereDate('appointment_date', $data['appointment_date'])
                ->where('time_slot', $data['time_slot'])
                ->whereIn('status', ['pending', 'confirmed'])
                ->lockForUpdate()
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'time_slot' => ['Khung giờ này đã có khách đặt trước. Vui lòng chọn khung giờ khác.'],
                ]);
            }

            $estimatedRevenue = 0;
            if (! empty($data['dress_id'])) {
                $estimatedRevenue = (int) (Dress::whereKey($data['dress_id'])->value('rental_price') ?? 0);
            } elseif (! empty($data['service_id'])) {
                $estimatedRevenue = (int) (Service::whereKey($data['service_id'])->value('price_from') ?? 0);
            }

            $code = 'BB-'.date('Ymd', strtotime($data['appointment_date'])).'-'.strtoupper(substr(uniqid(), -4));

            return Appointment::create([
                'booking_code' => $code,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'appointment_date' => $data['appointment_date'],
                'time_slot' => $data['time_slot'],
                'service_id' => $data['service_id'] ?? null,
                'dress_id' => $data['dress_id'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'pending',
                'estimated_revenue' => $estimatedRevenue,
            ]);
        });

        $appointment->load(['service', 'dress']);

        if (! empty($appointment->customer_email) && config('mail.default') !== 'log') {
            try {
                Mail::to($appointment->customer_email)->send(new AppointmentConfirmationMail($appointment));
            } catch (\Throwable $e) {
                Log::warning('Booking email failed: '.$e->getMessage());
            }
        }

        return $appointment;
    }
}
