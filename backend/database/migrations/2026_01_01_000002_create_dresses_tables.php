<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dress_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('dresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('dress_categories')->cascadeOnDelete();
            $table->string('code', 32)->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('material')->nullable();
            $table->string('silhouette')->nullable()->index();
            $table->string('style')->nullable()->index();
            $table->string('color')->default('Trắng ngà Ivory');
            $table->unsignedBigInteger('rental_price')->default(0)->index();
            $table->unsignedBigInteger('sale_price')->nullable();
            $table->boolean('is_featured')->default(false)->index();
            $table->enum('status', ['active', 'hidden'])->default('active')->index();
            $table->unsignedInteger('view_count')->default(0);
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->timestamps();
        });

        Schema::create('dress_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dress_id')->constrained('dresses')->cascadeOnDelete();
            $table->string('image_url');
            $table->string('alt_text')->nullable();
            $table->boolean('is_primary')->default(false)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dress_images');
        Schema::dropIfExists('dresses');
        Schema::dropIfExists('dress_categories');
    }
};
