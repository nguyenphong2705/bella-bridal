<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminCustomerController extends Controller
{
    public function index(): JsonResponse
    {
        $customers = Appointment::query()
            ->select(
                'customer_phone',
                DB::raw('MAX(customer_name) as customer_name'),
                DB::raw('MAX(customer_email) as customer_email'),
                DB::raw('COUNT(*) as total_bookings'),
                DB::raw('MAX(appointment_date) as last_appointment_date'),
                DB::raw('SUM(estimated_revenue) as total_estimated_value')
            )
            ->groupBy('customer_phone')
            ->orderByDesc('last_appointment_date')
            ->paginate(20);

        $contacts = ContactMessage::latest()->limit(30)->get();

        return response()->json([
            'customers' => $customers,
            'contacts' => $contacts,
        ]);
    }
}
