<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Kasir = 'kasir';
    case Customer = 'customer';

    public static function resolve(self|string|null $role): self
    {
        if ($role instanceof self) {
            return $role;
        }

        return self::tryFrom(strtolower(trim((string) $role))) ?? self::Kasir;
    }

    public static function homeRouteFor(self|string|null $role): string
    {
        return self::resolve($role)->homeRouteName();
    }

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Kasir => 'Kasir',
            self::Customer => 'Pelanggan',
        };
    }

    public function homeRouteName(): string
    {
        return match ($this) {
            self::SuperAdmin => 'admin.dashboard',
            self::Kasir => 'pos.index',
            self::Customer => 'store.home',
        };
    }
}
