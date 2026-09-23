<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Allow the customer role on users.role without touching existing data.
     *
     * MySQL enforces the ENUM value list, so it must be extended explicitly.
     * Other drivers (e.g. SQLite used in tests) do not enforce ENUM values,
     * so no schema change is needed there.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $table = app('db')->getTablePrefix().'users';

        DB::statement(
            "ALTER TABLE `{$table}` MODIFY `role` ENUM('super_admin', 'kasir', 'customer') NOT NULL DEFAULT 'kasir'"
        );
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // Only shrink the ENUM back when no customer rows exist, otherwise
        // existing data would be truncated.
        $customers = DB::table('users')->where('role', 'customer')->count();

        if ($customers === 0 && Schema::hasColumn('users', 'role')) {
            $table = app('db')->getTablePrefix().'users';

            DB::statement(
                "ALTER TABLE `{$table}` MODIFY `role` ENUM('super_admin', 'kasir') NOT NULL DEFAULT 'kasir'"
            );
        }
    }
};
