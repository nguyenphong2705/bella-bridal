<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function __construct(private ChatbotService $chatbotService)
    {
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'min:1', 'max:1000'],
            'session_token' => ['nullable', 'string', 'max:64'],
            'customer_name' => ['nullable', 'string', 'max:100'],
        ]);

        $result = $this->chatbotService->handleMessage(
            trim($validated['message']),
            $validated['session_token'] ?? null,
            $validated['customer_name'] ?? null
        );

        return response()->json($result);
    }

    public function history(Request $request): JsonResponse
    {
        $token = $request->string('session_token')->toString();
        if (! $token) {
            return response()->json(['messages' => []]);
        }

        $session = ChatSession::where('session_token', $token)->first();
        if (! $session) {
            return response()->json(['messages' => []]);
        }

        return response()->json([
            'status' => $session->status,
            'messages' => $session->messages()->get(),
        ]);
    }

    public function handoff(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_token' => ['required', 'string', 'max:64'],
            'customer_name' => ['nullable', 'string', 'max:100'],
            'customer_phone' => ['nullable', 'string', 'max:20'],
        ]);

        $session = $this->chatbotService->requestHandoff(
            $validated['session_token'],
            $validated['customer_name'] ?? null,
            $validated['customer_phone'] ?? null
        );

        return response()->json([
            'message' => 'Đã chuyển cuộc hội thoại sang nhân viên tư vấn.',
            'session' => $session,
        ]);
    }
}
