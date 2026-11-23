<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_description', 500);
            $table->text('description');
            $table->unsignedBigInteger('price_from')->default(0);
            $table->unsignedBigInteger('price_to')->nullable();
            $table->string('price_unit', 50)->default('VNĐ');
            $table->string('duration_note')->nullable();
            $table->string('image')->nullable();
            $table->string('icon', 50)->default('Sparkles');
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->timestamps();
        });

        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code', 24)->unique();
            $table->string('customer_name');
            $table->string('customer_phone', 20)->index();
            $table->string('customer_email')->nullable();
            $table->date('appointment_date')->index();
            $table->string('time_slot', 20);
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignId('dress_id')->nullable()->constrained('dresses')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending')->index();
            $table->unsignedBigInteger('estimated_revenue')->default(0);
            $table->text('admin_note')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();

            $table->index(['appointment_date', 'time_slot', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('services');
    }
};
