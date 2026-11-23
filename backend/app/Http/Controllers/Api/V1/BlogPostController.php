<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BlogPost::query()
            ->where('status', 'published')
            ->with('author:id,name');

        if ($category = $request->string('category')->toString()) {
            $query->where('category', $category);
        }

        if ($search = trim($request->string('search')->toString())) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->latest('published_at')->paginate(9)
        );
    }

    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::query()
            ->where('status', 'published')
            ->where('slug', $slug)
            ->with('author:id,name')
            ->firstOrFail();

        $post->increment('view_count');

        $related = BlogPost::query()
            ->where('status', 'published')
            ->where('id', '!=', $post->id)
            ->latest('published_at')
            ->limit(3)
            ->get();

        return response()->json([
            'post' => $post,
            'related' => $related,
        ]);
    }
}
