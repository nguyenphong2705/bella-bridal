<?php

use App\Http\Controllers\Api\V1\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['name' => 'BellaBridal API', 'version' => '1.0.0']));
Route::get('/sitemap.xml', [SitemapController::class, 'sitemap']);
Route::get('/robots.txt', [SitemapController::class, 'robots']);
