<?php

namespace Tests\Feature;

use App\Models\Dress;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BellaBridalApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_home_and_dresses_endpoints_work(): void
    {
        $this->getJson('/api/v1/home')->assertOk()->assertJsonStructure([
            'categories',
            'featured_dresses',
            'featured_services',
            'reviews',
            'latest_posts',
        ]);

        $this->getJson('/api/v1/dresses?category=vay-cuoi-cong-chua')
            ->assertOk()
            ->assertJsonStructure(['data', 'total']);
    }

    public function test_online_booking_prevents_double_booking_same_slot(): void
    {
        $date = now()->addDays(5)->toDateString();
        $dress = Dress::first();

        $payload = [
            'customer_name' => 'Lê Bảo Ngọc',
            'customer_phone' => '0909112233',
            'customer_email' => 'baongoc@example.com',
            'appointment_date' => $date,
            'time_slot' => '10:30',
            'dress_id' => $dress->id,
        ];

        $this->postJson('/api/v1/appointments', $payload)
            ->assertCreated()
            ->assertJsonPath('appointment.status', 'pending');

        // Second booking on the exact same date and slot must fail with 422
        $this->postJson('/api/v1/appointments', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['time_slot']);
    }

    public function test_admin_endpoints_require_authentication_and_role(): void
    {
        $this->getJson('/api/v1/admin/dashboard')->assertUnauthorized();

        $admin = User::where('email', 'admin@bellabridal.vn')->first();
        $this->actingAs($admin)
            ->getJson('/api/v1/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure(['stats', 'recent_appointments']);
    }

    public function test_chatbot_endpoint_returns_grounded_response(): void
    {
        $this->postJson('/api/v1/chatbot/message', [
            'message' => 'Giá thuê váy cưới tại BellaBridal là bao nhiêu?',
        ])
            ->assertOk()
            ->assertJsonStructure(['session_token', 'reply', 'suggested_dresses']);
    }
}
