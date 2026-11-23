<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminPostController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(BlogPost::with('author:id,name')->latest()->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:220'],
            'slug' => ['nullable', 'string', 'max:240', 'unique:blog_posts,slug'],
            'category' => ['required', 'string', 'max:100'],
            'excerpt' => ['required', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'thumbnail' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'in:draft,published'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['title']).'-'.Str::lower(Str::random(4));
        $validated['author_id'] = $request->user()->id;
        if ($validated['status'] === 'published') {
            $validated['published_at'] = now();
        }

        $post = BlogPost::create($validated);
        Cache::forget('home_payload');

        return response()->json(['data' => $post], 201);
    }

    public function update(Request $request, BlogPost $post): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:220'],
            'category' => ['required', 'string', 'max:100'],
            'excerpt' => ['required', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'thumbnail' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'in:draft,published'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validated['status'] === 'published' && ! $post->published_at) {
            $validated['published_at'] = now();
        }

        $post->update($validated);
        Cache::forget('home_payload');

        return response()->json(['data' => $post]);
    }

    public function destroy(BlogPost $post): JsonResponse
    {
        $post->delete();
        Cache::forget('home_payload');

        return response()->json(['message' => 'Đã xóa bài viết.']);
    }
}
