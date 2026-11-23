<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dress;
use App\Models\DressImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminDressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Dress::query()->with(['category:id,name', 'images'])->latest();

        if ($search = trim($request->string('search')->toString())) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateDress($request);
        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']).'-'.Str::lower(Str::random(4));

        $dress = Dress::create($validated);

        if (! empty($request->input('image_urls'))) {
            foreach ((array) $request->input('image_urls') as $idx => $url) {
                if (filter_var($url, FILTER_VALIDATE_URL)) {
                    DressImage::create([
                        'dress_id' => $dress->id,
                        'image_url' => $url,
                        'alt_text' => $dress->name,
                        'is_primary' => $idx === 0,
                        'sort_order' => $idx,
                    ]);
                }
            }
        }

        Cache::forget('home_payload');

        return response()->json(['data' => $dress->load(['category', 'images'])], 201);
    }

    public function update(Request $request, Dress $dress): JsonResponse
    {
        $validated = $this->validateDress($request, $dress->id);
        $dress->update($validated);
        Cache::forget('home_payload');

        return response()->json(['data' => $dress->load(['category', 'images'])]);
    }

    public function destroy(Dress $dress): JsonResponse
    {
        $dress->delete();
        Cache::forget('home_payload');

        return response()->json(['message' => 'Đã xóa mẫu váy cưới.']);
    }

    public function uploadImages(Request $request, Dress $dress): JsonResponse
    {
        $request->validate([
            'images' => ['required_without:image_url', 'array', 'max:8'],
            'images.*' => ['image', 'mimes:jpeg,png,webp,avif', 'max:4096'],
            'image_url' => ['nullable', 'url', 'max:500'],
        ]);

        $created = [];
        $hasPrimary = $dress->images()->where('is_primary', true)->exists();

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $idx => $file) {
                $path = $file->store('dresses', 'public');
                $created[] = DressImage::create([
                    'dress_id' => $dress->id,
                    'image_url' => Storage::url($path),
                    'alt_text' => $dress->name,
                    'is_primary' => ! $hasPrimary && $idx === 0,
                    'sort_order' => $dress->images()->count() + $idx,
                ]);
                $hasPrimary = true;
            }
        } elseif ($request->filled('image_url')) {
            $created[] = DressImage::create([
                'dress_id' => $dress->id,
                'image_url' => $request->input('image_url'),
                'alt_text' => $dress->name,
                'is_primary' => ! $hasPrimary,
                'sort_order' => $dress->images()->count(),
            ]);
        }

        Cache::forget('home_payload');

        return response()->json(['data' => $created], 201);
    }

    public function deleteImage(DressImage $image): JsonResponse
    {
        $image->delete();
        Cache::forget('home_payload');

        return response()->json(['message' => 'Đã xóa hình ảnh.']);
    }

    private function validateDress(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'category_id' => ['required', 'integer', 'exists:dress_categories,id'],
            'code' => ['required', 'string', 'max:32', 'unique:dresses,code,'.$ignoreId],
            'name' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:220', 'unique:dresses,slug,'.$ignoreId],
            'description' => ['nullable', 'string'],
            'material' => ['nullable', 'string', 'max:200'],
            'silhouette' => ['nullable', 'string', 'max:100'],
            'style' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:100'],
            'rental_price' => ['required', 'integer', 'min:0'],
            'sale_price' => ['nullable', 'integer', 'min:0'],
            'is_featured' => ['boolean'],
            'status' => ['required', 'in:active,hidden'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);
    }
}
