<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'invoice_number',
        'source',
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_address',
        'subtotal_price',
        'tax_price',
        'discount_price',
        'total_price',
        'payment_method',
        'payment_status',
        'midtrans_snap_token',
        'cash_received',
        'change_amount',
    ];

    protected function casts(): array
    {
        return [
            'subtotal_price' => 'decimal:2',
            'tax_price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'total_price' => 'decimal:2',
            'cash_received' => 'decimal:2',
            'change_amount' => 'decimal:2',
            'payment_method' => PaymentMethod::class,
            'payment_status' => PaymentStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function receiptItems(): array
    {
        return $this->details->map(fn (TransactionDetail $detail) => [
            'product_id' => $detail->product_id,
            'barcode' => $detail->product?->barcode,
            'name' => $detail->product?->name,
            'quantity' => $detail->quantity,
            'price' => (float) $detail->price,
            'subtotal' => (float) $detail->price * $detail->quantity,
        ])->values()->all();
    }
}
