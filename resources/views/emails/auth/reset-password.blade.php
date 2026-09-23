@component('mail::message')
<div style="padding: 8px 0 20px;">
<span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#0f172a;color:#67e8f9;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;">{{ config('app.name') }}</span>
</div>

# Password reset request

Hello {{ $name }},

We received a request to reset the password for your **{{ $roleLabel }}** account. Use the secure button below to create a new password.

@component('mail::button', ['url' => $resetUrl])
Reset password
@endcomponent

This link expires in {{ $expiresMinutes }} minutes. If it expires, request a fresh reset from the login screen.

@if($isAdmin)
Super admin password recovery is restricted to another super admin to keep the TOKOTOKI workspace secure.
@endif

If you did not request this reset, you can safely ignore this email.

Thanks,
{{ config('app.name') }}
@endcomponent
