<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function reviews(): JsonResponse
    {
        $reviews = Review::query()
            ->where('is_approved', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $reviews]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:150'],
            'subject' => ['nullable', 'string', 'max:200'],
            'message' => ['required', 'string', 'min:5', 'max:2000'],
        ]);

        $contact = ContactMessage::create($validated + ['status' => 'new']);

        return response()->json([
            'message' => 'Cảm ơn bạn đã gửi liên hệ. Chuyên viên BellaBridal sẽ phản hồi trong thời gian sớm nhất.',
            'data' => $contact,
        ], 201);
    }
}
