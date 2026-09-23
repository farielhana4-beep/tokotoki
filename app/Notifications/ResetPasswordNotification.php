<?php

namespace App\Notifications;

use App\Enums\UserRole;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $token,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $role = $notifiable->role instanceof UserRole
            ? $notifiable->role
            : UserRole::tryFrom((string) $notifiable->role);

        $resetUrl = route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->email,
        ]);

        return (new MailMessage)
            ->subject('Reset your TOKOTOKI password')
            ->markdown('emails.auth.reset-password', [
                'name' => $notifiable->name,
                'roleLabel' => $role?->label() ?? 'User',
                'resetUrl' => $resetUrl,
                'expiresMinutes' => config('auth.passwords.users.expire', 60),
                'isAdmin' => $role === UserRole::SuperAdmin,
            ]);
    }
}
