<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Dress;
use App\Models\DressCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DressController extends Controller
{
    public function categories(): JsonResponse
    {
        $categories = DressCategory::query()
            ->where('is_active', true)
            ->withCount(['dresses' => fn ($q) => $q->active()])
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $categories]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Dress::query()
            ->active()
            ->with(['category:id,name,slug', 'images']);

        if ($category = $request->string('category')->toString()) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($silhouette = $request->string('silhouette')->toString()) {
            $query->where('silhouette', $silhouette);
        }

        if ($style = $request->string('style')->toString()) {
            $query->where('style', $style);
        }

        if ($request->filled('min_price')) {
            $query->where('rental_price', '>=', (int) $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('rental_price', '<=', (int) $request->input('max_price'));
        }

        if ($search = trim($request->string('search')->toString())) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('material', 'like', "%{$search}%");
            });
        }

        $sort = $request->string('sort')->toString();
        match ($sort) {
            'price_asc' => $query->orderBy('rental_price', 'asc'),
            'price_desc' => $query->orderBy('rental_price', 'desc'),
            'popular' => $query->orderByDesc('view_count'),
            default => $query->orderByDesc('is_featured')->latest(),
        };

        $perPage = min(max((int) $request->input('per_page', 9), 1), 24);

        return response()->json($query->paginate($perPage));
    }

    public function show(string $slug): JsonResponse
    {
        $dress = Dress::query()
            ->active()
            ->where('slug', $slug)
            ->with(['category', 'images'])
            ->firstOrFail();

        $dress->increment('view_count');

        $related = Dress::query()
            ->active()
            ->where('id', '!=', $dress->id)
            ->where('category_id', $dress->category_id)
            ->with(['category:id,name,slug', 'images'])
            ->limit(4)
            ->get();

        return response()->json([
            'dress' => $dress,
            'related' => $related,
        ]);
    }
}
