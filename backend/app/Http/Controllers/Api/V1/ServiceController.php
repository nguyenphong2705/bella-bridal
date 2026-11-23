<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    public function index(): JsonResponse
    {
        $services = Service::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $services]);
    }

    public function show(string $slug): JsonResponse
    {
        $service = Service::query()
            ->where('is_active', true)
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json(['data' => $service]);
    }
}
