<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('invoice_number')->unique();
            $table->decimal('total_price', 12, 2);
            $table->enum('payment_method', ['cash', 'qris', 'transfer'])->default('cash');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'expired', 'canceled'])->default('pending');
            $table->string('midtrans_snap_token')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
