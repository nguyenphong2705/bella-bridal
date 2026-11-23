<?php

use App\Http\Controllers\Api\V1\Admin\AdminAppointmentController;
use App\Http\Controllers\Api\V1\Admin\AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\AdminChatbotController;
use App\Http\Controllers\Api\V1\Admin\AdminCustomerController;
use App\Http\Controllers\Api\V1\Admin\AdminDressController;
use App\Http\Controllers\Api\V1\Admin\AdminPostController;
use App\Http\Controllers\Api\V1\Admin\AdminReviewController;
use App\Http\Controllers\Api\V1\Admin\AdminServiceController;
use App\Http\Controllers\Api\V1\Admin\AdminSettingController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BlogPostController;
use App\Http\Controllers\Api\V1\ChatbotController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\DressController;
use App\Http\Controllers\Api\V1\HomeController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\SettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:api')->group(function () {
    Route::get('/health', fn () => response()->json(['status' => 'ok', 'app' => 'BellaBridal API']));

    // Public endpoints
    Route::get('/home', [HomeController::class, 'index']);
    Route::get('/settings/public', [SettingController::class, 'publicSettings']);
    Route::get('/categories', [DressController::class, 'categories']);
    Route::get('/dresses', [DressController::class, 'index']);
    Route::get('/dresses/{slug}', [DressController::class, 'show']);
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{slug}', [ServiceController::class, 'show']);
    Route::get('/posts', [BlogPostController::class, 'index']);
    Route::get('/posts/{slug}', [BlogPostController::class, 'show']);
    Route::get('/reviews', [ContactController::class, 'reviews']);

    // Online booking
    Route::get('/appointments/availability', [AppointmentController::class, 'availability']);
    Route::post('/appointments', [AppointmentController::class, 'store'])->middleware('throttle:booking');

    // Contact form
    Route::post('/contacts', [ContactController::class, 'store'])->middleware('throttle:booking');

    // AI Chatbot
    Route::post('/chatbot/message', [ChatbotController::class, 'sendMessage'])->middleware('throttle:chatbot');
    Route::post('/chatbot/handoff', [ChatbotController::class, 'handoff'])->middleware('throttle:chatbot');
    Route::get('/chatbot/history', [ChatbotController::class, 'history']);

    // Authentication
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

    // Protected Admin & Staff routes
    Route::middleware(['auth:sanctum', 'role:admin,staff'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        Route::prefix('admin')->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index']);

            Route::apiResource('/dresses', AdminDressController::class)->except(['show']);
            Route::post('/dresses/{dress}/images', [AdminDressController::class, 'uploadImages']);
            Route::delete('/dresses/images/{image}', [AdminDressController::class, 'deleteImage']);

            Route::apiResource('/categories', AdminCategoryController::class)->except(['show']);
            Route::apiResource('/appointments', AdminAppointmentController::class)->only(['index', 'update', 'destroy']);
            Route::apiResource('/services', AdminServiceController::class)->except(['show']);
            Route::apiResource('/posts', AdminPostController::class)->except(['show']);
            Route::apiResource('/reviews', AdminReviewController::class)->except(['show']);

            Route::get('/customers', [AdminCustomerController::class, 'index']);

            // Only admin can modify global site settings
            Route::middleware('role:admin')->group(function () {
                Route::get('/settings', [AdminSettingController::class, 'index']);
                Route::put('/settings', [AdminSettingController::class, 'update']);
            });

            Route::get('/chatbot/sessions', [AdminChatbotController::class, 'sessions']);
            Route::get('/chatbot/faqs', [AdminChatbotController::class, 'faqs']);
            Route::post('/chatbot/faqs', [AdminChatbotController::class, 'storeFaq']);
            Route::put('/chatbot/faqs/{faq}', [AdminChatbotController::class, 'updateFaq']);
            Route::delete('/chatbot/faqs/{faq}', [AdminChatbotController::class, 'destroyFaq']);
        });
    });
});
