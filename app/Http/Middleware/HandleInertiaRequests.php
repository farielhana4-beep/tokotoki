<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Services\Settings\SettingsService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = app(SettingsService::class)->frontend();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role instanceof UserRole
                        ? $request->user()->role->value
                    : $request->user()->role,
                ] : null,
            ],
            'settings' => $settings,
            // Controllers use `back()->with('success'|'error'|...)`, which flashes
            // regular session keys. Inertia v2 only auto-exposes data flashed via
            // `Inertia::flash()` (top-level `page.flash`), so expose the regular
            // session flash explicitly as a shared `flash` prop. The frontend
            // (`ToastStack`, POS receipt modal, admin pages) reads
            // `usePage().props.flash`, which was previously always undefined.
            'flash' => fn () => $this->sharedFlash($request),
        ];
    }

    /**
     * Resolve regular Laravel session flash data for Inertia props.
     *
     * @return array<string, mixed>
     */
    private function sharedFlash(Request $request): array
    {
        if (! $request->hasSession()) {
            return [];
        }

        $session = $request->session();

        return array_filter([
            'success' => $session->get('success'),
            'error' => $session->get('error'),
            'message' => $session->get('message'),
            'status' => $session->get('status'),
            'receipt' => $session->get('receipt'),
        ], fn ($value) => $value !== null);
    }
}
