<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminServiceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Service::orderBy('sort_order')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:160', 'unique:services,slug'],
            'short_description' => ['required', 'string', 'max:500'],
            'description' => ['required', 'string'],
            'price_from' => ['required', 'integer', 'min:0'],
            'price_to' => ['nullable', 'integer', 'min:0'],
            'duration_note' => ['nullable', 'string', 'max:200'],
            'image' => ['nullable', 'string', 'max:500'],
            'icon' => ['nullable', 'string', 'max:50'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $service = Service::create($validated);
        Cache::forget('home_payload');

        return response()->json(['data' => $service], 201);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'short_description' => ['required', 'string', 'max:500'],
            'description' => ['required', 'string'],
            'price_from' => ['required', 'integer', 'min:0'],
            'price_to' => ['nullable', 'integer', 'min:0'],
            'duration_note' => ['nullable', 'string', 'max:200'],
            'image' => ['nullable', 'string', 'max:500'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $service->update($validated);
        Cache::forget('home_payload');

        return response()->json(['data' => $service]);
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->delete();
        Cache::forget('home_payload');

        return response()->json(['message' => 'Đã xóa dịch vụ.']);
    }
}
