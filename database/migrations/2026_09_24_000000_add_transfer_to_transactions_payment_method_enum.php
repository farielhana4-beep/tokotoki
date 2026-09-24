<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Allow manual bank-transfer payments on transactions without touching
     * existing data. Mirrors the pattern used for the users.role extension.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $table = app('db')->getTablePrefix().'transactions';

        DB::statement(
            "ALTER TABLE `{$table}` MODIFY `payment_method` ENUM('cash', 'qris', 'transfer') NOT NULL DEFAULT 'cash'"
        );
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // Only shrink the ENUM back when no transfer rows exist, otherwise
        // existing data would be truncated.
        $transfers = DB::table('transactions')->where('payment_method', 'transfer')->count();

        if ($transfers === 0 && Schema::hasColumn('transactions', 'payment_method')) {
            $table = app('db')->getTablePrefix().'transactions';

            DB::statement(
                "ALTER TABLE `{$table}` MODIFY `payment_method` ENUM('cash', 'qris') NOT NULL DEFAULT 'cash'"
            );
        }
    }
};
