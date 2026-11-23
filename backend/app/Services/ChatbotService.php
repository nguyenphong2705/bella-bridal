<?php

namespace App\Services;

use App\Models\ChatbotFaq;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Models\Dress;
use App\Models\Service;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChatbotService
{
    public function handleMessage(string $message, ?string $sessionToken = null, ?string $customerName = null): array
    {
        $settings = SiteSetting::getMap();
        $maxMessages = (int) ($settings['chatbot_max_messages'] ?? 25);

        $session = $sessionToken
            ? ChatSession::where('session_token', $sessionToken)->first()
            : null;

        if (! $session) {
            $session = ChatSession::create([
                'session_token' => (string) Str::uuid(),
                'customer_name' => $customerName,
                'status' => 'active',
                'message_count' => 0,
                'last_message_at' => now(),
            ]);
        }

        if ($session->message_count >= $maxMessages) {
            return [
                'session_token' => $session->session_token,
                'reply' => 'Phiên trò chuyện đã đạt giới hạn tin nhắn để đảm bảo chất lượng phục vụ. Bạn vui lòng chuyển sang nhân viên tư vấn trực tiếp qua Zalo hoặc đặt lịch hẹn để được hỗ trợ chu đáo nhất nhé!',
                'suggested_dresses' => [],
                'needs_handoff' => true,
                'limit_reached' => true,
            ];
        }

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender' => 'user',
            'content' => $message,
        ]);

        $matchedDresses = $this->findRelevantDresses($message);
        $replyText = $this->generateReply($session, $message, $matchedDresses, $settings);

        $suggestedPayload = $matchedDresses->map(fn (Dress $d) => [
            'id' => $d->id,
            'code' => $d->code,
            'name' => $d->name,
            'slug' => $d->slug,
            'rental_price' => $d->rental_price,
            'image' => $d->images->first()?->image_url,
        ])->values()->all();

        $assistantMsg = ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender' => 'assistant',
            'content' => $replyText,
            'suggested_dresses' => $suggestedPayload,
        ]);

        $session->increment('message_count');
        $session->update(['last_message_at' => now()]);

        return [
            'session_token' => $session->session_token,
            'message_id' => $assistantMsg->id,
            'reply' => $replyText,
            'suggested_dresses' => $suggestedPayload,
            'needs_handoff' => $this->shouldSuggestHandoff($message, $replyText),
            'limit_reached' => false,
        ];
    }

    public function requestHandoff(string $sessionToken, ?string $name = null, ?string $phone = null): ChatSession
    {
        $session = ChatSession::firstOrCreate(
            ['session_token' => $sessionToken],
            ['status' => 'handoff', 'last_message_at' => now()]
        );

        $session->update([
            'status' => 'handoff',
            'customer_name' => $name ?: $session->customer_name,
            'customer_phone' => $phone ?: $session->customer_phone,
            'last_message_at' => now(),
        ]);

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender' => 'staff',
            'content' => 'Yêu cầu kết nối nhân viên tư vấn đã được ghi nhận. Bạn có thể nhấn nút Chat Zalo ngay bên dưới hoặc chờ chuyên viên BellaBridal liên hệ qua số điện thoại bạn đã cung cấp.',
        ]);

        return $session;
    }

    private function findRelevantDresses(string $message)
    {
        $lower = mb_strtolower($message);
        $query = Dress::query()->active()->with(['images', 'category']);

        $keywords = ['công chúa', 'chữ a', 'đuôi cá', 'tối giản', 'cao cấp', 'áo dài', 'truyền thống', 'lụa', 'ren', 'nhỏ nhắn', 'tròn'];
        $matched = false;

        foreach ($keywords as $kw) {
            if (str_contains($lower, $kw)) {
                $matched = true;
                break;
            }
        }

        if ($matched) {
            $query->where(function ($q) use ($lower) {
                if (str_contains($lower, 'công chúa')) {
                    $q->orWhere('silhouette', 'like', '%Công chúa%');
                }
                if (str_contains($lower, 'chữ a') || str_contains($lower, 'nhỏ nhắn') || str_contains($lower, 'tròn')) {
                    $q->orWhere('silhouette', 'like', '%Chữ A%');
                }
                if (str_contains($lower, 'đuôi cá')) {
                    $q->orWhere('silhouette', 'like', '%Đuôi cá%');
                }
                if (str_contains($lower, 'tối giản') || str_contains($lower, 'lụa')) {
                    $q->orWhere('style', 'like', '%Tối giản%');
                }
                if (str_contains($lower, 'cao cấp')) {
                    $q->orWhere('style', 'like', '%Couture%');
                }
                if (str_contains($lower, 'áo dài') || str_contains($lower, 'truyền thống')) {
                    $q->orWhere('silhouette', 'like', '%Áo dài%');
                }
            });
        } else {
            $query->where('is_featured', true);
        }

        return $query->limit(3)->get();
    }

    private function generateReply(ChatSession $session, string $userMessage, $dresses, array $settings): string
    {
        $apiKey = config('services.openai.api_key');

        if (! empty($apiKey)) {
            $context = $this->buildStoreContext($dresses, $settings);
            $history = $session->messages()->latest('id')->limit(8)->get()->reverse();

            $messages = [
                [
                    'role' => 'system',
                    'content' => ($settings['chatbot_system_prompt'] ?? 'Bạn là chuyên viên tư vấn váy cưới BellaBridal.')."\n\nDỮ LIỆU CỬA HÀNG THỰC TẾ:\n".$context,
                ],
            ];

            foreach ($history as $msg) {
                $messages[] = [
                    'role' => $msg->sender === 'user' ? 'user' : 'assistant',
                    'content' => $msg->content,
                ];
            }

            try {
                $response = Http::withToken($apiKey)
                    ->timeout(config('services.openai.timeout', 25))
                    ->post(config('services.openai.base_url').'/chat/completions', [
                        'model' => config('services.openai.model', 'gpt-4o-mini'),
                        'messages' => $messages,
                        'temperature' => 0.5,
                        'max_tokens' => 500,
                    ]);

                if ($response->successful()) {
                    $aiContent = $response->json('choices.0.message.content');
                    if (! empty($aiContent)) {
                        return trim($aiContent);
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('AI Chatbot API error: '.$e->getMessage());
            }
        }

        return $this->fallbackGroundedReply($userMessage, $dresses, $settings);
    }

    private function buildStoreContext($dresses, array $settings): string
    {
        $dressLines = Dress::query()->active()->with('category')->limit(15)->get()->map(function (Dress $d) {
            return "- [{$d->code}] {$d->name} ({$d->category?->name}, dáng {$d->silhouette}, chất liệu {$d->material}): Giá thuê ".number_format($d->rental_price).' VNĐ';
        })->implode("\n");

        $serviceLines = Service::query()->where('is_active', true)->get()->map(function (Service $s) {
            return "- {$s->name}: Từ ".number_format($s->price_from).' VNĐ - '.$s->short_description;
        })->implode("\n");

        $faqLines = ChatbotFaq::query()->where('is_active', true)->orderBy('sort_order')->get()->map(function (ChatbotFaq $f) {
            return "Hỏi: {$f->question}\nĐáp: {$f->answer}";
        })->implode("\n\n");

        $hotline = $settings['hotline'] ?? '0901 234 567';
        $address = $settings['address'] ?? 'TP. Hồ Chí Minh';

        return "Thông tin cửa hàng: Hotline {$hotline}, Địa chỉ {$address}.\n\nVÁY CƯỚI:\n{$dressLines}\n\nDỊCH VỤ:\n{$serviceLines}\n\nCÂU HỎI THƯỜNG GẶP:\n{$faqLines}";
    }

    private function fallbackGroundedReply(string $message, $dresses, array $settings): string
    {
        $lower = mb_strtolower($message);

        // Check FAQs by keyword
        $faqs = ChatbotFaq::query()->where('is_active', true)->orderBy('sort_order')->get();
        foreach ($faqs as $faq) {
            $keywords = array_filter(array_map('trim', explode(',', mb_strtolower((string) $faq->keywords))));
            foreach ($keywords as $kw) {
                if ($kw !== '' && str_contains($lower, $kw)) {
                    return $faq->answer."\n\nBạn có muốn mình hỗ trợ đặt lịch thử váy tại BellaBridal không ạ?";
                }
            }
        }

        if ($dresses->isNotEmpty() && (str_contains($lower, 'váy') || str_contains($lower, 'mẫu') || str_contains($lower, 'thử'))) {
            $names = $dresses->map(fn ($d) => "• {$d->name} ({$d->code}) - Giá thuê ".number_format($d->rental_price).' VNĐ')->implode("\n");
            return "Dựa trên nhu cầu của bạn, BellaBridal xin gợi ý một số thiết kế nổi bật:\n{$names}\n\nBạn có thể nhấn vào từng mẫu bên dưới để xem chi tiết hoặc đặt lịch thử váy trực tiếp nhé!";
        }

        $hotline = $settings['hotline'] ?? '0901 234 567';
        return "Cảm ơn bạn đã quan tâm đến BellaBridal! Để được tư vấn chính xác nhất theo vóc dáng và ngân sách, bạn có thể đặt lịch thử váy miễn phí tại trang Đặt Lịch hoặc kết nối trực tiếp với chuyên viên qua Zalo / Hotline {$hotline} ạ.";
    }

    private function shouldSuggestHandoff(string $userMessage, string $reply): bool
    {
        $lower = mb_strtolower($userMessage);
        return str_contains($lower, 'nhân viên') || str_contains($lower, 'tư vấn viên') || str_contains($lower, 'zalo') || str_contains($reply, 'Hotline');
    }
}
