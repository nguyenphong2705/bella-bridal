<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Dress;
use App\Models\DressCategory;
use App\Models\Review;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class HomeController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Cache::remember('home_payload', 300, function () {
            return [
                'categories' => DressCategory::query()
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->get(),
                'featured_dresses' => Dress::query()
                    ->active()
                    ->where('is_featured', true)
                    ->with(['category', 'images'])
                    ->latest()
                    ->limit(6)
                    ->get(),
                'featured_services' => Service::query()
                    ->where('is_active', true)
                    ->where('is_featured', true)
                    ->orderBy('sort_order')
                    ->limit(4)
                    ->get(),
                'reviews' => Review::query()
                    ->where('is_approved', true)
                    ->where('is_featured', true)
                    ->orderBy('sort_order')
                    ->limit(6)
                    ->get(),
                'latest_posts' => BlogPost::query()
                    ->where('status', 'published')
                    ->with('author:id,name')
                    ->latest('published_at')
                    ->limit(3)
                    ->get(),
            ];
        });

        return response()->json($data);
    }
}
