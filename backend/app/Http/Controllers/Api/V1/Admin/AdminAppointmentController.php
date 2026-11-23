<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::query()
            ->with(['service:id,name', 'dress:id,name,code', 'confirmedByUser:id,name']);

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($date = $request->string('date')->toString()) {
            $query->whereDate('appointment_date', $date);
        }

        if ($range = $request->string('range')->toString()) {
            match ($range) {
                'today' => $query->whereDate('appointment_date', now()->toDateString()),
                'week' => $query->whereBetween('appointment_date', [now()->startOfWeek()->toDateString(), now()->endOfWeek()->toDateString()]),
                'month' => $query->whereBetween('appointment_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()]),
                default => null,
            };
        }

        if ($search = trim($request->string('search')->toString())) {
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%")
                    ->orWhere('booking_code', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderBy('appointment_date')->orderBy('time_slot')->paginate(20)
        );
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:pending,confirmed,completed,cancelled'],
            'appointment_date' => ['sometimes', 'date'],
            'time_slot' => ['sometimes', 'string', 'max:20'],
            'admin_note' => ['nullable', 'string', 'max:1000'],
            'estimated_revenue' => ['sometimes', 'integer', 'min:0'],
        ]);

        if (($validated['status'] ?? null) === 'confirmed' && ! $appointment->confirmed_at) {
            $validated['confirmed_by'] = $request->user()->id;
            $validated['confirmed_at'] = now();
        }

        $appointment->update($validated);

        return response()->json([
            'message' => 'Cập nhật lịch hẹn thành công.',
            'data' => $appointment->load(['service:id,name', 'dress:id,name,code']),
        ]);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return response()->json(['message' => 'Đã xóa lịch hẹn.']);
    }
}
