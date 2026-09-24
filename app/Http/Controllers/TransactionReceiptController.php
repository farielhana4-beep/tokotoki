<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\Report\TransactionReceiptService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionReceiptController extends Controller
{
    public function __construct(private readonly TransactionReceiptService $receipts) {}

    /**
     * Download receipt PDF for staff (kasir, super_admin via route middleware).
     * Customer downloads are handled by CustomerAccountController::storeReceipt
     * with per-owner authorization.
     */
    public function admin(Transaction $transaction): StreamedResponse
    {
        return $this->receipts->download($transaction);
    }
}
