<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\BlogPost;
use App\Models\Dress;
use App\Models\Service;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getSummary(): array
    {
        $totalCustomers = Appointment::query()->distinct('customer_phone')->count('customer_phone');
        $totalAppointments = Appointment::query()->count();
        $pendingAppointments = Appointment::query()->where('status', 'pending')->count();
        $confirmedRevenue = (int) Appointment::query()
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('estimated_revenue');

        $byStatus = Appointment::query()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $monthlyBookings = Appointment::query()
            ->select(DB::raw("strftime('%Y-%m', appointment_date) as month"))
            ->when(DB::getDriverName() === 'mysql', function ($q) {
                $q->select(DB::raw("DATE_FORMAT(appointment_date, '%Y-%m') as month"));
            })
            ->when(DB::getDriverName() === 'pgsql', function ($q) {
                $q->select(DB::raw("TO_CHAR(appointment_date, 'YYYY-MM') as month"));
            })
            ->addSelect(DB::raw('count(*) as total'))
            ->groupBy('month')
            ->orderBy('month')
            ->limit(6)
            ->get();

        return [
            'stats' => [
                'total_customers' => $totalCustomers,
                'total_appointments' => $totalAppointments,
                'pending_appointments' => $pendingAppointments,
                'estimated_revenue' => $confirmedRevenue,
                'total_dresses' => Dress::count(),
                'total_services' => Service::count(),
                'total_posts' => BlogPost::count(),
            ],
            'appointments_by_status' => $byStatus,
            'monthly_bookings' => $monthlyBookings,
            'recent_appointments' => Appointment::with(['service', 'dress'])
                ->latest()
                ->limit(8)
                ->get(),
        ];
    }
}
