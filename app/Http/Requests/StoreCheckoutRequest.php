<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'min:8', 'max:30', 'regex:/^[0-9+()\-\s]+$/'],
            'customer_address' => ['required', 'string', 'max:1000'],
            'payment_method' => ['required', Rule::in([PaymentMethod::Cash->value, PaymentMethod::Transfer->value])],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_name.required' => 'Nama pemesan wajib diisi.',
            'customer_name.string' => 'Nama pemesan harus berupa teks.',
            'customer_name.max' => 'Nama pemesan maksimal 255 karakter.',
            'customer_phone.required' => 'Nomor WhatsApp/telepon wajib diisi.',
            'customer_phone.string' => 'Nomor WhatsApp/telepon harus berupa teks.',
            'customer_phone.min' => 'Nomor WhatsApp/telepon minimal 8 karakter.',
            'customer_phone.max' => 'Nomor WhatsApp/telepon maksimal 30 karakter.',
            'customer_phone.regex' => 'Format nomor WhatsApp/telepon tidak valid.',
            'customer_address.required' => 'Alamat atau catatan pengambilan wajib diisi.',
            'customer_address.string' => 'Alamat atau catatan pengambilan harus berupa teks.',
            'customer_address.max' => 'Alamat atau catatan pengambilan maksimal 1000 karakter.',
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'payment_method.in' => 'Metode pembayaran tidak valid.',
        ];
    }
}
