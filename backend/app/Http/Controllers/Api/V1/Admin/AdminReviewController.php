<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminReviewController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Review::orderBy('sort_order')->latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:150'],
            'service_used' => ['nullable', 'string', 'max:150'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'content' => ['required', 'string', 'max:1000'],
            'wedding_date' => ['nullable', 'string', 'max:50'],
            'is_featured' => ['boolean'],
            'is_approved' => ['boolean'],
        ]);

        $review = Review::create($validated);
        Cache::forget('home_payload');

        return response()->json(['data' => $review], 201);
    }

    public function update(Request $request, Review $review): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => ['sometimes', 'string', 'max:150'],
            'service_used' => ['nullable', 'string', 'max:150'],
            'rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'content' => ['sometimes', 'string', 'max:1000'],
            'is_featured' => ['boolean'],
            'is_approved' => ['boolean'],
        ]);

        $review->update($validated);
        Cache::forget('home_payload');

        return response()->json(['data' => $review]);
    }

    public function destroy(Review $review): JsonResponse
    {
        $review->delete();
        Cache::forget('home_payload');

        return response()->json(['message' => 'Đã xóa đánh giá.']);
    }
}
