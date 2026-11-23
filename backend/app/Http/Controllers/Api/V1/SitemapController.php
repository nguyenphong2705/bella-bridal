<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Dress;
use App\Models\Service;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function sitemap(): Response
    {
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');

        $staticRoutes = [
            ['loc' => $frontendUrl.'/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => $frontendUrl.'/bo-suu-tap', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['loc' => $frontendUrl.'/dich-vu', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['loc' => $frontendUrl.'/dat-lich', 'priority' => '0.9', 'changefreq' => 'weekly'],
            ['loc' => $frontendUrl.'/gioi-thieu', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['loc' => $frontendUrl.'/blog', 'priority' => '0.8', 'changefreq' => 'daily'],
            ['loc' => $frontendUrl.'/lien-he', 'priority' => '0.7', 'changefreq' => 'monthly'],
        ];

        $urls = $staticRoutes;

        foreach (Dress::query()->active()->select('slug', 'updated_at')->get() as $dress) {
            $urls[] = [
                'loc' => $frontendUrl.'/vay-cuoi/'.$dress->slug,
                'lastmod' => $dress->updated_at->toAtomString(),
                'priority' => '0.8',
                'changefreq' => 'weekly',
            ];
        }

        foreach (Service::query()->where('is_active', true)->select('slug', 'updated_at')->get() as $service) {
            $urls[] = [
                'loc' => $frontendUrl.'/dich-vu#'.$service->slug,
                'lastmod' => $service->updated_at->toAtomString(),
                'priority' => '0.7',
                'changefreq' => 'monthly',
            ];
        }

        foreach (BlogPost::query()->where('status', 'published')->select('slug', 'updated_at')->get() as $post) {
            $urls[] = [
                'loc' => $frontendUrl.'/blog/'.$post->slug,
                'lastmod' => $post->updated_at->toAtomString(),
                'priority' => '0.7',
                'changefreq' => 'monthly',
            ];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= '    <loc>'.htmlspecialchars($url['loc'], ENT_XML1)."</loc>\n";
            if (! empty($url['lastmod'])) {
                $xml .= "    <lastmod>{$url['lastmod']}</lastmod>\n";
            }
            $xml .= "    <changefreq>{$url['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$url['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }
        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    public function robots(): Response
    {
        $appUrl = rtrim(config('app.url', 'http://localhost:8000'), '/');
        $content = "User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: {$appUrl}/sitemap.xml\n";

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }
}
