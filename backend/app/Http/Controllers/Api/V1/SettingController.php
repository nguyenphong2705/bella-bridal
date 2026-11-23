<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    public function publicSettings(): JsonResponse
    {
        $settings = Cache::remember('public_site_settings', 300, function () {
            return SiteSetting::query()
                ->whereNotIn('key', ['chatbot_system_prompt'])
                ->pluck('value', 'key')
                ->toArray();
        });

        return response()->json(['data' => $settings]);
    }
}
