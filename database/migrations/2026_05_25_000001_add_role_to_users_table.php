<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 'customer' included so fresh installs (and SQLite test DBs,
            // which enforce ENUM via CHECK) accept the buyer role from the
            // start. Existing databases are extended by migration
            // 2026_09_23_000000_add_customer_to_users_role_enum.
            $table->enum('role', ['super_admin', 'kasir', 'customer'])->default('kasir')->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
