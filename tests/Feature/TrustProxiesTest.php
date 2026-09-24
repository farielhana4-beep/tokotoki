<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrustProxiesTest extends TestCase
{
    use RefreshDatabase;

    public function test_proxied_https_requests_generate_https_urls(): void
    {
        // Simulates Railway's edge proxy: plain HTTP internally plus
        // X-Forwarded-Proto. The app must generate https asset URLs.
        $response = $this->call(
            'GET',
            '/',
            [],
            [],
            [],
            [
                'REMOTE_ADDR' => '10.0.0.5',
                'HTTP_X_FORWARDED_PROTO' => 'https',
                'HTTP_X_FORWARDED_FOR' => '203.0.113.10',
            ]
        );

        $response->assertOk();
        $this->assertStringContainsString('https://', $response->getContent());
    }

    public function test_plain_local_requests_keep_http_urls(): void
    {
        config()->set('app.url', 'http://tokotoki.test');

        $response = $this->get('/');

        $response->assertOk();
        // App-generated asset URLs stay http; only third-party URLs (fonts)
        // legitimately use https.
        $this->assertStringContainsString('http://tokotoki.test/build', $response->getContent());
        $this->assertStringNotContainsString('https://tokotoki.test', $response->getContent());
    }
}
