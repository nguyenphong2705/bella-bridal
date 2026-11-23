<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatbotFaq;
use App\Models\ChatSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminChatbotController extends Controller
{
    public function sessions(): JsonResponse
    {
        $sessions = ChatSession::with(['messages'])
            ->latest('last_message_at')
            ->paginate(15);

        return response()->json($sessions);
    }

    public function faqs(): JsonResponse
    {
        return response()->json([
            'data' => ChatbotFaq::orderBy('sort_order')->get(),
        ]);
    }

    public function storeFaq(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:255'],
            'answer' => ['required', 'string', 'max:2000'],
            'category' => ['required', 'string', 'max:80'],
            'keywords' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ]);

        $faq = ChatbotFaq::create($validated);

        return response()->json(['data' => $faq], 201);
    }

    public function updateFaq(Request $request, ChatbotFaq $faq): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:255'],
            'answer' => ['required', 'string', 'max:2000'],
            'category' => ['required', 'string', 'max:80'],
            'keywords' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ]);

        $faq->update($validated);

        return response()->json(['data' => $faq]);
    }

    public function destroyFaq(ChatbotFaq $faq): JsonResponse
    {
        $faq->delete();

        return response()->json(['message' => 'Đã xóa FAQ.']);
    }
}
