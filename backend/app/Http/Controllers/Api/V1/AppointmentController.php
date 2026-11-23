<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AppointmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    public function __construct(private AppointmentService $appointmentService)
    {
    }

    public function availability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        return response()->json([
            'date' => $validated['date'],
            'slots' => $this->appointmentService->getAvailability($validated['date']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'min:2', 'max:120'],
            'customer_phone' => ['required', 'string', 'regex:/^(0|\+84)[0-9]{8,11}$/'],
            'customer_email' => ['nullable', 'email', 'max:150'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'time_slot' => ['required', Rule::in(AppointmentService::TIME_SLOTS)],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'dress_id' => ['nullable', 'integer', 'exists:dresses,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ], [
            'customer_phone.regex' => 'Số điện thoại không đúng định dạng Việt Nam.',
            'appointment_date.after_or_equal' => 'Ngày hẹn phải từ hôm nay trở đi.',
        ]);

        $appointment = $this->appointmentService->createBooking($validated);

        return response()->json([
            'message' => 'Đặt lịch tư vấn thành công! BellaBridal sẽ sớm liên hệ xác nhận.',
            'appointment' => $appointment,
        ], 201);
    }
}
