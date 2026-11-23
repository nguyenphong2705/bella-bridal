<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\BlogPost;
use App\Models\ChatbotFaq;
use App\Models\Dress;
use App\Models\DressCategory;
use App\Models\DressImage;
use App\Models\Review;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users (Admin & Staff)
        $admin = User::updateOrCreate(
            ['email' => 'admin@bellabridal.vn'],
            [
                'name' => 'Quản trị viên BellaBridal',
                'phone' => '0901234567',
                'password' => Hash::make('Bella@2026!'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'stylist@bellabridal.vn'],
            [
                'name' => 'Minh Anh - Bridal Stylist',
                'phone' => '0907654321',
                'password' => Hash::make('Stylist@2026!'),
                'role' => 'staff',
                'is_active' => true,
            ]
        );

        // 2. Dress Categories (6 danh mục theo yêu cầu)
        $categoriesData = [
            [
                'name' => 'Váy cưới công chúa',
                'slug' => 'vay-cuoi-cong-chua',
                'description' => 'Thiết kế tùng xòe bồng bềnh cổ điển, đính kết pha lê và ren thủ công tinh xảo tôn vòng eo.',
                'image' => 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80',
                'sort_order' => 1,
            ],
            [
                'name' => 'Váy cưới chữ A',
                'slug' => 'vay-cuoi-chu-a',
                'description' => 'Phom dáng chữ A thanh lịch, che khuyết điểm tinh tế và phù hợp với mọi vóc dáng cô dâu.',
                'image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
                'sort_order' => 2,
            ],
            [
                'name' => 'Váy cưới đuôi cá',
                'slug' => 'vay-cuoi-duoi-ca',
                'description' => 'Đường cắt ôm sát tôn vinh đường cong quyến rũ, phần đuôi xòe mềm mại đầy kiêu sa.',
                'image' => 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80',
                'sort_order' => 3,
            ],
            [
                'name' => 'Váy cưới tối giản',
                'slug' => 'vay-cuoi-toi-gian',
                'description' => 'Chất liệu lụa Satin và Mikado cao cấp với đường cắt may chuẩn xác theo phong cách Minimalist.',
                'image' => 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=900&q=80',
                'sort_order' => 4,
            ],
            [
                'name' => 'Váy cưới cao cấp',
                'slug' => 'vay-cuoi-cao-cap',
                'description' => 'Bộ sưu tập Haute Couture giới hạn, nhập khẩu chất liệu từ Pháp và Ý, đính kết hàng trăm giờ.',
                'image' => 'https://images.unsplash.com/photo-1546193430-c2d207739ed7?auto=format&fit=crop&w=900&q=80',
                'sort_order' => 5,
            ],
            [
                'name' => 'Váy cưới truyền thống',
                'slug' => 'vay-cuoi-truyen-thong',
                'description' => 'Áo dài cưới gấm lụa thêu tay, kết hợp nét đẹp văn hóa Á Đông và phom dáng hiện đại.',
                'image' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
                'sort_order' => 6,
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $item) {
            $categories[$item['slug']] = DressCategory::updateOrCreate(
                ['slug' => $item['slug']],
                $item + ['is_active' => true]
            );
        }

        // 3. Dresses
        $dressesData = [
            [
                'category_slug' => 'vay-cuoi-cong-chua',
                'code' => 'BB-PC01',
                'name' => 'Aurelia Royal Ballgown',
                'slug' => 'aurelia-royal-ballgown',
                'description' => 'Thiết kế váy cưới công chúa trễ vai quyến rũ, thân áo corset định hình eo thon gọn kết hợp tùng voan lưới Pháp nhiều lớp bồng bềnh. Phù hợp với lễ đường khách sạn sang trọng.',
                'material' => 'Voan lưới Pháp, Ren Chantilly, Pha lê Swarovski',
                'silhouette' => 'Công chúa (Ballgown)',
                'style' => 'Lãng mạn cổ điển',
                'color' => 'Trắng ngà Ivory',
                'rental_price' => 14500000,
                'sale_price' => 38000000,
                'is_featured' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85',
                ],
            ],
            [
                'category_slug' => 'vay-cuoi-cong-chua',
                'code' => 'BB-PC02',
                'name' => 'Seraphina Crystal Dream',
                'slug' => 'seraphina-crystal-dream',
                'description' => 'Mẫu váy công chúa tay dài xuyên thấu đính hoa 3D thủ công, mang lại vẻ đẹp ngọt ngào, kín đáo mà vẫn lộng lẫy dưới ánh đèn tiệc tối.',
                'material' => 'Tulle Ý, Hoa ren 3D thêu tay',
                'silhouette' => 'Công chúa (Ballgown)',
                'style' => 'Ngọt ngào tinh khôi',
                'color' => 'Ivory ánh hồng',
                'rental_price' => 16000000,
                'sale_price' => 42000000,
                'is_featured' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1000&q=85',
                ],
            ],
            [
                'category_slug' => 'vay-cuoi-chu-a',
                'code' => 'BB-AL01',
                'name' => 'Celeste Garden A-Line',
                'slug' => 'celeste-garden-a-line',
                'description' => 'Váy cưới chữ A nhẹ nhàng với cổ chữ V thanh thoát, chất liệu ren lá mềm mại rất lý tưởng cho tiệc cưới ngoài trời hoặc sân vườn.',
                'material' => 'Voan tơ, Ren cotton Pháp',
                'silhouette' => 'Chữ A (A-Line)',
                'style' => 'Thanh lịch nhẹ nhàng',
                'color' => 'Trắng ngà Ivory',
                'rental_price' => 9500000,
                'sale_price' => 26000000,
                'is_featured' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1000&q=85',
                ],
            ],
            [
                'category_slug' => 'vay-cuoi-duoi-ca',
                'code' => 'BB-MM01',
                'name' => 'Vivienne Allure Mermaid',
                'slug' => 'vivienne-allure-mermaid',
                'description' => 'Phom đuôi cá ôm trọn đường cong cơ thể, lưng V xẻ sâu tinh tế cùng đuôi váy ren dài 1.5m tạo bước đi uyển chuyển và quyến rũ.',
                'material' => 'Ren Alencon, Lưới co giãn cao cấp',
                'silhouette' => 'Đuôi cá (Mermaid)',
                'style' => 'Quyến rũ hiện đại',
                'color' => 'Trắng kem Cream',
                'rental_price' => 13500000,
                'sale_price' => 35000000,
                'is_featured' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1546193430-c2d207739ed7?auto=format&fit=crop&w=1000&q=85',
                ],
            ],
            [
                'category_slug' => 'vay-cuoi-toi-gian',
                'code' => 'BB-MN01',
                'name' => 'Claire Silk Minimalist',
                'slug' => 'claire-silk-minimalist',
                'description' => 'Váy cưới tối giản chất liệu lụa Mikado nhập khẩu Nhật Bản, điểm nhấn nơ bản lớn phía sau lưng tạo vẻ đẹp vượt thời gian.',
                'material' => 'Lụa Mikado cao cấp',
                'silhouette' => 'Chữ A (A-Line)',
                'style' => 'Tối giản Minimalist',
                'color' => 'Trắng ngà Ivory',
                'rental_price' => 8500000,
                'sale_price' => 24000000,
                'is_featured' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85',
                ],
            ],
            [
                'category_slug' => 'vay-cuoi-cao-cap',
                'code' => 'BB-HC01',
                'name' => 'Empress Victoria Couture',
                'slug' => 'empress-victoria-couture',
                'description' => 'Tuyệt tác Haute Couture thực hiện thủ công hơn 320 giờ với hàng nghìn viên ngọc trai nước ngọt và pha lê ánh hồng Rose Gold.',
                'material' => 'Organza tơ tằm, Pha lê, Ngọc trai',
                'silhouette' => 'Công chúa (Ballgown)',
                'style' => 'Haute Couture xa hoa',
                'color' => 'Champagne Ivory',
                'rental_price' => 28000000,
                'sale_price' => 68000000,
                'is_featured' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1546193430-c2d207739ed7?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1000&q=85',
                ],
            ],
            [
                'category_slug' => 'vay-cuoi-truyen-thong',
                'code' => 'BB-TR01',
                'name' => 'Ngọc Lan Gấm Lụa Áo Dài',
                'slug' => 'ngoc-lan-gam-lua-ao-dai',
                'description' => 'Áo dài cưới truyền thống trên nền lụa tơ tằm trắng ngà, thêu tay họa tiết hoa sen và chim hạc tinh tế cho lễ gia tiên.',
                'material' => 'Lụa tơ tằm Bảo Lộc, Chỉ tơ thêu tay',
                'silhouette' => 'Áo dài truyền thống',
                'style' => 'Truyền thống Á Đông',
                'color' => 'Trắng ngà / Đỏ son',
                'rental_price' => 6500000,
                'sale_price' => 18500000,
                'is_featured' => false,
                'images' => [
                    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85',
                ],
            ],
            [
                'category_slug' => 'vay-cuoi-chu-a',
                'code' => 'BB-AL02',
                'name' => 'Juliette Satin Off-Shoulder',
                'slug' => 'juliette-satin-off-shoulder',
                'description' => 'Váy chữ A trễ vai bằng lụa Satin mềm mại có túi ẩn hai bên tiện lợi, tôn lên bờ vai thanh mảnh của cô dâu.',
                'material' => 'Lụa Satin Hàn Quốc',
                'silhouette' => 'Chữ A (A-Line)',
                'style' => 'Tối giản Minimalist',
                'color' => 'Trắng ngà Ivory',
                'rental_price' => 10500000,
                'sale_price' => 29000000,
                'is_featured' => false,
                'images' => [
                    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=85',
                ],
            ],
        ];

        foreach ($dressesData as $item) {
            $images = $item['images'];
            unset($item['images']);
            $category = $categories[$item['category_slug']];
            unset($item['category_slug']);

            $dress = Dress::updateOrCreate(
                ['code' => $item['code']],
                $item + [
                    'category_id' => $category->id,
                    'status' => 'active',
                    'meta_title' => $item['name'].' | Thuê váy cưới cao cấp BellaBridal',
                    'meta_description' => $item['description'],
                ]
            );

            if ($dress->images()->count() === 0) {
                foreach ($images as $idx => $url) {
                    DressImage::create([
                        'dress_id' => $dress->id,
                        'image_url' => $url,
                        'alt_text' => $dress->name.' - Váy cưới BellaBridal '.($idx + 1),
                        'is_primary' => $idx === 0,
                        'sort_order' => $idx,
                    ]);
                }
            }
        }

        // 4. Services (7 dịch vụ theo yêu cầu)
        $servicesData = [
            [
                'name' => 'Cho thuê váy cưới cao cấp',
                'slug' => 'cho-thue-vay-cuoi',
                'short_description' => 'Hơn 250+ thiết kế váy cưới nhập khẩu và thiết kế độc quyền, chỉnh sửa vừa vặn theo số đo cô dâu.',
                'description' => 'Dịch vụ cho thuê váy cưới tại BellaBridal bao gồm tư vấn 1-1 cùng Stylist, chỉnh sửa phom dáng miễn phí theo số đo thực tế, hấp ủi chuẩn studio và bảo quản chuyên nghiệp trước ngày trọng đại.',
                'price_from' => 6500000,
                'price_to' => 28000000,
                'duration_note' => 'Thời gian thuê linh hoạt 3 - 5 ngày',
                'image' => 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80',
                'icon' => 'Sparkles',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'May váy cưới thiết kế riêng',
                'slug' => 'may-vay-cuoi-thiet-ke-rieng',
                'short_description' => 'Sở hữu chiếc váy cưới độc bản được phác thảo và may đo thủ công theo câu chuyện tình yêu của riêng bạn.',
                'description' => 'Nhà thiết kế trực tiếp lấy số đo, tư vấn chất liệu ren Pháp, lụa Ý và dựng phom corset chuẩn xác qua 3 buổi fitting để tạo nên kiệt tác chỉ thuộc về bạn.',
                'price_from' => 22000000,
                'price_to' => 75000000,
                'duration_note' => 'Hoàn thiện trong 4 - 8 tuần',
                'image' => 'https://images.unsplash.com/photo-1546193430-c2d207739ed7?auto=format&fit=crop&w=900&q=80',
                'icon' => 'Scissors',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Chụp ảnh cưới nghệ thuật',
                'slug' => 'chup-anh-cuoi',
                'short_description' => 'Ghi lại khoảnh khắc tình yêu tự nhiên, tinh tế tại Studio tối giản, phim trường hoặc ngoại cảnh Đà Lạt, Phú Quốc.',
                'description' => 'Ekip nhiếp ảnh gia giàu kinh nghiệm định hình concept riêng, ánh sáng điện ảnh tự nhiên và xử lý hậu kỳ màu sắc sang trọng vượt thời gian.',
                'price_from' => 12000000,
                'price_to' => 38000000,
                'duration_note' => 'Trọn gói 1 ngày chụp + Album Photobook',
                'image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
                'icon' => 'Camera',
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Trang điểm cô dâu',
                'slug' => 'trang-diem-co-dau',
                'short_description' => 'Phong cách makeup trong veo Hàn Quốc hoặc sang trọng phương Tây, bền đẹp suốt ngày dài.',
                'description' => 'Sử dụng mỹ phẩm High-end (Charlotte Tilbury, Dior, NARS), tôn vinh đường nét tự nhiên của cô dâu kèm làm tóc và cài phụ kiện đồng bộ với váy cưới.',
                'price_from' => 3500000,
                'price_to' => 8500000,
                'duration_note' => 'Bao gồm làm tóc & dặm phấn tại tiệc',
                'image' => 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
                'icon' => 'Heart',
                'is_featured' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Trang phục chú rể',
                'slug' => 'trang-phuc-chu-re',
                'short_description' => 'Vest cưới Tuxedo và Suit Bespoke may đo chuẩn mực, lịch lãm đồng điệu cùng cô dâu.',
                'description' => 'Đa dạng mẫu Tuxedo đen cổ điển, Suit kem, xám tro hoặc xanh navy chất liệu wool Ý thoáng mát, kèm sơ mi, nơ và cà vạt lụa.',
                'price_from' => 3000000,
                'price_to' => 12000000,
                'duration_note' => 'Thuê hoặc may đo theo số đo',
                'image' => 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
                'icon' => 'UserCheck',
                'is_featured' => false,
                'sort_order' => 5,
            ],
            [
                'name' => 'Phụ kiện cưới cao cấp',
                'slug' => 'phu-kien-cuoi',
                'short_description' => 'Khăn voan (veil) thêu tay, vương miện pha lê, hoa tai ngọc trai và giày cưới thủ công.',
                'description' => 'Hoàn thiện diện mạo cô dâu với bộ sưu tập phụ kiện tuyển chọn, phối hợp hài hòa theo từng dáng váy và kiểu tóc.',
                'price_from' => 800000,
                'price_to' => 4500000,
                'duration_note' => 'Miễn phí đi kèm một số gói thuê váy',
                'image' => 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=900&q=80',
                'icon' => 'Gem',
                'is_featured' => false,
                'sort_order' => 6,
            ],
            [
                'name' => 'Gói dịch vụ cưới trọn gói',
                'slug' => 'goi-dich-vu-cuoi-tron-goi',
                'short_description' => 'Giải pháp toàn diện từ váy cưới ngày tiệc, áo dài gia tiên, vest chú rể, makeup đến chụp ảnh phóng sự.',
                'description' => 'Tiết kiệm đến 25% chi phí với gói All-in-One được thiết kế riêng, có Bridal Concierge đồng hành xuyên suốt từ ngày thử váy đến khi kết thúc tiệc cưới.',
                'price_from' => 29000000,
                'price_to' => 65000000,
                'duration_note' => 'Ưu đãi đặc quyền cho cặp đôi đặt sớm',
                'image' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
                'icon' => 'Crown',
                'is_featured' => true,
                'sort_order' => 7,
            ],
        ];

        foreach ($servicesData as $svc) {
            Service::updateOrCreate(
                ['slug' => $svc['slug']],
                $svc + [
                    'price_unit' => 'VNĐ',
                    'is_active' => true,
                    'meta_title' => $svc['name'].' | BellaBridal Studio',
                    'meta_description' => $svc['short_description'],
                ]
            );
        }

        // 5. Blog Posts
        $postsData = [
            [
                'title' => 'Bí quyết chọn váy cưới hoàn hảo theo từng vóc dáng cô dâu',
                'slug' => 'bi-quyet-chon-vay-cuoi-theo-voc-dang',
                'category' => 'Kinh nghiệm chọn váy cưới',
                'excerpt' => 'Khám phá cách chọn dáng váy chữ A, công chúa hay đuôi cá để tôn lên ưu điểm và che khuyết điểm tinh tế nhất.',
                'content' => "Mỗi cô dâu đều sở hữu nét đẹp riêng biệt. Dáng người đồng hồ cát sẽ tỏa sáng rực rỡ trong mẫu váy đuôi cá ôm sát. Nếu bạn có dáng quả lê với phần hông đầy đặn, váy cưới chữ A hoặc công chúa tùng xòe nhẹ sẽ tạo sự cân đối hoàn hảo.\n\nĐối với cô dâu có vóc dáng nhỏ nhắn, hãy ưu tiên thiết kế eo cao, cổ chữ V thanh thoát và hạn chế chi tiết rườm rà ở phần chân váy để tạo hiệu ứng kéo dài đôi chân.",
                'thumbnail' => 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80',
            ],
            [
                'title' => 'Xu hướng váy cưới Minimalist & Quiet Luxury lên ngôi năm 2026',
                'slug' => 'xu-huong-vay-cuoi-minimalist-2026',
                'category' => 'Xu hướng váy cưới',
                'excerpt' => 'Sự lên ngôi của lụa Satin, Mikado và đường cắt may kiến trúc mang lại vẻ đẹp sang trọng vượt thời gian.',
                'content' => "Không cần quá nhiều pha lê lấp lánh, xu hướng váy cưới 2026 tôn vinh chất liệu thượng hạng và đường cắt may chuẩn xác. Những chiếc váy lụa Mikado trơn kết hợp nơ lưng bản lớn hoặc khăn voan thêu tên cô dâu chú rể đang được giới mộ điệu yêu thích.",
                'thumbnail' => 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=900&q=80',
            ],
            [
                'title' => 'Checklist chuẩn bị đám cưới hoàn hảo trước 6 tháng không lo thiếu sót',
                'slug' => 'checklist-chuan-bi-dam-cuoi-truoc-6-thang',
                'category' => 'Kinh nghiệm chuẩn bị đám cưới',
                'excerpt' => 'Lộ trình chi tiết từng mốc thời gian giúp các cặp đôi chủ động ngân sách, chọn studio và đặt lịch thử váy sớm.',
                'content' => "Thời điểm lý tưởng để bắt đầu thử váy cưới là trước ngày cưới từ 3 đến 5 tháng. Điều này giúp bạn có đủ thời gian lựa chọn mẫu váy ưng ý nhất và chỉnh sửa số đo chuẩn xác trước ngày trọng đại.",
                'thumbnail' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
            ],
            [
                'title' => 'Chọn phong cách trang điểm cô dâu phù hợp với váy cưới và ánh sáng tiệc',
                'slug' => 'bi-quyet-chon-phong-cach-trang-diem-co-dau',
                'category' => 'Bí quyết trang điểm',
                'excerpt' => 'Tiệc ngoài trời ban ngày cần lớp nền trong veo, trong khi tiệc tối khách sạn đòi hỏi điểm nhấn sắc sảo hơn.',
                'content' => "Trang điểm cô dâu cần hài hòa với kiểu dáng váy và không gian tổ chức. Với váy tối giản và tiệc sân vườn, tone cam đào hoặc hồng đất nhẹ nhàng sẽ mang lại vẻ tươi tắn tự nhiên.",
                'thumbnail' => 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
            ],
        ];

        foreach ($postsData as $idx => $post) {
            BlogPost::updateOrCreate(
                ['slug' => $post['slug']],
                $post + [
                    'author_id' => $admin->id,
                    'status' => 'published',
                    'published_at' => now()->subDays(10 - $idx * 2),
                    'meta_title' => $post['title'].' | Tạp chí BellaBridal',
                    'meta_description' => $post['excerpt'],
                ]
            );
        }

        // 6. Reviews
        $reviewsData = [
            [
                'customer_name' => 'Ngọc Hân & Minh Tuấn',
                'service_used' => 'Gói dịch vụ cưới trọn gói',
                'rating' => 5,
                'content' => 'Không gian BellaBridal thực sự tinh tế và riêng tư. Stylist tư vấn rất có tâm, giúp mình chọn được chiếc váy công chúa Aurelia vừa vặn như may riêng.',
                'wedding_date' => 'Tháng 10/2026',
            ],
            [
                'customer_name' => 'Thảo Vy & Quốc Bảo',
                'service_used' => 'Thuê váy cưới cao cấp & Makeup',
                'rating' => 5,
                'content' => 'Váy lụa Mikado ở đây có chất liệu rất đứng phom, lên hình sang trọng vô cùng. Chuyên viên trang điểm nhẹ nhàng nhưng giữ lớp nền suốt 10 tiếng.',
                'wedding_date' => 'Tháng 09/2026',
            ],
            [
                'customer_name' => 'Khánh Linh & Hoàng Nam',
                'service_used' => 'Chụp ảnh cưới & Áo dài gia tiên',
                'rating' => 5,
                'content' => 'Ekip chụp ảnh rất nhiệt tình, biết cách bắt khoảnh khắc tự nhiên nên hai vợ chồng không hề bị gượng gạo. Rất đáng tin cậy!',
                'wedding_date' => 'Tháng 08/2026',
            ],
        ];

        if (Review::count() === 0) {
            foreach ($reviewsData as $idx => $rev) {
                Review::create($rev + [
                    'is_featured' => true,
                    'is_approved' => true,
                    'sort_order' => $idx + 1,
                ]);
            }
        }

        // 7. Sample Appointments
        if (Appointment::count() === 0) {
            $firstService = Service::first();
            $firstDress = Dress::first();
            Appointment::create([
                'booking_code' => 'BB-20261125-01',
                'customer_name' => 'Nguyễn Thu Hà',
                'customer_phone' => '0912345678',
                'customer_email' => 'thuha@example.com',
                'appointment_date' => now()->addDays(2)->toDateString(),
                'time_slot' => '10:30',
                'service_id' => $firstService?->id,
                'dress_id' => $firstDress?->id,
                'notes' => 'Mong muốn thử thêm 2 mẫu váy chữ A nhẹ nhàng.',
                'status' => 'confirmed',
                'estimated_revenue' => 14500000,
                'confirmed_by' => $admin->id,
                'confirmed_at' => now(),
            ]);

            Appointment::create([
                'booking_code' => 'BB-20261126-02',
                'customer_name' => 'Trần Minh Châu',
                'customer_phone' => '0987654321',
                'customer_email' => 'minhchau@example.com',
                'appointment_date' => now()->addDays(3)->toDateString(),
                'time_slot' => '15:00',
                'service_id' => $firstService?->id,
                'notes' => 'Tư vấn gói cưới trọn gói tháng 12.',
                'status' => 'pending',
                'estimated_revenue' => 29000000,
            ]);
        }

        // 8. Site Settings
        $settings = [
            ['key' => 'brand_name', 'value' => 'BellaBridal', 'group' => 'general'],
            ['key' => 'brand_tagline', 'value' => 'Luxury Wedding Studio & Haute Couture Bridal', 'group' => 'general'],
            ['key' => 'logo_url', 'value' => '', 'group' => 'general'],
            ['key' => 'hotline', 'value' => '0901 234 567', 'group' => 'contact'],
            ['key' => 'email', 'value' => 'concierge@bellabridal.vn', 'group' => 'contact'],
            ['key' => 'address', 'value' => '128 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', 'group' => 'contact'],
            ['key' => 'working_hours', 'value' => '09:00 - 21:00 (Thứ 2 - Chủ Nhật)', 'group' => 'contact'],
            ['key' => 'zalo_url', 'value' => 'https://zalo.me/0901234567', 'group' => 'contact'],
            ['key' => 'zalo_phone', 'value' => '0901234567', 'group' => 'contact'],
            ['key' => 'facebook_url', 'value' => 'https://facebook.com/bellabridal.vn', 'group' => 'contact'],
            ['key' => 'instagram_url', 'value' => 'https://instagram.com/bellabridal.vn', 'group' => 'contact'],
            ['key' => 'google_maps_embed', 'value' => 'https://www.google.com/maps?q=128+Dong+Khoi,+Quan+1,+Ho+Chi+Minh&output=embed', 'group' => 'contact'],
            ['key' => 'seo_title', 'value' => 'BellaBridal | Cửa Hàng Váy Cưới Cao Cấp & Studio Áo Cưới Sang Trọng', 'group' => 'seo'],
            ['key' => 'seo_description', 'value' => 'BellaBridal - Studio áo cưới cao cấp hàng đầu. Cho thuê váy cưới đẹp, may đo thiết kế riêng, chụp ảnh cưới và dịch vụ cưới trọn gói.', 'group' => 'seo'],
            ['key' => 'ga4_id', 'value' => '', 'group' => 'seo'],
            ['key' => 'gsc_verification', 'value' => '', 'group' => 'seo'],
            ['key' => 'chatbot_enabled', 'value' => '1', 'group' => 'chatbot'],
            ['key' => 'chatbot_welcome', 'value' => 'Xin chào nàng dâu tương lai! Mình là trợ lý AI của BellaBridal. Mình có thể hỗ trợ bạn chọn váy cưới theo vóc dáng, báo giá thuê váy, tư vấn gói cưới hoặc hướng dẫn đặt lịch thử váy ngay hôm nay.', 'group' => 'chatbot'],
            ['key' => 'chatbot_system_prompt', 'value' => 'Bạn là chuyên viên tư vấn váy cưới cao cấp của BellaBridal Studio. Luôn xưng hô lịch sự, dịu dàng, sang trọng. Chỉ tư vấn dựa trên dữ liệu váy cưới, dịch vụ và chính sách có sẵn của cửa hàng. Không bịa đặt giá cả hoặc chương trình không có thật. Nếu khách cần tư vấn chuyên sâu hoặc không chắc chắn, hãy mời khách đặt lịch thử váy hoặc liên hệ nhân viên qua Zalo.', 'group' => 'chatbot'],
            ['key' => 'chatbot_max_messages', 'value' => '25', 'group' => 'chatbot'],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }

        // 9. Chatbot FAQs
        $faqs = [
            [
                'question' => 'Giá thuê váy cưới tại BellaBridal là bao nhiêu?',
                'answer' => 'Giá thuê váy cưới tại BellaBridal dao động từ 6.500.000 VNĐ cho dòng truyền thống/tối giản đến 28.000.000 VNĐ cho dòng Haute Couture cao cấp. Mọi mẫu thuê đều được chỉnh sửa số đo vừa vặn miễn phí.',
                'category' => 'pricing',
                'keywords' => 'giá thuê, bao nhiêu tiền, chi phí, bảng giá',
                'sort_order' => 1,
            ],
            [
                'question' => 'Nên đặt lịch thử váy trước ngày cưới bao lâu?',
                'answer' => 'Thời điểm lý tưởng nhất là trước ngày cưới 2 - 4 tháng để bạn có nhiều lựa chọn nhất và kịp chỉnh sửa phom dáng chuẩn xác. Bạn có thể đặt lịch thử váy miễn phí trực tiếp trên website.',
                'category' => 'booking',
                'keywords' => 'đặt lịch, thử váy, bao lâu, thời gian',
                'sort_order' => 2,
            ],
            [
                'question' => 'Cô dâu dáng nhỏ nhắn hoặc tròn trịa nên mặc váy gì?',
                'answer' => 'Cô dâu nhỏ nhắn rất hợp với váy chữ A eo cao hoặc váy tối giản cổ chữ V để tạo cảm giác thanh thoát. Cô dâu có vòng 2 hoặc bắp tay đầy đặn nên chọn váy chữ A tay lỡ hoặc corset định hình kết hợp tùng xòe nhẹ.',
                'category' => 'styling',
                'keywords' => 'vóc dáng, nhỏ nhắn, mập, tròn, gầy, thấp, cao, chọn váy',
                'sort_order' => 3,
            ],
            [
                'question' => 'BellaBridal có dịch vụ cưới trọn gói không?',
                'answer' => 'Có ạ! Gói cưới trọn gói tại BellaBridal từ 29.000.000 VNĐ bao gồm váy cưới ngày tiệc, áo dài gia tiên, vest chú rể, trang điểm cô dâu và chụp ảnh cưới nghệ thuật.',
                'category' => 'services',
                'keywords' => 'trọn gói, combo, chụp ảnh, trang điểm, vest',
                'sort_order' => 4,
            ],
        ];

        if (ChatbotFaq::count() === 0) {
            foreach ($faqs as $faq) {
                ChatbotFaq::create($faq + ['is_active' => true]);
            }
        }
    }
}
